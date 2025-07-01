<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cash_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('customer_name')->nullable();

            $table->foreignId('from_currency_id')->constrained('currencies');
            $table->foreignId('to_currency_id')->constrained('currencies');

            $table->decimal('amount_original', 18, 2);
            $table->decimal('converted_amount', 18, 2); // 💚 NEW

            $table->decimal('amount_usd', 18, 2);

            // Snapshots for FROM
            $table->decimal('from_rate_to_usd_snapshot', 18, 8);
            $table->decimal('from_profit_margin_snapshot', 5, 2);

            // Snapshots for TO
            $table->decimal('to_rate_to_usd_snapshot', 18, 8);
            $table->decimal('to_profit_margin_snapshot', 5, 2);

            // Final price used
            $table->decimal('exchange_rate_used', 18, 8);
            $table->decimal('market_exchange_rate', 18, 8);

            // Profit
            $table->decimal('profit_usd', 18, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
