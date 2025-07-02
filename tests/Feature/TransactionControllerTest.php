<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class TransactionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Artisan::call('db:seed');
    }

    protected function tearDown(): void
    {
        parent::tearDown();
    }

    public function test_create_transaction_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        // Open a session first
        $this->postJson('/cash-session/start');
        $currencies = Currency::pluck('id', 'code');
        $data = [
            'customer_name' => 'Test Customer',
            'from_currency_id' => $currencies['USD'],
            'to_currency_id' => $currencies['EUR'],
            'amount_original' => 100,
        ];
        $response = $this->postJson('/transactions', $data);
        $response->assertStatus(201)->assertJsonStructure(['id', 'customer_name', 'user_id', 'cash_session_id']);
        $this->assertDatabaseHas('transactions', ['customer_name' => 'Test Customer']);
    }

    public function test_create_transaction_fails_without_open_session()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $currencies = Currency::pluck('id', 'code');
        $data = [
            'customer_name' => 'Test Customer',
            'from_currency_id' => $currencies['USD'],
            'to_currency_id' => $currencies['EUR'],
            'amount_original' => 100,
        ];
        $response = $this->postJson('/transactions', $data);
        $response->assertStatus(500);
    }
}
