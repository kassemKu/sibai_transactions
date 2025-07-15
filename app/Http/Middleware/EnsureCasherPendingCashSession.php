<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use Closure;
use Illuminate\Http\Request;

class EnsureCasherPendingCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $casherSession = $request->route('casherCashSession');
        $session = $casherSession->cashSession;

        if ($session->status != CashSessionEnum::ACTIVE->value) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'لا توجد جلسة نقدية عامه نشطة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'لا توجد جلسة نقدية قيد الإغلاق. يرجى التواصل مع المدير لفتح جلسة.');
        }

        if ($casherSession->status != CashSessionEnum::PENDING->value) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'لا توجد جلسة نقدية قيد الإغلاق.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'لا توجد جلسة نقدية قيد الإغلاق.');
        }

        // Inject the session into request if you want
        $request->merge(['session' => $session, 'casherSession' => $casherSession]);

        return $next($request);
    }
}
