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

            $table->foreignId('cash_session_id')->nullable()->constrained('cash_sessions')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');

            $table->foreignId('customer_id')->nullable()->constrained('customers')->onUpdate('cascade')->onDelete('set null');

            $table->foreignId('from_currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('to_currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');

            $table->decimal('original_amount', 18, 2);
            $table->decimal('converted_amount', 18, 2);

            // Snapshots
            $table->decimal('from_rate_to_usd', 18, 8);
            $table->decimal('to_rate_to_usd', 18, 8);

            $table->string('status')->default('pending'); // pending, completed, cancelled

            $table->string('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
