<?php

namespace App\Providers;

use App\Models\CashSession;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => fn () => [
                'user' => Auth::user(),
                'roles' => Auth::check() ? Auth::user()->roles->pluck('name') : [],
                // 'permissions' => Auth::check() ? Auth::user()->allPermissions()->pluck('name') : [],
            ],
            'cash_session' => fn () => CashSession::whereIn('status', ['active', 'pending'])->latest()->first() ?? false,
        ]);
    }
}