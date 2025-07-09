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

            return $this->success('تم تحديث بيانات العملة بنجاح.', [
                'currency' => $currency->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CurrencyController@update');

            return $this->failed('حدث خطأ أثناء تحديث بيانات العملة');
        }
    }

    public function store(StoreCurrencyRequest $request)
    {
        try {
            DB::beginTransaction();

            $currency = Currency::create($request->validated());

            $currency->cashBalances()->create([
                'opening_balance' => $request->amount ?? 0,
                'cash_session_id' => $request->session->id,
            ]);

            DB::commit();

            return $this->success('تم إضافة العملة الجديدة بنجاح.', [
                'currency' => $currency,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            $this->errorLog($e, 'CurrencyController@store');

            return $this->failed('حدث خطأ أثناء إضافة العملة الجديدة');
        }
    }

    public function create()
    {
        return inertia('Currencies/Create');
    }
}
