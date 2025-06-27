<?php

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
            $table->boolean('is_closed')->default(false);

            $table->unsignedBigInteger('opened_by')->nullable();
            $table->foreign('opened_by')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');

            $table->unsignedBigInteger('closed_by')->nullable();
            $table->foreign('closed_by')->references('id')->on('users')->onDelete('set null')->onUpdate('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
