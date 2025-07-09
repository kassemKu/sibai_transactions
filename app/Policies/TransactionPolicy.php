<?php

namespace App\Policies;

use App\Enums\TransactionStatusEnum;
use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function complete(User $user, Transaction $transaction): bool
    {
        return $transaction->assigned_to === $user->id && $transaction->status === TransactionStatusEnum::PENDING->value;
    }
}
