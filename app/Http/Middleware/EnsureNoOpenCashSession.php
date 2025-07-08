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
            return response()->json([
                'error' => 'A cash session is already open. Close it before opening a new one.',
            ], 403);
        }

        return $next($request);
    }
}
