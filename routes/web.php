<?php

use App\Http\Controllers\Casher\TransactionController as CasherTransactionController;
use App\Http\Controllers\CasherCashSessionController;
use App\Http\Controllers\CashMovementController;
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureActiveCasherCashSession;
use App\Http\Middleware\EnsureActiveCashSession;
use App\Http\Middleware\EnsureCasherPendingCashSession;
use App\Http\Middleware\EnsureIsActiveCasherCashSession;
use App\Http\Middleware\EnsureNoOpenCashSession;
use App\Http\Middleware\EnsureNotActiveCasherCashSession;
use App\Http\Middleware\EnsureOpenCashSession;
use App\Http\Middleware\EnsurePendingCashSession;
use App\Http\Middleware\EnsurePendingTransaction;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth:sanctum', config('jetstream.auth_session')])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions/calc', [TransactionController::class, 'calc'])->name('transactions.calc')->middleware(EnsureOpenCashSession::class);
    Route::get('/status', [DashboardController::class, 'getStatus'])->name('status');

    Route::group(['middleware' => ['role:super_admin|admin'], 'prefix' => 'admin'], function () {
        Route::get('/get-users', [UserController::class, 'getUsers']);
        Route::put('/transactions/{transaction}/cancel', [TransactionController::class, 'cancelStatus'])->middleware([EnsureActiveCashSession::class, EnsurePendingTransaction::class]);
    
    });

    Route::group(['middleware' => ['role:super_admin'], 'prefix' => 'admin'], function () {
        // Dashboard
        Route::get('/', [DashboardController::class, 'AdminDashboard'])->name('admin.dashboard');

        // CurrencyController
        Route::controller(CurrencyController::class)->group(function () {
            Route::resource('/currencies', CurrencyController::class)->except(['destroy', 'store']);
            Route::post('/currencies', 'store')->middleware([EnsureOpenCashSession::class]);
        });
        Route::get('/get-session-closing-balances', [CashSessionController::class, 'getClosingBalances'])->middleware([EnsureOpenCashSession::class]);

        // TransactionController
        Route::controller(TransactionController::class)->group(function () {
            Route::post('/transactions', 'store')->middleware([EnsureActiveCashSession::class]);
            Route::put('/transactions/{transaction}/complete', 'completeStatus')->middleware([EnsureActiveCashSession::class, EnsurePendingTransaction::class]);
            Route::put('/transactions/{transaction}/cancel', 'cancelStatus')->middleware([EnsureActiveCashSession::class, EnsurePendingTransaction::class]);
            Route::get('/transactions/{transaction}', 'show')->name('transaction.show');
        });
        Route::post('/cash-sessions/pending', [CashSessionController::class, 'pending'])->middleware([EnsureActiveCashSession::class]);
        Route::get('/get-cash-sessions-available-cashers', [CashSessionController::class, 'getAvailableCashers'])->middleware([EnsureActiveCashSession::class]);

        // CashSessionController
        Route::controller(CashSessionController::class)->group(function () {
            Route::post('/cash-sessions/open', 'open')->middleware([EnsureNoOpenCashSession::class]);
            Route::post('/cash-sessions/close', 'close')->middleware([EnsurePendingCashSession::class]);
            Route::get('/cash-sessions', 'index')->name('cash_sessions.index');
            Route::post('/cash-sessions/latest', 'latest');
            Route::get('/cash-sessions/{cashSession}', 'show')->name('cash_sessions.show');
            Route::get('/cash-sessions/{cashSession}/transactions', 'getCashSessionTransactions')->name('cash_sessions.transactions');
            Route::get('/cash-balances', 'balances')->name('cash_balances.index');
        });

        // CasherCashSessionController
        Route::controller(CasherCashSessionController::class)->group(function () {
            Route::post('/open-casher-session', 'open')->middleware([EnsureNotActiveCasherCashSession::class]);
            Route::post('/casher-cash-session/{casherCashSession}/pending', 'pending')->middleware([EnsureActiveCasherCashSession::class]);
            Route::post('/casher-close-cash-session/{casherCashSession}/close', 'close')->middleware([EnsureCasherPendingCashSession::class]);
            Route::get('/casher-cash-sessions/{casherCashSession}', 'show')->name('casher_cash_sessions.show');
            Route::get('/get-closing-balances/{casherCashSession}', 'getClosingBalances');
        });

        // CashMovementController
        Route::get('/casher-cash-movements', [CashMovementController::class, 'getCasherCashMovements']);

        // UserController
        Route::controller(UserController::class)->group(function () {
            Route::get('/users-roles', 'getRoles');
            Route::resource('/users', UserController::class);
        
            Route::get('/users/get-user/{user}', 'getUser');
        });

        // EmployeeController
        Route::resource('/employees', EmployeeController::class, [
            'parameters' => ['' => 'employee'],
            'name' => 'employees',
        ]);

        // CompanyController
        Route::controller(CompanyController::class)->group(function () {
            Route::resource('/companies', CompanyController::class);
            Route::get('/companies/get-company/{company}', 'getCompany');
        });

        // TransferController
        Route::resource('/transfers', TransferController::class);
    });

    Route::group(['middleware' => ['role:casher|admin'], 'prefix' => 'casher'], function () {
        Route::get('/', [DashboardController::class, 'CasherDashboard'])->name('casher.dashboard');
        Route::post('/transactions', [CasherTransactionController::class, 'store'])->middleware(EnsureIsActiveCasherCashSession::class);
        Route::put('/transactions/{transaction}/confirm', [CasherTransactionController::class, 'confirmStatus'])->middleware([EnsurePendingTransaction::class, EnsureIsActiveCasherCashSession::class]);

        // Admin users can cancel transactions
        Route::put('/transactions/{transaction}/cancel', [CasherTransactionController::class, 'cancelStatus'])->middleware([EnsurePendingTransaction::class, EnsureIsActiveCasherCashSession::class]);
    });
});