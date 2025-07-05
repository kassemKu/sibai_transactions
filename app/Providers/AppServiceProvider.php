<?php

namespace App\Providers;

use App\Models\Transaction;
use App\Policies\TransactionPolicy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
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
        Model::automaticallyEagerLoadRelationships();

        Inertia::share([
            'auth' => fn () => [
                'user' => Auth::user(),
                'roles' => Auth::user()->roles->pluck('name'),
                // 'permissions' => Auth::check() ? Auth::user()->allPermissions()->pluck('name') : [],
            ],
        ]);

        Gate::policy(Transaction::class, TransactionPolicy::class);
    }
}
