<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function complete(User $user, Transaction $transaction): bool
    {
        // Admin users can complete any transaction
        if ($user->hasRole('admin')) {
            return true;
        }

        // Regular cashiers can only complete transactions assigned to them
        return $transaction->assigned_to === $user->id;
    }
}
