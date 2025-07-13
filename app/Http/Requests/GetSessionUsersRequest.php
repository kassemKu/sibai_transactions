<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetSessionUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cash_session_id' => 'required|exists:cash_sessions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'cash_session_id.required' => 'يرجى تحديد رقم الجلسة النقدية.',
            'cash_session_id.exists' => 'الجلسة النقدية المحددة غير موجودة.',
        ];
    }
}
