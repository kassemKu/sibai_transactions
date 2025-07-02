<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
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
        $transaction = $this->transactionService->createTransaction($request->validated());

        return $transaction;
    }

    public function calc(TransactionCalculateRequest $request, TransactionService $service)
    {
        $result = $service->calculateCore(
            $request->from_currency_id,
            $request->to_currency_id,
            $request->amount_original
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