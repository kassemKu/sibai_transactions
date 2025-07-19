<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role_id' => 'required|exists:roles,id',
        ];

        // Password is required for create, optional for update
        if ($this->isMethod('POST')) {
            // Create operation
            $rules['password'] = 'required|string|min:6';
        } else {
            // Update operation
            $rules['password'] = 'nullable|string|min:6';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'الاسم مطلوب.',
            'name.string' => 'الاسم يجب أن يكون نصاً.',
            'name.max' => 'الاسم يجب ألا يزيد عن 255 حرفاً.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.max' => 'البريد الإلكتروني يجب ألا يزيد عن 255 حرفاً.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.string' => 'كلمة المرور يجب أن تكون نصاً.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
            'password.nullable' => 'كلمة المرور اختيارية.',
            'role_id.required' => 'الدور مطلوب.',
            'role_id.exists' => 'الدور المحدد غير موجود.',
        ];
    }
}
