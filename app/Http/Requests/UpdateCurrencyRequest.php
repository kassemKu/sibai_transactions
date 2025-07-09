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
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'يرجى إدخال اسم العملة.',
            'name.string' => 'اسم العملة يجب أن يكون نصاً.',
            'name.max' => 'اسم العملة يجب ألا يتجاوز 30 حرفاً.',
            'rate_to_usd.required' => 'يرجى إدخال سعر الصرف مقابل الدولار.',
            'rate_to_usd.numeric' => 'سعر الصرف يجب أن يكون رقماً.',
            'rate_to_usd.gt' => 'سعر الصرف يجب أن يكون أكبر من صفر.',
        ];
    }
}
