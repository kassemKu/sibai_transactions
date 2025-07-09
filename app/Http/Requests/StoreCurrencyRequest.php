<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrencyRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:30',
            'code' => 'required|string|max:3|unique:currencies,code',
            'rate_to_usd' => 'required|numeric|gt:0',
            'amount' => 'numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'يرجى إدخال اسم العملة.',
            'name.string' => 'اسم العملة يجب أن يكون نصاً.',
            'name.max' => 'اسم العملة يجب ألا يتجاوز 30 حرفاً.',
            'code.required' => 'يرجى إدخال رمز العملة.',
            'code.string' => 'رمز العملة يجب أن يكون نصاً.',
            'code.max' => 'رمز العملة يجب ألا يتجاوز 3 أحرف.',
            'code.unique' => 'رمز العملة مستخدم من قبل.',
            'rate_to_usd.required' => 'يرجى إدخال سعر الصرف مقابل الدولار.',
            'rate_to_usd.numeric' => 'سعر الصرف يجب أن يكون رقماً.',
            'rate_to_usd.gt' => 'سعر الصرف يجب أن يكون أكبر من صفر.',
            'amount.numeric' => 'المبلغ يجب أن يكون رقماً.',
            'amount.min' => 'المبلغ يجب ألا يكون أقل من صفر.',
        ];
    }
}
