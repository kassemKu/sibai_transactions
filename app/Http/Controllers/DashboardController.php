<?php

namespace App\Http\Controllers;

use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CashSession;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        if (Auth::user()->hasRole('super_admin')) {
            return redirect()->route('admin.dashboard');
        } elseif (Auth::user()->hasRole(['casher', 'admin'])) {
            return redirect()->route('casher.dashboard');
        }
    }

    public function adminDashboard()
    {
        return inertia('Dashboard')->with([
            'companies' => Company::all(),
            'currencies' => Currency::all(),
        ]);
    }

    public function casherDashboard()
    {
        return inertia('CasherDashboard')->with([
            'companies' => \App\Models\Company::all(),
        ]);
    }

    public function getStatus()
    {
        $user = Auth::user();
        $session = $this->getCurrentCashSession($user);

        return $this->success('تم جلب بيانات الجلسة النقدية الحالية بنجاح.', [
            'current_session' => $session,
            'currencies' => $this->getCurrencies(),
            'transactions' => $this->getPendingTransactions($session, $user),
            'available_cashers' => $this->getAvailableCashers($session, $user),
            'my_session' => $this->casherSession($session, $user),
        ]);
    }

    private function getCurrencies()
    {
        return Currency::all();
    }

    private function getCurrentCashSession($user)
    {
        return CashSession::whereIn('status', [
            CashSessionEnum::ACTIVE->value,
            CashSessionEnum::PENDING->value,
        ])
            ->when($user->hasRole('super_admin'), function ($query) {
                $query->with(['casherCashSessions.casher']);
            })
            ->first();
    }

    private function getPendingTransactions($session, $user)
    {
        if (! $session) {
            return collect();
        }

        return Transaction::where('status', TransactionStatusEnum::PENDING->value)
            ->where('cash_session_id', $session->id)
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', [
                    CashSessionEnum::ACTIVE->value,
                    CashSessionEnum::PENDING->value,
                ]);
            })
            ->when(! $user->hasRole(['super_admin', 'admin']), function ($query) use ($user) {
                $query->where('assigned_to', $user->id);
            })
            ->with(['fromCurrency', 'toCurrency', 'createdBy', 'closedBy', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    private function getAvailableCashers($session, $user)
    {

        if (! $session || ! $user->hasRole(['admin', 'super_admin'])) {
            return collect();
        }

        $usersWithSessions = User::where('is_active', true)
            ->whereHas('casherCashSessions', function ($q) use ($session) {
                $q->where('cash_session_id', $session->id)
                    ->whereIn('status', ['active', 'pending']);
            })
            ->get();

        $superAdmins = User::where('is_active', true)
            ->whereHas('roles', function ($q) {
                $q->where('name', 'super_admin');
            })
            ->get();

        return $usersWithSessions->merge($superAdmins)->unique('id');
    }

    private function casherSession($session, $user)
    {
        if (! $user->hasRole(['admin', 'casher'])) {
            return collect();
        }

        return $user->casherCashSessions()->whereIn('status', [
            CashSessionEnum::ACTIVE->value,
            CashSessionEnum::PENDING->value,
        ])
            ->where('cash_session_id', $session->id)
            ->latest()
            ->first();
    }
}
