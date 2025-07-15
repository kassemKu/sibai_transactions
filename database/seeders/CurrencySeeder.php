<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run()
    {
        $currencyData = [
            [
                'name' => 'دولار أمريكي',
                'code' => 'USD',
                'rate_to_usd' => 1.000000,
                'buy_rate_to_usd' => 1.000000,
                'sell_rate_to_usd' => 1.000000,
            ],
            [
                'name' => 'ليرة سوري',
                'code' => 'SYP',
                'rate_to_usd' => 15000.000000,
                'buy_rate_to_usd' => 14850.000000,
                'sell_rate_to_usd' => 15150.000000,
            ],
            [
                'name' => 'ليرة تركية',
                'code' => 'TRY',
                'rate_to_usd' => 32.500000,
                'buy_rate_to_usd' => 32.20,
                'sell_rate_to_usd' => 32.80,
            ],
            [
                'name' => 'يورو',
                'code' => 'EUR',
                'rate_to_usd' => 0.930000,
                'buy_rate_to_usd' => 0.925000,
                'sell_rate_to_usd' => 0.935000,
            ],
            [
                'name' => 'دينار أردني',
                'code' => 'JOD',
                'rate_to_usd' => 0.710000,
                'buy_rate_to_usd' => 0.706000,
                'sell_rate_to_usd' => 0.714000,
            ],
            [
                'name' => 'ريال سعودي',
                'code' => 'SAR',
                'rate_to_usd' => 3.750000,
                'buy_rate_to_usd' => 3.72,
                'sell_rate_to_usd' => 3.78,
            ],
            [
                'name' => 'درهم إماراتي',
                'code' => 'AED',
                'rate_to_usd' => 3.670000,
                'buy_rate_to_usd' => 3.64,
                'sell_rate_to_usd' => 3.70,
            ],
            [
                'name' => 'جنيه إسترليني',
                'code' => 'GBP',
                'rate_to_usd' => 0.790000,
                'buy_rate_to_usd' => 0.785000,
                'sell_rate_to_usd' => 0.795000,
            ],
        ];

        // Seed
        foreach ($currencyData as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                [
                    'name' => $currency['name'],
                    'rate_to_usd' => $currency['rate_to_usd'],
                    'buy_rate_to_usd' => $currency['buy_rate_to_usd'],
                    'sell_rate_to_usd' => $currency['sell_rate_to_usd'],
                ]
            );
        }
    }
}
