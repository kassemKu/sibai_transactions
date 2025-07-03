<?php

use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\EnsureActiveCashSession;
use App\Http\Middleware\EnsureCashSessionOpen;
use App\Http\Middleware\EnsureNoOpenCashSession;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'role:super_admin|admin|casher'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions/calc', [TransactionController::class, 'calc'])->name('transactions.calc')->middleware(EnsureCashSessionOpen::class);
    Route::post('/transactions', [TransactionController::class, 'store']);

    Route::group(['middleware' => ['role:super_admin']], function () {
        Route::post('/cash-sessions/open', [CashSessionController::class, 'open'])->middleware(EnsureNoOpenCashSession::class);
        Route::get('/cash-sessions/closing-balances', [CashSessionController::class, 'getClosingBalances'])->middleware(EnsureCashSessionOpen::class);
        Route::post('/cash-sessions/pending', [CashSessionController::class, 'pending'])->middleware(EnsureActiveCashSession::class);
        Route::post('/cash-sessions/close', [CashSessionController::class, 'close'])->middleware(EnsureCashSessionOpen::class);
        Route::get('/cash-sessions', [CashSessionController::class, 'index'])->name('cash_sessions.index');

        Route::get('/pending-transactions', [TransactionController::class, 'pendingTransaction'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/pending', [TransactionController::class, 'pendingStatus'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/complete', [TransactionController::class, 'completeStatus'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/cancel', [TransactionController::class, 'cancelStatus'])->middleware(EnsureActiveCashSession::class);

        Route::apiResource('currencies', CurrencyController::class)->except(['destroy']);
    });
});