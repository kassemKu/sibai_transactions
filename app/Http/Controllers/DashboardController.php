<?php

namespace App\Http\Controllers;

use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

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
        return inertia('Dashboard');
    }

    public function casherDashboard()
    {
        return inertia('CasherDashboard');
    }

    public function getStatus()
    {
        $session = CashSession::whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value])->first();

        $transactionsQuery = Transaction::where('status', TransactionStatusEnum::PENDING->value)
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value]);
            });

        if (! Auth::user()->hasRole(['super_admin', 'admin'])) {
            $transactionsQuery->where('assigned_to', Auth::id());
        }

        $transactions = $transactionsQuery
            ->with(['fromCurrency', 'toCurrency', 'createdBy', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success('Current cash session retrieved successfully.', [
            'current_session' => $session,
            'currencies' => Currency::get(),
            'transactions' => $transactions,
        ]);
    }
}
