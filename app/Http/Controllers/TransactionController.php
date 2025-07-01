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
            $request->amount
        );

        return response()->json($result);
    }
}
