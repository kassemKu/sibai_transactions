<?php

namespace App\Http\Controllers\Casher;

use App\Enums\TransactionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Casher\TransactionRequest;
use App\Models\Transaction;
use App\Services\CasherCashSessionService;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function store(TransactionRequest $request)
    {
        $calc = $request->getCalc();

        // Add notes to the calculation data if provided
        if ($request->has('notes') && $request->notes) {
            $calc['notes'] = $request->notes;
        }

        $transaction = $this->transactionService->createTransaction($calc, $request->cash_session);

        return $this->success('Transaction created successfully.', [
            'transaction' => $transaction,
        ]);
    }

    public function confirmStatus(Transaction $transaction, CasherCashSessionService $service, Request $request)
    {
        $this->authorize('complete', $transaction);

        if ($service->getClosingBalanceForCurrency($request->cash_session, $request->casherSession, $transaction->to_currency_id)['system_balance'] < $transaction->converted_amount) {
            return $this->failed('الرصيد غير كافٍ لإتمام المعاملة.');
        }

        $transaction->update([
            'status' => TransactionStatusEnum::COMPLETED->value,
            'closed_by' => auth()->id(),
        ]);

        $this->transactionService->confirmCasherCashMovement($transaction);

        return $this->success('Transaction status changed to completed.', [
            'transaction' => $transaction,
        ]);
    }
}
