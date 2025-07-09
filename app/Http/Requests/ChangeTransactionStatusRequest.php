<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeTransactionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:completed,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'يرجى تحديد حالة المعاملة.',
            'status.in' => 'الحالة المختارة غير صحيحة. يجب أن تكون:  مكتملة أو ملغاة.',
        ];
    }
}
