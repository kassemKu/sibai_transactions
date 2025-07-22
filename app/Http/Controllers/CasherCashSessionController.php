<?php

namespace App\Http\Controllers;

use App\Enums\CashSessionEnum;
use App\Http\Requests\Casher\OpenCasherCashSessionRequest;
use App\Http\Requests\CloseCasherCashSessionRequest;
use App\Models\CashBalance;
use App\Models\CasherCashSession;
use App\Models\CashSession;
use App\Services\CasherCashSessionService;
use App\Services\TransactionService;
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

    public function open(OpenCasherCashSessionRequest $request, TransactionService $service): JsonResponse
    {
        try {
            foreach ($request->opening_balances as $balance) {
                $currencyId = $balance['currency_id'];
                $amount = $balance['amount'];
                $available = $service->getCurrencyAvailableBalance($currencyId);
                if ($available < $amount) {
                    return $this->failed('لا يوجد رصيد كافٍ للعملة رقم '.$currencyId.' (المتوفر: '.$available.', المطلوب: '.$amount.')');
                }
            }

            $cashSession = $this->service->openCashSession($request);

            return $this->success('تم فتح الجلسة النقدية بنجاح.', [
                'cash_session' => $cashSession,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CasherCashSessionController@open');

            return $this->failed('حدث خطأ أثناء فتح الجلسة النقدية');
        }
    }

    public function getClosingBalances(CasherCashSession $casherCashSession, Request $request): JsonResponse
    {
        try {
            $balances = $this->service->getClosingBalances($casherCashSession);

            return $this->success('تم جلب أرصدة الإغلاق بنجاح.', [
                'balances' => $balances,
                'session' => $casherCashSession,
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
            $result = $this->service->getClosingBalances($casherCashSession);

            $systemBalances = collect($result['system_closing_balances'] ?? [])->map(function ($balance) {
                return [
                    'currency_id' => $balance['currency_id'],
                    'amount' => $balance['system_balance'],
                    'opening_balance' => $balance['opening_balance'],
                ];
            })->values()->all();

            // Add actual_closing_balance to CashBalance opening_balance for each currency
            $openingBalances = collect($casherCashSession->opening_balances)->keyBy('currency_id');
            foreach ($request->actual_closing_balances as $balance) {
                $currencyId = $balance['currency_id'];
                $amount = $balance['amount'];
                $cashBalance = CashBalance::where('cash_session_id', $casherCashSession->cash_session_id)
                    ->where('currency_id', $currencyId)
                    ->first();
                // $openingAmount = $openingBalances[$currencyId]['amount'] ?? 0;

                if ($cashBalance) {
                    $cashBalance->opening_balance = $cashBalance->opening_balance + $amount;
                    $cashBalance->save();
                }
            }

            $casherCashSession->update([
                'actual_closing_balances' => json_encode($request->actual_closing_balances),
                'system_balances' => json_encode($systemBalances),
                'differences' => json_encode($result['differences'] ?? []),
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
