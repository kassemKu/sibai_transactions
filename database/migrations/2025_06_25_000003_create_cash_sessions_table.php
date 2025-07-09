<?php

use App\Enums\CashSessionEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->id();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->json('open_exchange_rates');
            $table->json('close_exchange_rates')->nullable();
            $table->string('status')->default(CashSessionEnum::ACTIVE->value)->index(); // active, pending, closed

            $table->foreignId('opened_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('closed_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
