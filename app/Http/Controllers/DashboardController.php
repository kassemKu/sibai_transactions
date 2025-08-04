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
        $session = CashSession::whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value])
            ->with(['casherCashSessions.casher'])
            ->first();

        $transactionsQuery = Transaction::where('status', TransactionStatusEnum::PENDING->value)
            ->whereHas('cashSession', function ($query) {
                $query->whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value]);
            });

        // Admin users can see all pending transactions, not just those assigned to them
        if (! Auth::user()->hasRole(['super_admin', 'admin'])) {
            $transactionsQuery->where('assigned_to', Auth::id());
        }

        $transactions = $transactionsQuery
            ->with(['fromCurrency', 'toCurrency', 'createdBy', 'closedBy', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all cashiers AND admin users with their system balances and session status
        $allCashiers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['casher', 'admin']);
        })->get();

        $currencies = Currency::get();
        $cashiers = $allCashiers->map(function ($user) use ($currencies) {
            // Get the user's most recent session (not just for current cash session)
            $cashierSession = $user->casherCashSessions()
                ->orderBy('created_at', 'desc')
                ->first();

            // Calculate system balances dynamically
            $systemBalances = [];
            if ($cashierSession) {
                $openingBalances = collect($cashierSession->opening_balances)->keyBy('currency_id');

                foreach ($currencies as $currency) {
                    $opening = $openingBalances[$currency->id]['amount'] ?? 0;

                    $totalIn = Transaction::where('from_currency_id', $currency->id)
                        ->where('cash_session_id', $cashierSession->cash_session_id)
                        ->where('status', TransactionStatusEnum::COMPLETED->value)
                        ->where('created_by', $cashierSession->casher_id)
                        ->whereHas('createdBy.casherCashSessions', function ($query) use ($cashierSession) {
                            $query->where('cash_session_id', $cashierSession->cash_session_id);
                        })
                        ->sum('original_amount');

                    $totalOut = Transaction::where('to_currency_id', $currency->id)
                        ->where('cash_session_id', $cashierSession->cash_session_id)
                        ->where('status', TransactionStatusEnum::COMPLETED->value)
                        ->where('closed_by', $cashierSession->casher_id)
                        ->whereHas('closedBy.casherCashSessions', function ($query) use ($cashierSession) {
                            $query->where('cash_session_id', $cashierSession->cash_session_id);
                        })
                        ->sum('converted_amount');

                    $systemBalance = $opening + $totalIn - $totalOut;

                    $systemBalances[] = [
                        'currency_id' => $currency->id,
                        'amount' => $systemBalance,
                        'currency' => $currency,
                    ];
                }
            } else {
                // If no session, provide zero balances for all currencies
                $systemBalances = $currencies->map(function ($currency) {
                    return [
                        'currency_id' => $currency->id,
                        'amount' => 0,
                        'currency' => $currency,
                    ];
                })->toArray();
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'system_balances' => $systemBalances,
                'has_active_session' => $cashierSession && $cashierSession->status === 'active',
            ];
        });

        // Always include the logged-in user (cashier or admin), even if not in the above list
        $currentUser = Auth::user();
        if (($currentUser->hasRole('casher') || $currentUser->hasRole('admin')) && ! $cashiers->contains('id', $currentUser->id)) {
            // Get the current user's most recent session and system balances
            $currentUserSession = $currentUser->casherCashSessions()
                ->orderBy('created_at', 'desc')
                ->first();

            $cashiers->push([
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'email' => $currentUser->email,
                'has_active_session' => $currentUserSession && $currentUserSession->status === 'active',
            ]);
        }

        $availableCashers = collect();
        if ($session) {
            $availableCashers = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['casher', 'admin', 'super_admin']);
            })
                ->where('is_active', true)
                ->whereHas('casherCashSessions', function ($q) use ($session) {
                    $q->where('cash_session_id', $session->id)
                        ->whereIn('status', ['active', 'pending']);
                })
                ->get();

            // Always include the session opener if they are active and have the right role
            if ($session->opened_by) {
                $opener = User::where('id', $session->opened_by)
                    ->where('is_active', true)
                    ->whereHas('roles', function ($q) {
                        $q->whereIn('name', ['casher', 'admin', 'super_admin']);
                    })
                    ->first();
                if ($opener && ! $availableCashers->contains('id', $opener->id)) {
                    $availableCashers->push($opener);
                }
            }
        }

        return $this->success('تم جلب بيانات الجلسة النقدية الحالية بنجاح.', [
            'current_session' => $session,
            'currencies' => $currencies,
            'transactions' => $transactions,
            'cashiers' => $cashiers->values(),
            'available_cashers' => $availableCashers,
            // Debug info (remove in production)
            'debug_available_cashers' => $availableCashers,
        ]);
    }
}
