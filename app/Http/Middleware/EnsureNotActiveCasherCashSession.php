<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CasherCashSession;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureNotActiveCasherCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::where('status', CashSessionEnum::ACTIVE->value)->first();

        if (! $session) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'لا توجد جلسة نقدية نشطة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'لا توجد جلسة نقدية نشطة.');
        }

        $casherSession = CasherCashSession::where('cash_session_id', $session->id)
            ->where('casher_id', $request->casher_id)
            ->first();

        if ($casherSession) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'توجد جلسة نقدية بالفعل لهذا العميل يرجى اغلاق الجلسه العموميه.',
                    'data' => [],
                ], 403);
            }
            abort(403, ' توجد جلسة نقدية بالفعل لهذا العميل يرجى اغلاق الجلسه العمومية.');
        }

        $request->merge(['session' => $session]);

        return $next($request);
    }
}
