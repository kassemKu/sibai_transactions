<?php

use App\Http\Controllers\Casher\TransactionController as CasherTransactionController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureActiveCashSession;
use App\Http\Middleware\EnsureCashSessionOpen;
use App\Http\Middleware\EnsureNoOpenCashSession;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth:sanctum', config('jetstream.auth_session')])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/current-session', [DashboardController::class, 'currentSession'])->name('currentSession');
    Route::get('/get-currencies', [CurrencyController::class, 'getCurrencies'])->name('currencies.api');
    Route::get('/transactions/calc', [TransactionController::class, 'calc'])->name('transactions.calc')->middleware(EnsureCashSessionOpen::class);

    Route::group(['middleware' => ['role:super_admin'], 'prefix' => 'admin'], function () {
        Route::get('/', [DashboardController::class, 'AdminDashboard'])->name('admin.dashboard');

        Route::Resource('currencies', CurrencyController::class)->except(['destroy']);

        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/pending-transactions', [TransactionController::class, 'pendingTransaction'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/complete', [TransactionController::class, 'completeStatus'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/cancel', [TransactionController::class, 'cancelStatus'])->middleware(EnsureActiveCashSession::class);

        Route::get('/cash-sessions', [CashSessionController::class, 'index'])->name('cash_sessions.index');
        Route::get('/cash-sessions/{cashSession}', [CashSessionController::class, 'show'])->name('cash_sessions.show');
        Route::post('/cash-sessions/open', [CashSessionController::class, 'open'])->middleware(EnsureNoOpenCashSession::class);
        Route::get('/cash-sessions/closing-balances', [CashSessionController::class, 'getClosingBalances'])->middleware(EnsureCashSessionOpen::class);
        Route::post('/cash-sessions/pending', [CashSessionController::class, 'pending'])->middleware(EnsureActiveCashSession::class);
        Route::post('/cash-sessions/close', [CashSessionController::class, 'close'])->middleware(EnsureCashSessionOpen::class);

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
    });

    Route::group(['middleware' => ['role:casher'], 'prefix' => 'casher'], function () {
        Route::get('/', [DashboardController::class, 'CasherDashboard'])->name('casher.dashboard');
        Route::post('/transactions', [CasherTransactionController::class, 'store']);
        Route::get('/transactions/pending', [CasherTransactionController::class, 'pendingTransactions'])->name('casher.transactions.pending');
        Route::put('/transactions/{id}/confirm', [CasherTransactionController::class, 'confirmStatus'])->middleware(EnsureActiveCashSession::class);
    });
});