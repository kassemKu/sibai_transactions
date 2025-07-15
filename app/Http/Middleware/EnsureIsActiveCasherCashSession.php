<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use Closure;
use Illuminate\Http\Request;

class EnsureIsActiveCasherCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $casherSession = auth()->user()->casherCashSessions()->latest()
            ->where('status', CashSessionEnum::ACTIVE->value)
            ->whereHas('cashSession', function ($query) {
                $query->where('status', CashSessionEnum::ACTIVE->value);
            })
            ->first();

        if (! $casherSession) {
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
        $request->merge(['cash_session' => $casherSession->cashSession, 'casherSession' => $casherSession]);

        return $next($request);
    }
}
