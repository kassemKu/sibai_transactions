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

            $table->foreignId('cash_session_id')->nullable()->constrained('cash_sessions')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_opening_balances');
    }
};
