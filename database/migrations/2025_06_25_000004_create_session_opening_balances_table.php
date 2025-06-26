<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_opening_balances', function (Blueprint $table) {
            $table->id();
            $table->decimal('opening_balance', 18, 2);

            $table->unsignedBigInteger('cash_session_id')->nullable();
            $table->foreign('cash_session_id')->references('id')->on('cash_sessions')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('currency_id')->nullable();
            $table->foreign('currency_id')->references('id')->on('currencies')->onDelete('set null')->onUpdate('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_opening_balances');
    }
};
