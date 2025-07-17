<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|exists:companies,id',
            'receive' => 'required_without:delivery|numeric',
            'delivery' => 'required_without:receive|numeric',
            'currency_id' => 'required|exists:currencies,id',
        ];
    }
}