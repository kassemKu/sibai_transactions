<?php

namespace App\Services;

use App\Enums\CashMovementTypeEnum;
use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CasherCashSession;
use App\Models\CashMovement;
use App\Models\Currency;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CasherCashSessionService
{
    public function openCashSession($casherId, $openingBalances, $session)
    {
        $session = CasherCashSession::create([
            'cash_session_id' => $session->id,
            'opened_at' => now(),
            'opened_by' => Auth::id(),
            'opening_balances' => json_encode($openingBalances),
            'casher_id' => $casherId,
            'status' => CashSessionEnum::ACTIVE->value,
        ]);

        return $session;
    }

    public function getClosingBalances($session, $casherSession)
    {
        return DB::transaction(function () use ($session, $casherSession) {
            $currencies = Currency::all();
            $balances = [];

            // Get opening balances as array indexed by currency_id for easy lookup
            $openingBalances = collect($casherSession->opening_balances)->keyBy('currency_id');

            foreach ($currencies as $currency) {
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
