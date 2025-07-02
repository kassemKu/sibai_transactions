<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index()
    {
        return $this->success('Currencies retrieved successfully.', [
            'currencies' => Currency::all(),
        ]);
    }

    public function show(Currency $currency)
    {
        return $this->success('Currency retrieved successfully.', [
            'currency' => $currency,
        ]);
    }

    public function update(Request $request, Currency $currency)
    {
        $currency->update($request->validate([
            'name' => 'required|string|max:30',
            'rate_to_usd' => 'required|numeric|gt:0',
        ]));

        return $this->success('Currency updated successfully.', [
            'currency' => $currency,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:30',
            'code' => 'required|string|max:3|unique:currencies,code',
            'rate_to_usd' => 'required|numeric|gt:0',
        ]);

        $currency = Currency::create($data);

        return $this->success('Currency created successfully.', [
            'currency' => $currency,
        ]);
    }
}
