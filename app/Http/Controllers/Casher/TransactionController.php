<?php

namespace App\Http\Controllers\Casher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Casher\TransactionRequest;
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
            ->where('assigned_to', Auth::id())
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', ['active', 'pending'])->exists();
            })
            ->with(['fromCurrency', 'toCurrency'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success('Pending transactions retrieved successfully.', [
            'transactions' => $transactions,
        ]);
    }

    public function completeStatus($id)
    {
        $transaction = Transaction::findOrFail($id);
        $this->authorize('complete', $transaction);

        $this->transactionService->confirmCashMovement($transaction);

        $transaction->update(['status' => 'completed']);

        return $this->success('Transaction status changed to completed.', [
            'transaction' => $transaction,
        ]);
    }
}
