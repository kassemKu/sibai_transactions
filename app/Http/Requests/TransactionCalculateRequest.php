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
            'amount' => 'required|numeric|min:0.01',
        ];
    }

    public function messages(): array
    {
        return [
            'from_currency_id.required' => 'من فضلك اختر العملة المحولة منها.',
            'to_currency_id.required' => 'من فضلك اختر العملة المحولة إليها.',
            'amount.required' => 'المبلغ مطلوب.',
            'amount.numeric' => 'المبلغ يجب أن يكون رقمي.',
            'amount.min' => 'المبلغ يجب أن يكون أكبر من صفر.',
        ];
    }
}
