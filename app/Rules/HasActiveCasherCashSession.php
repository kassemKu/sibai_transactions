<?php

namespace App\Rules;

use App\Enums\CashSessionEnum;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;

class HasActiveCasherCashSession implements ValidationRule
{
    public function validate(string $attribute, mixed $value, \Closure $fail): void
    {
        $user = User::find($value);
        if (! $user) {
            $fail('المستخدم غير موجود.');

            return;
        }
        $lastSession = $user->casherCashSessions()->latest()->first();
        if (! ($lastSession && $lastSession->status === CashSessionEnum::ACTIVE->value)) {
            $fail('لا يوجد لدى المستخدم المعين جلسة نقدية نشطة.');
        }
    }
}
