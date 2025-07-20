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
        ]);
    }

    public function casherDashboard()
    {
        return inertia('CasherDashboard');
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

        if (! Auth::user()->hasRole(['super_admin', 'admin'])) {
            $transactionsQuery->where('assigned_to', Auth::id());
        }

        $transactions = $transactionsQuery
            ->with(['fromCurrency', 'toCurrency', 'createdBy', 'closedBy', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all cashiers with their system balances and session status
        $allCashiers = User::whereHas('roles', function ($query) {
            $query->where('name', 'casher');
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

                    // Calculate total in/out movements for this cashier and currency
                    $totalIn = \App\Models\CashMovement::where('currency_id', $currency->id)
                        ->where('by', $cashierSession->casher_id)
                        ->where('type', \App\Enums\CashMovementTypeEnum::IN->value)
                        ->where('cash_session_id', $cashierSession->cash_session_id)
                        ->whereHas('transaction', fn ($q) => $q->where('status', \App\Enums\TransactionStatusEnum::COMPLETED->value))
                        ->sum('amount');

                    $totalOut = \App\Models\CashMovement::where('currency_id', $currency->id)
                        ->where('by', $cashierSession->casher_id)
                        ->where('type', \App\Enums\CashMovementTypeEnum::OUT->value)
                        ->where('cash_session_id', $cashierSession->cash_session_id)
                        ->whereHas('transaction', fn ($q) => $q->where('status', \App\Enums\TransactionStatusEnum::COMPLETED->value))
                        ->sum('amount');

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

        // Always include the logged-in cashier, even if not in the above list
        $currentUser = Auth::user();
        if ($currentUser->hasRole('casher') && ! $cashiers->contains('id', $currentUser->id)) {
            // Get the current user's most recent session and system balances
            $currentUserSession = $currentUser->casherCashSessions()
                ->orderBy('created_at', 'desc')
                ->first();

            $systemBalances = [];
            if ($currentUserSession) {
                $openingBalances = collect($currentUserSession->opening_balances)->keyBy('currency_id');

                foreach ($currencies as $currency) {
                    $opening = $openingBalances[$currency->id]['amount'] ?? 0;

                    // Calculate total in/out movements for this cashier and currency
                    $totalIn = \App\Models\CashMovement::where('currency_id', $currency->id)
                        ->where('by', $currentUserSession->casher_id)
                        ->where('type', \App\Enums\CashMovementTypeEnum::IN->value)
                        ->where('cash_session_id', $currentUserSession->cash_session_id)
                        ->whereHas('transaction', fn ($q) => $q->where('status', \App\Enums\TransactionStatusEnum::COMPLETED->value))
                        ->sum('amount');

                    $totalOut = \App\Models\CashMovement::where('currency_id', $currency->id)
                        ->where('by', $currentUserSession->casher_id)
                        ->where('type', \App\Enums\CashMovementTypeEnum::OUT->value)
                        ->where('cash_session_id', $currentUserSession->cash_session_id)
                        ->whereHas('transaction', fn ($q) => $q->where('status', \App\Enums\TransactionStatusEnum::COMPLETED->value))
                        ->sum('amount');

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

            $cashiers->push([
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'email' => $currentUser->email,
                'system_balances' => $systemBalances,
                'has_active_session' => $currentUserSession && $currentUserSession->status === 'active',
            ]);
        }

        return $this->success('تم جلب بيانات الجلسة النقدية الحالية بنجاح.', [
            'current_session' => $session,
            'currencies' => $currencies,
            'transactions' => $transactions,
            'cashiers' => $cashiers->values(),
        ]);
    }
}
