<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('casher_cash_sessions', function (Blueprint $table) {
            $table->id();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('closed_by')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->json('opening_balances')->nullable();
            $table->json('system_balances')->nullable();
            $table->json('actual_closing_balances')->nullable();
            $table->foreignId('cash_session_id')->nullable()->constrained('cash_sessions')->onUpdate('cascade')->onDelete('set null');
            $table->foreignId('casher_id')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
            $table->string('status')->default('active'); // 'active', 'closed', 'pending'
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('casher_cash_sessions');
    }
};
