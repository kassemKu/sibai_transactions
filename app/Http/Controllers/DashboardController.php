<?php

namespace App\Http\Controllers;

use App\Models\CashSession;
use App\Models\Currency;

class DashboardController extends Controller
{
    public function index()
    {
        if (auth()->user()->hasRole(['super_admin', 'admin'])) {
            return redirect()->route('admin.dashboard');
        } elseif (auth()->user()->hasRole('casher')) {
            return redirect()->route('casher.dashboard');
        }
    }

    public function adminDashboard()
    {
        return inertia('Dashboard')->with([
            'currencies' => Currency::get(),
            'cashSessions' => CashSession::with(['openingBalances', 'cashBalances'])
                ->orderBy('opened_at', 'desc')
                ->get(),
        ]);
    }

    public function casherDashboard()
    {
        return inertia('CasherDashboard')->with([
            'currencies' => Currency::get(),
            'cashSessions' => CashSession::with(['openingBalances', 'cashBalances'])
                ->orderBy('opened_at', 'desc')
                ->get(),
        ]);
    }

    public function currentSession()
    {
        $session = CashSession::whereIn('status', ['active', 'pending'])->first();

        if (! $session) {
            return $this->failed('No active or pending cash session found.');
        }

        return $this->success('Current cash session retrieved successfully.', [
            'session' => $session,
        ]);
    }
}