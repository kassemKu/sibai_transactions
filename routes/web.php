<?php

use App\Http\Controllers\Casher\TransactionController as CasherTransactionController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmployeeController;
use App\Http\Middleware\EnsureActiveCashSession;
use App\Http\Middleware\EnsureNoOpenCashSession;
use App\Http\Middleware\EnsureOpenCashSession;
use App\Http\Middleware\EnsurePendingCashSession;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth:sanctum', config('jetstream.auth_session')])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions/calc', [TransactionController::class, 'calc'])->name('transactions.calc')->middleware(EnsureOpenCashSession::class);
    Route::get('/status', [DashboardController::class, 'getStatus'])->name('status');

    Route::group(['middleware' => ['role:super_admin|superadministrator|administrator'], 'prefix' => 'admin'], function () {
        Route::get('/', [DashboardController::class, 'AdminDashboard'])->name('admin.dashboard');

        Route::Resource('/currencies', CurrencyController::class)->except(['destroy', 'store']);
        Route::post('/currencies', [CurrencyController::class, 'store'])->middleware(EnsureOpenCashSession::class);

        Route::post('/transactions', [TransactionController::class, 'store'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/complete', [TransactionController::class, 'completeStatus'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/cancel', [TransactionController::class, 'cancelStatus'])->middleware(EnsureActiveCashSession::class);

        Route::get('/cash-sessions', [CashSessionController::class, 'index'])->name('cash_sessions.index');
        Route::post('/cash-sessions/latest', [CashSessionController::class, 'latest']);
        Route::get('/get-session-closing-balances', [CashSessionController::class, 'getClosingBalances'])->middleware(EnsureOpenCashSession::class);
        Route::get('/cash-sessions/{cashSession}', [CashSessionController::class, 'show'])->name('cash_sessions.show');
        Route::post('/cash-sessions/open', [CashSessionController::class, 'open'])->middleware(EnsureNoOpenCashSession::class);
        Route::post('/cash-sessions/pending', [CashSessionController::class, 'pending'])->middleware(EnsureActiveCashSession::class);
        Route::post('/cash-sessions/close', [CashSessionController::class, 'close'])->middleware(EnsurePendingCashSession::class);

        Route::get('/users', [UserController::class, 'index'])->name('users.index');

        Route::resource('/employees', EmployeeController::class, [
            'parameters' => ['' => 'employee'],
            'name' => 'employees'
        ]);
    });

    Route::group(['middleware' => ['role:casher'], 'prefix' => 'casher'], function () {
        Route::get('/', [DashboardController::class, 'CasherDashboard'])->name('casher.dashboard');
        Route::post('/transactions', [CasherTransactionController::class, 'store'])->middleware(EnsureActiveCashSession::class);
        Route::put('/transactions/{id}/confirm', [CasherTransactionController::class, 'confirmStatus'])->middleware(EnsureActiveCashSession::class);
    });
});
