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
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->decimal('total_in', 18, 2)->default(0);
            $table->decimal('total_out', 18, 2)->default(0);
            $table->decimal('closing_balance', 18, 2)->nullable();
            $table->decimal('actual_closing_balance', 18, 2)->nullable();
            $table->decimal('difference', 18, 2)->nullable()->default(0);

            $table->foreignId('cash_session_id')->nullable()->constrained('cash_sessions')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_balances');
    }
};
