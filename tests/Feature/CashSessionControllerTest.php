<?php

namespace Tests\Feature;

use App\Models\CashSession;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class CashSessionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Artisan::call('db:seed');
    }

    public function test_start_session_creates_new_session_and_balances()
    {
        $user = User::where('id', 1)->first();
        $this->actingAs($user);
        $token = bin2hex(random_bytes(32));
        $response = $this->withSession(['_token' => $token])
            ->post('/cash-sessions/open', ['_token' => $token]);
        $response->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('cash_sessions', ['opened_by' => $user->id, 'is_closed' => false]);
        $this->assertDatabaseCount('cash_balances', Currency::count());
    }

    public function test_start_session_fails_if_session_open()
    {
        $user = User::where('id', 1)->first();
        $this->actingAs($user);
        CashSession::factory()->create(['is_closed' => false]);
        $response = $this->postJson('/cash-session/open');
        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_end_session_closes_latest_open_session()
    {
        $user = User::where('id', 1)->first();
        $this->actingAs($user);
        $this->postJson('/cash-sessions/close');
        $closing = Currency::pluck('code')->mapWithKeys(fn ($c) => [$c => 100])->toArray();
        $actual = Currency::pluck('code')->mapWithKeys(fn ($c) => [$c => 100])->toArray();
        $response = $this->postJson('/cash-session/end', [
            'closing_balances' => $closing,
            'actual_closing_balances' => $actual,
        ]);
        $response->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('cash_sessions', ['is_closed' => true]);
    }
}
