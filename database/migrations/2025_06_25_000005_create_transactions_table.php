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
            $table->decimal('amount_original', 18, 2);
            $table->decimal('amount_usd', 18, 2);
            $table->decimal('exchange_rate_used', 18, 6);
            $table->decimal('market_exchange_rate', 18, 6);
            $table->decimal('profit_usd', 18, 2);

            $table->unsignedBigInteger('customer_id')->nullable();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('cash_session_id')->nullable();
            $table->foreign('cash_session_id')->references('id')->on('cash_sessions')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('from_currency_id')->nullable();
            $table->foreign('from_currency_id')->references('id')->on('currencies')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('to_currency_id')->nullable();
            $table->foreign('to_currency_id')->references('id')->on('currencies')
                ->onDelete('set null')->onUpdate('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
