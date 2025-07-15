<?php

namespace App\Http\Controllers;

use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Http\Requests\Casher\OpenCasherCashSessionRequest;
use App\Http\Requests\CloseCasherCashSessionRequest;
use App\Models\CasherCashSession;
use App\Models\CashSession;
use App\Services\CasherCashSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function getClosingBalances($id, Request $request): JsonResponse
    {
        try {
            $session = CasherCashSession::findOrFail($id);
            $balances = $this->service->getClosingBalances($session);

            return $this->success('تم جلب أرصدة الإغلاق بنجاح.', [
                'balances' => $balances,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CashSessionController@getClosingBalances');

            return $this->failed('حدث خطأ أثناء جلب أرصدة الإغلاق');
        }
    }

    public function pending(CasherCashSession $casherCashSession): JsonResponse
    {
        try {
            $casherCashSession->update([
                'status' => CashSessionEnum::PENDING->value,
            ]);

            return $this->success('تم تحويل حالة الجلسة إلى قيد الإغلاق.', [
                'session' => $casherCashSession->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CasherCashSessionController@pending');

            return $this->failed('حدث خطأ أثناء تحويل حالة الجلسة إلى قيد الإغلاق');
        }
    }

    public function close(CloseCasherCashSessionRequest $request, CasherCashSession $casherCashSession): JsonResponse
    {
        try {
            $result = $this->service->getClosingBalances($casherCashSession->cashSession, $casherCashSession);

            $systemBalances = collect($result['system_closing_balances'] ?? [])->map(function ($balance) {
                return [
                    'currency_id' => $balance['currency_id'],
                    'amount' => $balance['system_balance'],
                ];
            })->values()->all();

            $casherCashSession->update([
                'actual_closing_balances' => json_encode($request->actual_closing_balances),
                'system_balances' => json_encode($systemBalances),
                'status' => CashSessionEnum::CLOSED->value,
                'closed_at' => now(),
                'closed_by' => auth()->id(),
            ]);

            return $this->success('تم إغلاق الجلسة النقدية بنجاح.', [
                'session' => $casherCashSession->refresh(),
                'report' => $result,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CasherCashSessionController@close');

            return $this->failed('حدث خطأ أثناء إغلاق الجلسة النقدية');
        }
    }
}
