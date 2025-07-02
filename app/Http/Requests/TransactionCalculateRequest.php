<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionCalculateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'amount_original' => 'required|numeric|min:0.01',  
        ];
    }

    public function messages(): array
    {
        return [
            'from_currency_id.required' => 'من فضلك اختر العملة المحولة منها.',
            'to_currency_id.required' => 'من فضلك اختر العملة المحولة إليها.',
            'amount_original.required' => 'المبلغ مطلوب.',
            'amount_original.numeric' => 'المبلغ يجب أن يكون رقمي.',
            'amount_original.min' => 'المبلغ يجب أن يكون أكبر من صفر.',
        ];
    }
}