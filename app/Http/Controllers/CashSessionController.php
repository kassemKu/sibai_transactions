<?php

namespace App\Http\Controllers;

use App\Http\Requests\CloseCashSessionRequest;
use App\Models\CashSession;
use App\Models\Currency;
use App\Services\CashSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CashSessionController extends Controller
{
    protected $service;

    public function __construct(CashSessionService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $cashSessions = CashSession::with([
            'cashBalances',
            'transactions.createdBy',
            'transactions.assignedTo',
            'transactions.fromCurrency',
            'transactions.toCurrency',
            'openedBy',
            'closedBy',
        ])
            ->orderBy('opened_at', 'desc')
            ->paginate(10);

        $currencies = Currency::all();

        return inertia('CashSessions/Index')->with([
            'cashSessions' => $cashSessions,
            'currencies' => $currencies,
        ]);
    }

    public function show(CashSession $cashSession)
    {
        $currencies = Currency::all();

        return inertia('CashSessions/Show')->with([
            'cashSession' => $cashSession->load([
                'cashBalances',
                'transactions.createdBy',
                'transactions.assignedTo',
                'transactions.fromCurrency',
                'transactions.toCurrency',
                'openedBy',
                'closedBy',
            ]),
            'currencies' => $currencies,
        ]);
    }

    public function open(): JsonResponse
    {
        $cashSession = $this->service->openCashSession(Auth::user());

        return $this->success('Cash session opened successfully.', [
            'cash_session' => $cashSession,
        ]);
    }

    public function getClosingBalances(): JsonResponse
    {
        $balances = $this->service->getClosingBalances();

        return $this->success('Closing balances retrieved successfully.', [
            'balances' => $balances,
        ]);
    }

    public function pending(): JsonResponse
    {
        $session = CashSession::whereIn('status', ['active'])->first();

        $session->update([
            'status' => 'pending',
        ]);

        return $this->success('Cash session status updated to pending.', [
            'session' => $session->refresh(),
        ]);
    }

    public function close(CloseCashSessionRequest $request): JsonResponse
    {
        $result = $this->service->closeCashSession(Auth::user(), $request->validated(), $session);

        return $this->success('Cash session closed successfully.', [
            'report' => $result,
        ]);
    }
}
