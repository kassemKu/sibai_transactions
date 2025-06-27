<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\CurrencyRate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CurrencyRateSeeder extends Seeder
{
    public function run()
    {
        $rates = [
            'USD' => 1.0,       // base
            'SYP' => 14000.0,   // example
            'TRY' => 32.5,
            'EUR' => 0.93,
            'JOD' => 0.71,
            'SAR' => 3.75,
            'AED' => 3.67,
            'GBP' => 0.79,
        ];

        foreach ($rates as $code => $rate) {
            $currency = Currency::where('code', $code)->first();

            if ($currency) {
                CurrencyRate::updateOrCreate(
                    [
                        'currency_id' => $currency->id,
                        'date' => Carbon::today()->toDateString(),
                    ],
                    [
                        'rate_to_usd' => $rate,
                        'profit_margin_percent' => 1.0,
                    ]
                );
            }
        }
    }
}
