<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetCasherCashMovementsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cash_session_id' => 'required|exists:cash_sessions,id',
            'user_id' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'session_id.required' => 'يرجى تحديد رقم الجلسة النقدية.',
            'session_id.exists' => 'الجلسة النقدية المحددة غير موجودة.',
            'user_id.required' => 'يرجى تحديد رقم الموظف.',
            'user_id.exists' => 'الموظف المحدد غير موجود.',
        ];
    }
}
