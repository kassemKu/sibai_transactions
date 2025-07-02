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
            'original_amount' => 'required|numeric|min:0.01',
        ];
    }

    public function messages(): array
    {
        return [
            'from_currency_id.required' => 'من فضلك اختر العملة المحولة منها.',
            'to_currency_id.required' => 'من فضلك اختر العملة المحولة إليها.',
            'original_amount.required' => 'المبلغ مطلوب.',
            'original_amount.numeric' => 'المبلغ يجب أن يكون رقمي.',
            'original_amount.min' => 'المبلغ يجب أن يكون أكبر من صفر.',
        ];
    }
}
