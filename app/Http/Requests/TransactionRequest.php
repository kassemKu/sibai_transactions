<?php

namespace App\Http\Requests;

use App\Rules\SufficientBalance;
use App\Services\TransactionService;
use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    protected $calc;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $fromCurrencyId = $this->input('from_currency_id');
        $toCurrencyId = $this->input('to_currency_id');
        $amount = $this->input('original_amount');
        if ($fromCurrencyId && $toCurrencyId && $amount) {
            $service = app(TransactionService::class);
            $this->calc = $service->calculateCore($fromCurrencyId, $toCurrencyId, $amount);
        }
    }

    public function rules()
    {
        $calc = $this->calc;

        return [
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'assigned_to' => 'required|exists:users,id',
            'original_amount' => [
                'required',
                'numeric',
                'min:0.01',
                new SufficientBalance($calc),
            ],
            'converted_amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:255',
        ];
    }

    public function getCalc()
    {
        return $this->calc;
    }

    public function messages(): array
    {
        return [
            'from_currency_id.required' => 'من فضلك اختر العملة المحولة منها.',
            'to_currency_id.required' => 'من فضلك اختر العملة المحولة إليها.',
            'original_amount.required' => 'المبلغ مطلوب.',
            'original_amount.numeric' => 'المبلغ يجب أن يكون رقمي.',
            'original_amount.min' => 'المبلغ يجب أن يكون أكبر من صفر.',
            'converted_amount.required' => 'المبلغ المحول مطلوب.',
            'converted_amount.numeric' => 'المبلغ المحول يجب أن يكون رقمي.',
            'converted_amount.min' => 'المبلغ المحول يجب أن يكون أكبر من صفر.',
        ];
    }
}
