<?php

namespace App\Services;

use App\Enums\CashMovementTypeEnum;
use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CashBalance;
use App\Models\CasherCashSession;
use App\Models\CashMovement;
use App\Models\Currency;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CasherCashSessionService
{
    public function getClosingBalanceForCurrency($session, $casherSession, $currencyId)
    {
        return DB::transaction(function () use ($session, $casherSession, $currencyId) {
            $currency = Currency::find($currencyId);
            if (! $currency) {
                return null;
            }

            $openingBalances = collect($casherSession->opening_balances)->keyBy('currency_id');
            $opening = $openingBalances[$currency->id]['amount'] ?? 0;

            $totalIn = CashMovement::where('currency_id', $currency->id)
                ->where('by', $casherSession->casher_id)
                ->where('type', CashMovementTypeEnum::IN->value)
                ->where('cash_session_id', $session->id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            $totalOut = CashMovement::where('currency_id', $currency->id)
                ->where('by', $casherSession->casher_id)
                ->where('type', CashMovementTypeEnum::OUT->value)
                ->where('cash_session_id', $session->id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            $systemClosing = $opening + $totalIn - $totalOut;

            return [
                'currency_id' => $currency->id,
                'name' => $currency->name,
                'code' => $currency->code,
                'opening_balance' => $opening,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'system_balance' => $systemClosing,
            ];
        });
    }

    public function openCashSession($data)
    {
        // Subtract amounts from CashBalance opening_balance for each currency
        foreach ($data->opening_balances as $balance) {
            $currencyId = $balance['currency_id'];
            $amount = $balance['amount'];
            $cashBalance = CashBalance::where('cash_session_id', $data->session->id)
                ->where('currency_id', $currencyId)
                ->first();
            if ($cashBalance) {
                $cashBalance->opening_balance = $cashBalance->opening_balance - $amount;
                $cashBalance->save();
            }
        }

        $session = CasherCashSession::create([
            'cash_session_id' => $data->session->id,
            'opened_at' => now(),
            'opened_by' => Auth::id(),
            'opening_balances' => json_encode($data->opening_balances),
            'casher_id' => $data->casher_id,
            'status' => CashSessionEnum::ACTIVE->value,
            'transfers' => $data->transfers,
        ]);

        return $session;
    }

    public function getClosingBalances($casherSession)
    {
        return DB::transaction(function () use ($casherSession) {
            $currencies = Currency::all();
            $balances = [];

            $openingBalances = collect($casherSession->opening_balances)->keyBy('currency_id');

            foreach ($currencies as $currency) {
                $opening = $openingBalances[$currency->id]['amount'] ?? 0;

                $totalIn = CashMovement::where('currency_id', $currency->id)
                    ->where('by', $casherSession->casher_id)
                    ->where('type', CashMovementTypeEnum::IN->value)
                    ->where('cash_session_id', $casherSession->cash_session_id)
                    ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                    ->sum('amount');

                $totalOut = CashMovement::where('currency_id', $currency->id)
                    ->where('by', $casherSession->casher_id)
                    ->where('type', CashMovementTypeEnum::OUT->value)
                    ->where('cash_session_id', $casherSession->cash_session_id)
                    ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                    ->sum('amount');

                $systemClosing = $opening + $totalIn - $totalOut;

                $balances[] = [
                    'currency_id' => $currency->id,
                    'name' => $currency->name,
                    'code' => $currency->code,
                    'opening_balance' => $opening,
                    'total_in' => $totalIn,
                    'total_out' => $totalOut,
                    'system_balance' => $systemClosing,
                ];
            }

            return [
                'system_closing_balances' => $balances,
            ];
        });
    }
}
