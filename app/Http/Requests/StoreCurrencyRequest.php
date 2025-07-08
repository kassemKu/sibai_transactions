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
}
