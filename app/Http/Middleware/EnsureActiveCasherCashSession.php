<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CasherCashSession;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureActiveCasherCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::where('status', CashSessionEnum::ACTIVE->value)->first();
        $casherSession = CasherCashSession::where('status', CashSessionEnum::ACTIVE->value)->where('cash_session_id', $session->id)->first();

        if (! $session || ! $casherSession) {
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
        $request->merge(['session' => $session, 'casherSession' => $casherSession]);

        return $next($request);
    }
}
