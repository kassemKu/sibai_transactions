<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseCasherCashSessionRequest extends FormRequest
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

    public function messages(): array
    {
        return [
            'actual_closing_balances.required' => 'يرجى إدخال أرصدة الإغلاق الفعلية.',
            'actual_closing_balances.array' => 'أرصدة الإغلاق الفعلية يجب أن تكون مصفوفة.',
            'actual_closing_balances.min' => 'يجب إدخال رصيد واحد على الأقل.',
            'actual_closing_balances.*.currency_id.required' => 'يرجى تحديد العملة لكل رصيد.',
            'actual_closing_balances.*.currency_id.exists' => 'العملة المحددة غير موجودة.',
            'actual_closing_balances.*.amount.required' => 'يرجى إدخال المبلغ لكل عملة.',
            'actual_closing_balances.*.amount.numeric' => 'المبلغ يجب أن يكون رقماً.',
            'actual_closing_balances.*.amount.min' => 'المبلغ يجب ألا يكون أقل من صفر.',
        ];
    }
}
