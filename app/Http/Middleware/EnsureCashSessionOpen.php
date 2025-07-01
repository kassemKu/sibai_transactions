<?php

namespace App\Http\Middleware;

use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureCashSessionOpen
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::where('is_closed', false)->first();

        if (! $session) {
            return response()->json([
                'error' => 'No open cash session found. Please ask admin to open a session.',
            ], 403);
        }

        // Inject the session into request if you want
        $request->merge(['cash_session_id' => $session->id]);

        return $next($request);
    }
}
