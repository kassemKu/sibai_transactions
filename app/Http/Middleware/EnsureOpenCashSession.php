<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureOpenCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value])->first();

        if (! $session) {
            return response()->json([
                'error' => 'No open cash session found. Please ask admin to open a session.',
            ], 403);
        }

        // Inject the session into request if you want
        $request->merge(['session' => $session]);

        return $next($request);
    }
}
