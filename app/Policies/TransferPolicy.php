<?php

namespace App\Policies;

use App\Enums\CashSessionEnum;
use App\Models\CashSession;
use App\Models\User;

class TransferPolicy
{
    public function create(User $user)
    {
        $session = CashSession::where('status', CashSessionEnum::ACTIVE->value)->latest()->first();

        if ($user->hasRole('super_admin')) {
            return true;
        }
        $casherSession = $user->casherCashSessions()
            ->where('status', CashSessionEnum::ACTIVE->value)
            ->where('cash_session_id', $session->id)
            ->latest()->first();

        return $casherSession && $casherSession->transfers;
    }
}
