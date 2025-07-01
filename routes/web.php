<?php
 
use App\Http\Controllers\CashSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\EnsureCashSessionOpen;
use App\Http\Middleware\EnsureNoOpenCashSession;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
 
Route::get('/', function () {
    return redirect()->route('login');
});
 
Route::middleware(['auth:sanctum', config('jetstream.auth_session')])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions/calc', [TransactionController::class, 'calc'])->middleware(EnsureCashSessionOpen::class);
    Route::post('/transactions', [TransactionController::class, 'store']);
 
    Route::group(['middleware' => ['role:super_admin']], function () {
        Route::post('/cash-sessions/open', [CashSessionController::class, 'open'])->middleware(EnsureNoOpenCashSession::class);
        Route::post('/cash-sessions/close', [CashSessionController::class, 'close'])->middleware(EnsureCashSessionOpen::class);
    });
});