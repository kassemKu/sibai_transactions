<?php

namespace App\Http\Controllers\Casher;

use App\Enums\TransactionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Casher\OpenCasherCashSessionRequest;
use App\Models\CashSession;
use App\Services\CasherCashSessionService;
use Illuminate\Http\JsonResponse;

class CasherCashSessionController extends Controller
{
    protected $service;

    public function __construct(CasherCashSessionService $service)
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
            'totalUsdProfits' => $cashSession->transactions()
                ->where('status', TransactionStatusEnum::COMPLETED->value)
                ->sum('total_profit_usd'),
        ]);
    }

    public function open(OpenCasherCashSessionRequest $request): JsonResponse
    {
        try {
            $cashSession = $this->service->openCashSession($request->casher_id, $request->opening_balances, $request->session);

            return $this->success('تم فتح الجلسة النقدية بنجاح.', [
                'cash_session' => $cashSession,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CasherCashSessionController@open');

            return $this->failed('حدث خطأ أثناء فتح الجلسة النقدية');
        }
    }
}
