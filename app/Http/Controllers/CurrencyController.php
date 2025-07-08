<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Currency;
use Illuminate\Support\Facades\DB;

class CurrencyController extends Controller
{
    public function index()
    {
        return inertia('Currencies/Index')->with([
            'currencies' => Currency::all(),
        ]);
    }

    public function show(Currency $currency)
    {
        return inertia('Currencies/Show')->with([
            'currency' => $currency,
        ]);
    }

    public function edit(Currency $currency)
    {
        return inertia('Currencies/Edit')->with([
            'currency' => $currency,
        ]);
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency)
    {
        try {
            $currency->update($request->validated());

            return $this->success('Currency updated successfully.', [
                'currency' => $currency,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CurrencyController@update');

            return $this->failed('Failed to update currency');
        }
    }

    public function store(StoreCurrencyRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $currency = Currency::create($data);

            $currency->cashBalances()->create([
                'opening_balance' => $request->amount ?? 0,
                'cash_session_id' => $request->cash_session->id,
            ]);

            DB::commit();

            return $this->success('Currency created successfully.', [
                'currency' => $currency,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            $this->errorLog($e, 'CurrencyController@store');

            return $this->failed('Failed to create currency');
        }
    }

    public function getCurrencies()
    {
        return $this->success('Currencies retrieved successfully.', [
            'currencies' => Currency::all(),
        ]);
    }

    public function create()
    {
        return inertia('Currencies/Create');
    }
}
