<?php

namespace App\Http\Requests\Casher;

use Illuminate\Foundation\Http\FormRequest;

class OpenCasherCashSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'casher_id' => 'required|exists:users,id',
            'opening_balances' => 'required|array|min:1',
            'opening_balances.*.currency_id' => 'required|exists:currencies,id|distinct',
            'opening_balances.*.amount' => 'required|numeric|min:0',
            'transfers' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'casher_id.required' => 'يرجى تحديد رقم الموظف.',
            'casher_id.exists' => 'الموظف المحدد غير موجود.',
            'opening_balances.required' => 'يرجى إدخال أرصدة البداية.',
            'opening_balances.array' => 'أرصدة البداية يجب أن تكون مصفوفة.',
            'opening_balances.min' => 'يجب إدخال رصيد واحد على الأقل.',
            'opening_balances.*.currency_id.required' => 'يرجى تحديد العملة لكل رصيد.',
            'opening_balances.*.currency_id.exists' => 'العملة المحددة غير موجودة.',
            'opening_balances.*.currency_id.distinct' => 'يجب ألا تتكرر العملة في أرصدة البداية.',
            'opening_balances.*.amount.required' => 'يرجى إدخال المبلغ لكل عملة.',
            'opening_balances.*.amount.numeric' => 'المبلغ يجب أن يكون رقماً.',
            'opening_balances.*.amount.min' => 'المبلغ يجب ألا يكون أقل من صفر.',
        ];
    }
}
