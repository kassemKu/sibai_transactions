<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use Closure;
use Illuminate\Http\Request;

class EnsureActiveCasherCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $casherSession = $request->route('casherCashSession');
        $session = $casherSession->cashSession;

        if ($session->status != CashSessionEnum::ACTIVE->value || $casherSession->status != CashSessionEnum::ACTIVE->value) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'لا توجد جلسة نقدية نشطة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'لا توجد جلسة نقدية نشطة.');
        }

        // Inject the session into request if you want
        $request->merge(['cash_session' => $session, 'casherSession' => $casherSession]);

        return $next($request);
    }
}
