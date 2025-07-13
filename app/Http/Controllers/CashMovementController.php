<?php

namespace App\Http\Controllers;

use App\Enums\CashMovementTypeEnum;
use App\Enums\TransactionStatusEnum;
use App\Http\Requests\GetCasherCashMovementsRequest;
use App\Models\CashMovement;
use App\Models\Currency;

class CashMovementController extends Controller
{
    public function getCasherCashMovements(GetCasherCashMovementsRequest $request)
    {
        $currencies = Currency::all();
        $balances = [];

        foreach ($currencies as $currency) {
            // $opening = CashBalance::where('cash_session_id', $session->id)
            //     ->where('currency_id', $currency->id)
            //     ->first()
            //     ->opening_balance ?? 0;

            $totalIn = CashMovement::where('currency_id', $currency->id)
                ->where('by', $request->user_id)
                ->where('type', CashMovementTypeEnum::IN->value)
                ->where('cash_session_id', $request->cash_session_id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            $totalOut = CashMovement::where('currency_id', $currency->id)
                ->where('by', $request->user_id)
                ->where('type', CashMovementTypeEnum::OUT->value)
                ->where('cash_session_id', $request->cash_session_id)
                ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
                ->sum('amount');

            // $systemClosing = $opening + $totalIn - $totalOut;
            $systemClosing = $totalIn - $totalOut;

            $balances[] = [
                'currency_id' => $currency->id,
                'name' => $currency->name,
                'code' => $currency->code,
                // 'opening_balance' => $opening,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'system_balance' => $systemClosing,
            ];
        }

        return $balances;
    }
}
