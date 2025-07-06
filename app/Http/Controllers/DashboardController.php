<?php

namespace App\Http\Controllers;

use App\Models\CashSession;
use App\Models\Currency;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    private function getUserRoles()
    {
        $user = Auth::user();
        if (!$user) return [];
        
        // Use the User model to load roles properly
        $userWithRoles = \App\Models\User::with('roles')->find($user->id);
        return $userWithRoles->roles->pluck('name')->toArray();
    }

    public function index()
    {
        $roles = $this->getUserRoles();
        
        if (in_array('super_admin', $roles) || in_array('admin', $roles)) {
            return redirect()->route('admin.dashboard');
        } elseif (in_array('casher', $roles)) {
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
            'user_roles' => $this->getUserRoles(),
        ]);
    }

    public function casherDashboard()
    {
        return inertia('CasherDashboard')->with([
            'currencies' => Currency::get(),
            'cashSessions' => CashSession::with(['openingBalances', 'cashBalances'])
                ->orderBy('opened_at', 'desc')
                ->get(),
            'user_roles' => $this->getUserRoles(),
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
