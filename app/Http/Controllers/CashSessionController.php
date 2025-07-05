<?php

namespace App\Http\Controllers;

use App\Http\Requests\CloseCashSessionRequest;
use App\Models\CashSession;
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
        $cashSessions = CashSession::with(['openingBalances', 'cashBalances', 'transactions', 'openedBy', 'closedBy'])
            ->orderBy('opened_at', 'desc')
            ->paginate(10);

        return inertia('CashSessions/Index')->with([
            'cashSessions' => $cashSessions,
        ]);
    }

    public function show(CashSession $cashSession)
    {
        return inertia('CashSessions/Show')->with([
            'currency' => $cashSession->load(['openingBalances', 'cashBalances', 'transactions', 'openedBy', 'closedBy']),
        ]);
    }

    public function open(): JsonResponse
    {
        if (CashSession::whereIn('status', ['active', 'pending'])->exists()) {
            throw new \Exception('close the opened session first open.');
        }

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
        $session = CashSession::whereIn('status', ['pending'])->first();

        if (! $session) {
            throw new \Exception('No pending cash session to close.');
        }
        $result = $this->service->closeCashSession(Auth::user(), $request->validated(), $session);

        return $this->success('Cash session closed successfully.', [
            'report' => $result,
        ]);
    }
}
