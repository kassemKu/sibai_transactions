<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:30',
            'rate_to_usd' => 'required|numeric|gt:0',
            'buy_rate_to_usd' => 'required|numeric|gt:0',
            'sell_rate_to_usd' => 'required|numeric|gt:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'يرجى إدخال اسم العملة.',
            'name.string' => 'اسم العملة يجب أن يكون نصاً.',
            'name.max' => 'اسم العملة يجب ألا يتجاوز 30 حرفاً.',
            'rate_to_usd.required' => 'يرجى إدخال السعر المرجعي مقابل الدولار.',
            'rate_to_usd.numeric' => 'السعر المرجعي يجب أن يكون رقماً.',
            'rate_to_usd.gt' => 'السعر المرجعي يجب أن يكون أكبر من صفر.',
            'buy_rate_to_usd.required' => 'يرجى إدخال سعر الشراء مقابل الدولار.',
            'buy_rate_to_usd.numeric' => 'سعر الشراء يجب أن يكون رقماً.',
            'buy_rate_to_usd.gt' => 'سعر الشراء يجب أن يكون أكبر من صفر.',
            'sell_rate_to_usd.required' => 'يرجى إدخال سعر البيع مقابل الدولار.',
            'sell_rate_to_usd.numeric' => 'سعر البيع يجب أن يكون رقماً.',
            'sell_rate_to_usd.gt' => 'سعر البيع يجب أن يكون أكبر من صفر.',
        ];
    }
}
