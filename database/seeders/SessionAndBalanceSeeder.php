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
        DB::transaction(function () {
            $adminId = 1;

            $exchangeRates = CurrencyRate::all()->mapWithKeys(fn ($rate) => [
                $rate->currency_id => [
                    'rate_to_usd' => $rate->rate_to_usd,
                    'margin' => $rate->profit_margin_percent,
                ],
            ])->toArray();

            $firstSession = CashSession::create([
                'opened_at' => Carbon::now(),
                'closed_at' => null,
                'opened_by' => $adminId,
                'closed_by' => null,
                'open_exchange_rates' => json_encode($exchangeRates),
                'close_exchange_rates' => null,
                'is_closed' => false,
            ]);

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
                $amount = $openingBalances[$currency->code] ?? 0;

                SessionOpeningBalance::create([
                    'cash_session_id' => $firstSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $amount,
                ]);
            }

            $firstSession->update([
                'closed_at' => Carbon::now()->addHours(8),
                'closed_by' => $adminId,
                'is_closed' => true,
                'close_exchange_rates' => json_encode($exchangeRates),
            ]);

            foreach ($currencies as $currency) {
                $amount = $openingBalances[$currency->code] ?? 0;

                CashBalance::create([
                    'cash_session_id' => $firstSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $amount,
                    'total_in' => 0,
                    'total_out' => 0,
                    'closing_balance' => $amount,
                    'actual_closing_balance' => $amount,
                    'difference' => 0,
                ]);
            }
        });
    }
}
