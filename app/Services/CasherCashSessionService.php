<?php

namespace App\Services;

use App\Enums\CashSessionEnum;
use App\Models\CasherCashSession;
use Illuminate\Support\Facades\Auth;

class CasherCashSessionService
{
    public function openCashSession($casherId, $openingBalances, $session)
    {
        $session = CasherCashSession::create([
            'cash_session_id' => $session->id,
            'opened_at' => now(),
            'opened_by' => Auth::id(),
            'opening_balances' => json_encode($openingBalances),
            'casher_id' => $casherId,
            'status' => CashSessionEnum::ACTIVE->value,
        ]);

        return $session;
    }
}
