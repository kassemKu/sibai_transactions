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
        try {
            $cashSession = $this->service->openCashSession(Auth::user());

            return $this->success('تم فتح الجلسة النقدية بنجاح.', [
                'cash_session' => $cashSession,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CashSessionController@open');

            return $this->failed('حدث خطأ أثناء فتح الجلسة النقدية');
        }
    }

    public function getClosingBalances(Request $request): JsonResponse
    {
        try {
            $balances = $this->service->getClosingBalances($request->session);

            return $this->success('تم جلب أرصدة الإغلاق بنجاح.', [
                'balances' => $balances,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CashSessionController@getClosingBalances');

            return $this->failed('حدث خطأ أثناء جلب أرصدة الإغلاق');
        }
    }

    public function pending(Request $request): JsonResponse
    {
        try {
            $request->session->update([
                'status' => CashSessionEnum::PENDING->value,
            ]);

            return $this->success('تم تحويل حالة الجلسة إلى قيد الإغلاق.', [
                'session' => $request->session->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CashSessionController@pending');

            return $this->failed('حدث خطأ أثناء تحويل حالة الجلسة إلى قيد الإغلاق');
        }
    }

    public function close(CloseCashSessionRequest $request): JsonResponse
    {
        try {
            $result = $this->service->closeCashSession(Auth::user(), $request->validated(), $request->session);

            return $this->success('تم إغلاق الجلسة النقدية بنجاح.', [
                'report' => $result,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CashSessionController@close');

            return $this->failed('حدث خطأ أثناء إغلاق الجلسة النقدية');
        }
    }

    public function latest(): JsonResponse
    {
        $cashSession = CashSession::where('status', CashSessionEnum::CLOSED->value)
            ->latest()
            ->first();

        return $this->success('تم جلب آخر جلسة مغلقة بنجاح.', [
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

    public function balances()
    {
        return inertia('CashBalances/Index');
    }
}
