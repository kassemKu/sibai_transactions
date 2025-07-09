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
            return response()->json([
                'error' => 'This transaction is not in the pending status.',
            ], 403);
        }

        return $next($request);
    }
}
