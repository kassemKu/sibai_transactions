<?php

namespace Database\Seeders;

use App\Models\CashBalance;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\CurrencyRate;
use App\Models\SessionOpeningBalance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SessionAndBalanceSeeder extends Seeder
{
    public function run()
    {
        DB::beginTransaction();
        try {
            // Create the first cash session
            $firstCashSession = CashSession::create([
                'opened_at' => Carbon::now(),
                'closed_at' => null,
                'opened_by' => 1, // You may want to use the real admin id
                'closed_by' => null,
                'open_exchange_rates' => json_encode(CurrencyRate::pluck('rate_to_usd', 'currency_id')->toArray()),
                'close_exchange_rates' => null,
                'is_closed' => false,
            ]);

            // Define specific opening balances for each currency code
            $openingBalances = [
                'USD' => 5000,
                'SYP' => 10000000,
                'TRY' => 20000,
                'EUR' => 3000,
                'JOD' => 1000,
                'SAR' => 15000,
                'AED' => 12000,
                'GBP' => 2500,
            ];

            $currencies = Currency::all();
            foreach ($currencies as $currency) {
                $openingBalance = $openingBalances[$currency->code] ?? 0; // fallback to 0 if not set
                SessionOpeningBalance::create([
                    'cash_session_id' => $firstCashSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingBalance,
                ]);
            }

            // Close the session
            $firstCashSession->update([
                'closed_at' => Carbon::now()->addHours(8), // Example: session lasted 8 hours
                'closed_by' => 1, // You may want to use the real admin id
                'close_exchange_rates' => json_encode(CurrencyRate::pluck('rate_to_usd', 'currency_id')->toArray()),
                'is_closed' => true,
            ]);

            // Create CashBalance for each currency based on the opening
            foreach ($currencies as $currency) {
                $openingBalance = $openingBalances[$currency->code] ?? 0;
                CashBalance::create([
                    'cash_session_id' => $firstCashSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingBalance,
                    'total_in' => 0,
                    'total_out' => 0,
                    'closing_balance' => $openingBalance,
                    'actual_closing_balance' => $openingBalance,
                    'difference' => 0,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
