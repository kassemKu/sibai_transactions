<?php

namespace App\Http\Controllers;

use App\Enums\CashMovementTypeEnum;
use App\Enums\TransactionStatusEnum;
use App\Http\Requests\GetCasherCashMovementsRequest;
use App\Models\CashMovement;

class CashMovementController extends Controller
{
    public function getCasherCashMovements(GetCasherCashMovementsRequest $request)
    {
        $result = CashMovement::where('by', $request->user_id)
            ->where('cash_session_id', $request->cash_session_id)
            ->where(function ($query) {
                $query->where('type', CashMovementTypeEnum::IN->value)
                    ->orWhere('type', CashMovementTypeEnum::OUT->value);
            })
            ->with(['currency', 'transaction', 'by'])
            ->whereHas('transaction', fn ($q) => $q->where('status', TransactionStatusEnum::COMPLETED->value))
            ->get();

        return $result;
    }
}
