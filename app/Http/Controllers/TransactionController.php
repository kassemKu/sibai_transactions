<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
use App\Models\CashSession;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function store(TransactionRequest $request)
    {
        $currentSession = CashSession::whereIn('status', ['active'])->first();

        $calc = $request->getCalc();

        $transaction = $this->transactionService->createTransaction($calc, $currentSession);

        return $this->success('Transaction created successfully.', [
            'transaction' => $transaction,
        ]);
    }

    public function pendingTransactions()
    {
        $transactions = Transaction::where('status', 'pending')
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', ['active', 'pending']);
            })
            ->where(function ($query) {
                $query->where('assigned_to', Auth::id())
                    ->orWhereNull('assigned_to');
            })
            ->with(['fromCurrency', 'toCurrency'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success('Pending transactions', [
            'transaction' => $transactions,
        ]);
    }

    public function completeStatus($id)
    {
        $transaction = Transaction::findOrFail($id);

        $this->transactionService->confirmCashMovement($transaction);

        $transaction->update(['status' => 'completed']);

        return $this->success('Transaction status changed to completed.', [
            'transaction' => $transaction,
        ]);
    }

    public function cancelStatus($id)
    {
        $transaction = Transaction::findOrFail($id);

        $transaction->update(['status' => 'canceled']);

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
