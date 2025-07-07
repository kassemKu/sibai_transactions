<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['in', 'out']);
            $table->decimal('amount', 18, 2);
            $table->decimal('exchange_rate', 18, 6)->nullable();
            $table->string('notes')->nullable();

            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
