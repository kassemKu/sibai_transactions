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

    public function index(): JsonResponse
    {
        $cashSessions = CashSession::with(['openingBalances', 'cashBalances', 'transactions', 'openedBy', 'closedBy'])
            ->orderBy('opened_at', 'desc')
            ->paginate(10);

        return $this->success('Cash sessions retrieved successfully.', [
            'cashSessions' => $cashSessions,
        ]);
    }

    public function open(): JsonResponse
    {
        if (CashSession::whereIn('status', ['active', 'pending'])->exists()) {
            throw new \Exception('close the opened session first open.');
        }

        $cashSession = $this->service->openCashSession(Auth::user());

        return response()->json(['success' => true, 'cash_session' => $cashSession]);
    }

    public function getClosingBalances(): JsonResponse
    {
        $balances = $this->service->getClosingBalances();

        return response()->json(['success' => true, 'balances' => $balances]);
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
