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
        if (! $currentSession) {
            throw new \Exception('Cannot record transaction. No open cash session.');
        }
        $transaction = $this->transactionService->createTransaction($request->validated(), $currentSession);

        return $transaction;
    }

    public function pendingTransactions()
    {
        $transactions = Transaction::where('status', 'pending')
            ->where(function ($query) {
                $query->whereNot('user_id', Auth::id())
                    ->orWhere('assigned_to', Auth::id());
            })
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', ['active', 'pending'])->exists();
            })
            ->with(['fromCurrency', 'toCurrency'])
            ->orderBy('created_at', 'desc')
            ->get();

        return back()->with('pending transactions', $transactions);
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

        $response = [
            'calculated_amount' => $result['converted_amount'],
            'original_amount' => $result['original_amount'],
            'from_rate_to_usd' => $result['from_rate_to_usd'],
            'to_rate_to_usd' => $result['to_rate_to_usd'],
            'from_currency_id' => $result['from_currency_id'],
            'to_currency_id' => $result['to_currency_id'],
        ];

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json($response);
        }

        // For Inertia form submissions, redirect back with the result
        return back()->with('calculation_result', $response);
    }
}
