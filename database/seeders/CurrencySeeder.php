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
            ['name' => 'دولار سوري',    'code' => 'SYP'],
            ['name' => 'ليرة تركية',     'code' => 'TRY'],
            ['name' => 'يورو',         'code' => 'EUR'],
            ['name' => 'دينار أردني',   'code' => 'JOD'],
            ['name' => 'ريال سعودي',    'code' => 'SAR'],
            ['name' => 'درهم إماراتي',  'code' => 'AED'],
            ['name' => 'جنيه إسترليني', 'code' => 'GBP'],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                ['name' => $currency['name'], 'is_crypto' => false]
            );
        }
    }
}
