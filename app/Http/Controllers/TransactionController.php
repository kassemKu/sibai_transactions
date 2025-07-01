<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
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

        return new TransactionResource($transaction);
    }

    public function calc(TransactionCalculateRequest $request, TransactionService $service)
    {
        $result = $service->calculateConversion(
            $request->from_currency_id,
            $request->to_currency_id,
            $request->amount_original ?? $request->amount
        );

        // Format the response for the frontend
        $response = [
            'calculated_amount' => $result['converted_amount'],
            'original_amount' => $result['original_amount'],
            'exchange_rate' => $result['exchange_rate_to_used'],
            'profit_usd' => $result['profit_usd'],
        ];

        // For Inertia, we can return JSON response for AJAX calls
        // or redirect back with the result
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json($response);
        }

        // For Inertia form submissions, redirect back with the result
        return back()->with('calculation_result', $response);
    }
}