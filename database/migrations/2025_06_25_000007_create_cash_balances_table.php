<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_balances', function (Blueprint $table) {
            $table->id();
            $table->decimal('opening_balance', 18, 2);
            $table->decimal('total_in', 18, 2);
            $table->decimal('total_out', 18, 2);
            $table->decimal('closing_balance', 18, 2);
            $table->decimal('actual_closing_balance', 18, 2)->nullable();
            $table->decimal('difference', 18, 2)->nullable();

            $table->unsignedBigInteger('cash_session_id')->nullable();
            $table->foreign('cash_session_id')->references('id')->on('cash_sessions')->onDelete('set null')->onUpdate('cascade');
            $table->unsignedBigInteger('currency_id')->nullable();
            $table->foreign('currency_id')->references('id')->on('currencies')->onDelete('set null')->onUpdate('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_balances');
    }
};
