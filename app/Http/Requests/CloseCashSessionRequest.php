<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseCashSessionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'actual_closing_balances' => 'required|array|min:1',
            'actual_closing_balances.*.currency_id' => 'required|exists:currencies,id',
            'actual_closing_balances.*.amount' => 'required|numeric|min:0',
        ];
    }
}
