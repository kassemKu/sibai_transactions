<?php

namespace App\Http\Middleware;

use App\Enums\CashSessionEnum;
use App\Models\CashSession;
use Closure;
use Illuminate\Http\Request;

class EnsureActiveCashSession
{
    public function handle(Request $request, Closure $next)
    {
        $session = CashSession::where('status', CashSessionEnum::ACTIVE->value)->first();

        if (! $session) {
            return response()->json([
                'error' => 'No active cash session found.',
            ], 403);
        }

        // Inject the session into request if you want
        $request->merge(['session' => $session]);

        return $next($request);
    }
}
