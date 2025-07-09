<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureNoOpenCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value])->exists();

        if ($session) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'هناك جلسة نقدية مفتوحة بالفعل. يرجى إغلاقها قبل فتح جلسة جديدة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'هناك جلسة نقدية مفتوحة بالفعل. يرجى إغلاقها قبل فتح جلسة جديدة.');
        }

        return $next($request);
    }
}
