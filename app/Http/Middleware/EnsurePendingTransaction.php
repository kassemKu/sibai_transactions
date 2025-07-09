<?php

namespace App\Http\Middleware;

use App\Enums\TransactionStatusEnum;
use Closure;
use Illuminate\Http\Request;

class EnsurePendingTransaction
{
    public function handle(Request $request, Closure $next)
    {
        $transaction = $request->route('transaction');

        if ($transaction->status !== TransactionStatusEnum::PENDING->value) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => false,
                    'message' => 'هذه المعاملة ليست في حالة معلقة.',
                    'data' => [],
                ], 403);
            }
            abort(403, 'هذه المعاملة ليست في حالة معلقة.');
        }

        return $next($request);
    }
}
