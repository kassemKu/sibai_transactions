<?php

namespace App\Http\Controllers;

use App\Http\Requests\CloseCashSessionRequest;
use App\Services\CashSessionService;
use Illuminate\Http\JsonResponse;

class CashSessionController extends Controller
{
    protected $service;

    public function __construct(CashSessionService $service)
    {
        $this->service = $service;
    }

    public function open(): JsonResponse
    {
        $cashSession = $this->service->openCashSession(auth()->user());

        return response()->json(['success' => true, 'cash_session' => $cashSession]);
    }

    public function getClosingBalances(): JsonResponse
    {
        $balances = $this->service->getClosingBalances();

        return response()->json(['success' => true, 'balances' => $balances]);
    }

    public function close(CloseCashSessionRequest $request): JsonResponse
    {
        $result = $this->service->closeCashSession(auth()->user(), $request->validated());

        return response()->json(['success' => true, 'report' => $result]);
    }
}