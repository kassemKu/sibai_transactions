<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;

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
        $result = array_merge($calc, ['assigned_to' => $request->assigned_to]);
        $transaction = $this->transactionService->createTransaction($result, $request->session);

        return $this->success('Transaction created successfully.', [
            'transaction' => $transaction,
        ]);
    }

    public function completeStatus($id)
    {
        $transaction = Transaction::findOrFail($id);

        $this->transactionService->confirmCashMovement($transaction);

        $transaction->update(['status' => TransactionStatus::COMPLETED->value]);

        return $this->success('Transaction status changed to completed.', [
            'transaction' => $transaction,
        ]);
    }

    public function cancelStatus($id)
    {
        $transaction = Transaction::findOrFail($id);

        $transaction->update(['status' => TransactionStatus::CANCELED->value]);

        return $this->success('Transaction status changed to canceled.', [
            'transaction' => $transaction,
        ]);
    }

    public function calc(TransactionCalculateRequest $request, TransactionService $service)
    {
        $result = $service->calculateCore(
            $request->from_currency_id,
            $request->to_currency_id,
            $request->original_amount
        );

        return $this->success('Calculation result', [
            'calculation_result' => $result,
        ]);
    }
}
