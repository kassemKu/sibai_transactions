<?php

namespace App\Services;

use App\Enums\CashMovementTypeEnum;
use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CashBalance;
use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CashSessionService
{
    public function openCashSession($adminUser)
    {
        return DB::transaction(function () use ($adminUser) {
            $session = CashSession::create([
                'opened_at' => now(),
                'opened_by' => $adminUser->id,
                'open_exchange_rates' => json_encode($this->getCurrentExchangeRates()),
                'status' => CashSessionEnum::ACTIVE->value,
            ]);

            $currencies = Currency::all();

            foreach ($currencies as $currency) {
                $lastBalance = CashBalance::where('currency_id', $currency->id)
                    ->orderByDesc('created_at')
                    ->first();

                $openingAmount = $lastBalance
                    ? $lastBalance->actual_closing_balance
                    : 0;

                CashBalance::create([
                    'cash_session_id' => $session->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingAmount,
                ]);
            }

            return $session;
        });
    }

    public function getClosingBalances($session)
    {
        $currencies = Currency::all();
        $balances = [];

        foreach ($currencies as $currency) {
            $opening = CashBalance::where('cash_session_id', $session->id)
                ->where('currency_id', $currency->id)
                ->first()
                ->opening_balance ?? 0;

            $totalIn = CashMovement::where('currency_id', $currency->id)
                ->where('type', CashMovementTypeEnum::IN->value)
                ->where('cash_session_id', $session->id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            $totalOut = CashMovement::where('currency_id', $currency->id)
                ->where('type', CashMovementTypeEnum::OUT->value)
                ->where('cash_session_id', $session->id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            $systemClosing = $opening + $totalIn - $totalOut;

            $balances[] = [
                'currency_id' => $currency->id,
                'currency' => [
                    'id' => $currency->id,
                    'name' => $currency->name,
                    'code' => $currency->code,
                    'rate_to_usd' => $currency->rate_to_usd,
                ],
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
                ]];
            });
    }

    public function closeCashSession($adminUser, array $data, $session)
    {
        return DB::transaction(function () use ($adminUser, $data, $session) {
            $session->update([
                'closed_at' => now(),
                'closed_by' => $adminUser->id,
                'status' => CashSessionEnum::CLOSED->value,
                'close_exchange_rates' => json_encode($this->getCurrentExchangeRates()),
            ]);

            $balances = [];

            foreach ($data['actual_closing_balances'] as $item) {
                $currencyId = $item['currency_id'];
                $actualClosing = $item['amount'];

                $cashBalance = CashBalance::where('cash_session_id', $session->id)
                    ->where('currency_id', $currencyId)
                    ->first();

                $opening = $cashBalance->opening_balance;

                $totalIn = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id))
                    ->where('currency_id', $currencyId)
                    ->where('type', CashMovementTypeEnum::IN->value)
                    ->sum('amount');

                $totalOut = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id))
                    ->where('currency_id', $currencyId)
                    ->where('type', CashMovementTypeEnum::OUT->value)
                    ->sum('amount');

                $systemClosing = $opening + $totalIn - $totalOut;
                $difference = $actualClosing - $systemClosing;

                $balances[] = CashBalance::where('cash_session_id', $session->id)
                    ->where('currency_id', $currencyId)
                    ->update([
                        'total_in' => $totalIn,
                        'total_out' => $totalOut,
                        'closing_balance' => $systemClosing,
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

    public function getSessionUsers($sessionId)
    {
        $userIds = Transaction::where('cash_session_id', $sessionId)
            ->pluck('created_by')
            ->merge(
                Transaction::where('cash_session_id', $sessionId)->pluck('closed_by')
            )
            ->unique()
            ->filter() // Remove nulls
            ->values();

        return User::whereIn('id', $userIds)->get();
    }
}
