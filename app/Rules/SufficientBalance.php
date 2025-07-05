<?php

namespace App\Rules;

use App\Services\TransactionService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SufficientBalance implements ValidationRule
{
    protected $calc;

    public function __construct($calc)
    {
        $this->calc = $calc;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            $service = app(TransactionService::class);
            if (! $service->hasSufficientBalance($this->calc['to_currency_id'], $this->calc['converted_amount'])) {
                $fail('Insufficient balance for the transaction.');
            }
        } catch (\Exception $e) {
            $fail($e->getMessage() ?: 'Unable to validate balance.');
        }
    }
}
