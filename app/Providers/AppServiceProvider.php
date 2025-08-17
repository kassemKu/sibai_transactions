<?php

namespace App\Providers;

use App\Models\Transaction;
use App\Models\Transfer;
use App\Policies\TransactionPolicy;
use App\Policies\TransferPolicy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

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

        Gate::policy(Transaction::class, TransactionPolicy::class);

        Gate::policy(Transfer::class, TransferPolicy::class);
    }
}
