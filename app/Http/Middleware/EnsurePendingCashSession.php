<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsurePendingCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::where('status', CashSessionEnum::PENDING->value)->first();

        if (! $session) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'لا توجد جلسة نقدية قيد الإغلاق. يرجى التواصل مع المدير لفتح جلسة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'لا توجد جلسة نقدية قيد الإغلاق. يرجى التواصل مع المدير لفتح جلسة.');
        }

        // Inject the session into request if you want
        $request->merge(['session' => $session]);

        return $next($request);
    }
}
