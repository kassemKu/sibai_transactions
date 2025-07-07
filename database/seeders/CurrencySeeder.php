<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run()
    {
        $currencies = [
            ['name' => 'دولار أمريكي',  'code' => 'USD'],
            ['name' => 'ليرة سوري',    'code' => 'SYP'],
            ['name' => 'ليرة تركية',     'code' => 'TRY'],
            ['name' => 'يورو',         'code' => 'EUR'],
            ['name' => 'دينار أردني',   'code' => 'JOD'],
            ['name' => 'ريال سعودي',    'code' => 'SAR'],
            ['name' => 'درهم إماراتي',  'code' => 'AED'],
            ['name' => 'جنيه إسترليني', 'code' => 'GBP'],
        ];

        $rates = [
            'USD' => 1.0,
            'SYP' => 14000.0,
            'TRY' => 32.5,
            'EUR' => 0.93,
            'JOD' => 0.71,
            'SAR' => 3.75,
            'AED' => 3.67,
            'GBP' => 0.79,
        ];

        $profits = [
            'USD' => 0.0,
            'SYP' => 0.0,
            'TRY' => 0.0,
            'EUR' => 0.0,
            'JOD' => 0.0,
            'SAR' => 0.0,
            'AED' => 0.0,
            'GBP' => 0.0,
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                [
                    'name' => $currency['name'],
                    'rate_to_usd' => $rates[$currency['code']],
                ]
            );
        }
    }
}
