<?php

namespace App\Http\Controllers;

use App\Models\CashSession;
use App\Models\Currency;

class DashboardController extends Controller
{
    public function index()
    {
        return inertia('Dashboard')->with([
            'currencies' => Currency::with('currencyRate')->get(),
            'cashSessions' => CashSession::with(['openingBalances', 'cashBalances'])
                ->orderBy('opened_at', 'desc')
                ->get(),
        ]);
    }
}
