<?php

namespace App\Services;

use App\Enums\CashMovementType;
use App\Models\CashBalance;
use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\SessionOpeningBalance;
use Illuminate\Support\Facades\DB;

class CashSessionService
{
    public function openCashSession($adminUser)
    {
        return DB::transaction(function () use ($adminUser) {
            if (CashSession::where('is_closed', false)->exists()) {
                throw new \Exception('A cash session is already open.');
            }

            $session = CashSession::create([
                'opened_at' => now(),
                'opened_by' => $adminUser->id,
                'is_closed' => false,
                'open_exchange_rates' => json_encode($this->getCurrentExchangeRates()),
            ]);

            $currencies = Currency::all();

            foreach ($currencies as $currency) {
                $lastBalance = CashBalance::where('currency_id', $currency->id)
                    ->orderByDesc('created_at')
                    ->first();

                $openingAmount = $lastBalance
                    ? $lastBalance->actual_closing_balance
                    : 0;

                SessionOpeningBalance::create([
                    'cash_session_id' => $session->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingAmount,
                ]);
            }

            return $session;
        });
    }

    public function getClosingBalances()
    {
        $session = CashSession::where('is_closed', false)->first();

        if (!$session) {
            throw new \Exception('No open cash session found.');
        }

        $currencies = Currency::all();
        $balances = [];

        foreach ($currencies as $currency) {
            $opening = SessionOpeningBalance::where('cash_session_id', $session->id)
                ->where('currency_id', $currency->id)
                ->first()
                ->opening_balance ?? 0;

            $totalIn = CashMovement::whereHas('transaction', fn($q) => $q->where('cash_session_id', $session->id))
                ->where('currency_id', $currency->id)
                ->where('type', CashMovementType::IN->value)
                ->sum('amount');

            $totalOut = CashMovement::whereHas('transaction', fn($q) => $q->where('cash_session_id', $session->id))
                ->where('currency_id', $currency->id)
                ->where('type', CashMovementType::OUT->value)
                ->sum('amount');

            $systemClosing = $opening + $totalIn - $totalOut;

            $balances[] = [
                'currency_id' => $currency->id,
                'currency' => $currency,
                'opening_balance' => $opening,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'system_closing_balance' => $systemClosing,
            ];
        }

        return $balances;
    }

    protected function getCurrentExchangeRates()
    {
        return Currency::get()
            ->mapWithKeys(function ($currency) {
                return [$currency->id => [
                    'rate_to_usd' => $currency->rate_to_usd,
                    'margin' => $currency->profit_margin_percent,
                ]];
            });
    }

    public function closeCashSession($adminUser, array $data)
    {
        return DB::transaction(function () use ($adminUser, $data) {
            $session = CashSession::where('is_closed', false)->first();

            if (! $session) {
                throw new \Exception('No open cash session to close.');
            }

            $session->update([
                'closed_at' => now(),
                'closed_by' => $adminUser->id,
                'is_closed' => true,
                'close_exchange_rates' => json_encode($this->getCurrentExchangeRates()),
            ]);

            $balances = [];

            foreach ($data['actual_closing_balances'] as $item) {
                $currencyId = $item['currency_id'];
                $actualClosing = $item['amount'];

                $opening = SessionOpeningBalance::where('cash_session_id', $session->id)
                    ->where('currency_id', $currencyId)
                    ->first()
                    ->opening_balance ?? 0;

                $totalIn = CashMovement::whereHas('transaction', fn($q) => $q->where('cash_session_id', $session->id))
                    ->where('currency_id', $currencyId)
                    ->where('type', CashMovementType::IN->value)
                    ->sum('amount');

                $totalOut = CashMovement::whereHas('transaction', fn($q) => $q->where('cash_session_id', $session->id))
                    ->where('currency_id', $currencyId)
                    ->where('type', CashMovementType::OUT->value)
                    ->sum('amount');

                $systemClosing = $opening + $totalIn - $totalOut;
                $difference = $actualClosing - $systemClosing;

                $balances[] = CashBalance::create([
                    'cash_session_id' => $session->id,
                    'currency_id' => $currencyId,
                    'opening_balance' => $opening,
                    'total_in' => $totalIn,
                    'total_out' => $totalOut,
                    'system_closing_balance' => $systemClosing,
                    'actual_closing_balance' => $actualClosing,
                    'difference' => $difference,
                ]);
            }

            return [
                'session' => $session,
                'balances' => $balances,
            ];
        });
    }
}