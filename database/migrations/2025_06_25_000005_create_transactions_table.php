<?php

use App\Enums\TransactionStatusEnum;
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
            $table->foreignId('closed_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');

            $table->foreignId('from_currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('to_currency_id')->nullable()->constrained('currencies')->onUpdate('cascade')->onDelete('set null');

            $table->decimal('original_amount', 18, 2);
            $table->decimal('converted_amount', 18, 2);
            $table->decimal('profit_from_usd', 18, 2)->default(0);
            $table->decimal('profit_to_usd', 18, 2)->default(0);
            $table->decimal('total_profit_usd', 18, 2)->default(0);
            $table->decimal('usd_intermediate', 18, 2)->default(0);

            // Snapshots
            $table->json('from_currency_rates_snapshot');
            $table->json('to_currency_rates_snapshot');

            $table->string('status')->default(TransactionStatusEnum::PENDING->value); // pending, completed, cancelled

            $table->string('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
