<?php

namespace App\Http\Middleware;

use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureCashSessionPending
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::whereIn('status', ['pending'])->first();

        if (! $session) {
            return response()->json([
                'error' => 'No pending cash session found. Please ask admin to open a session.',
            ], 403);
        }

        // Inject the session into request if you want
        $request->merge(['cash_session' => $session]);

        return $next($request);
    }
}
