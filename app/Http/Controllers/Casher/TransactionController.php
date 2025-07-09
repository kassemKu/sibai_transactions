<?php

namespace App\Http\Controllers\Casher;

use App\Enums\TransactionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Casher\TransactionRequest;
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

        $transaction = $this->transactionService->createTransaction($calc, $request->session);

        return $this->success('Transaction created successfully.', [
            'transaction' => $transaction,
        ]);
    }

    public function confirmStatus(Transaction $transaction)
    {
        $this->authorize('complete', $transaction);

        $this->transactionService->confirmCashMovement($transaction);

        $transaction->update([
            'status' => TransactionStatusEnum::COMPLETED->value,
            'closed_by' => auth()->id(),
        ]);

        return $this->success('Transaction status changed to completed.', [
            'transaction' => $transaction,
        ]);
    }
}
