<?php

use App\Models\CashSession;
use App\Models\Currency;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
])->group(function () {
    Route::get('/dashboard', function () {

        return Inertia::render('Dashboard')->with([
            'currency' => Currency::with('currencyRate')->get(),
            'cashSessions' => CashSession::with(['openingBalances', 'cashBalances'])
                ->orderBy('opened_at', 'desc')
                ->get(),
        ]);
    })->name('dashboard');
    Route::get('/cashers', function () {
        return Inertia::render('Cashers');
    })->name('cashers');
});
