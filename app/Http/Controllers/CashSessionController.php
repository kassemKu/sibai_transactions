<?php

namespace App\Http\Controllers;

use App\Enums\CashSessionEnum;
use App\Http\Requests\CloseCashSessionRequest;
use App\Models\CashSession;
use App\Services\CashSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'cashBalances.currency',
            'transactions.createdBy',
            'transactions.closedBy',
            'transactions.assignedTo',
            'transactions.fromCurrency',
            'transactions.toCurrency',
            'openedBy',
            'closedBy',
        ])
            ->orderBy('opened_at', 'desc')
            ->paginate(10);

        return inertia('CashSessions/Index')->with([
            'cashSessions' => $cashSessions,
        ]);
    }

    public function show(CashSession $cashSession)
    {
        return inertia('CashSessions/Show')->with([
            'cashSession' => $cashSession->load([
                'cashBalances.currency',
                'transactions.createdBy',
                'transactions.closedBy',
                'transactions.assignedTo',
                'transactions.fromCurrency',
                'transactions.toCurrency',
                'openedBy',
                'closedBy',
            ]),
        ]);
    }

    public function open(): JsonResponse
    {
        $cashSession = $this->service->openCashSession(Auth::user());

        return $this->success('Cash session opened successfully.', [
            'cash_session' => $cashSession,
        ]);
    }

    public function getClosingBalances(Request $request): JsonResponse
    {
        $balances = $this->service->getClosingBalances($request->session);

        return $this->success('Closing balances retrieved successfully.', [
            'balances' => $balances,
        ]);
    }

    public function pending(Request $request): JsonResponse
    {
        $request->session->update([
            'status' => CashSessionEnum::PENDING->value,
        ]);

        return $this->success('Cash session status updated to pending.', [
            'session' => $request->session->refresh(),
        ]);
    }

    public function close(CloseCashSessionRequest $request): JsonResponse
    {
        $result = $this->service->closeCashSession(Auth::user(), $request->validated(), $request->session);

        return $this->success('Cash session closed successfully.', [
            'report' => $result,
        ]);
    }

    public function latest(): JsonResponse
    {
        $cashSession = CashSession::where('status', CashSessionEnum::CLOSED->value)
            ->latest()
            ->first();

        return $this->success('Cash session closed successfully.', [
            'report' => $cashSession->load([
                'cashBalances.currency',
                'transactions.createdBy',
                'transactions.closedBy',
                'transactions.assignedTo',
                'transactions.fromCurrency',
                'transactions.toCurrency',
                'openedBy',
                'closedBy',
            ])->toArray(),
        ]);
    }
}
