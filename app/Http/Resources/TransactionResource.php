<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'from_currency_id' => $this->from_currency_id,
            'to_currency_id' => $this->to_currency_id,
            'original_amount' => $this->original_amount,
            'amount_usd' => $this->amount_usd,
            'exchange_rate_used' => $this->exchange_rate_used,
            'market_exchange_rate' => $this->market_exchange_rate,
            'profit_usd' => $this->profit_usd,
            'created_at' => $this->created_at,
        ];
    }
}
