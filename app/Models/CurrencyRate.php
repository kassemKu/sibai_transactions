<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CurrencyRate extends Model
{
    use HasFactory;

    protected $fillable = ['currency_id', 'rate_to_usd', 'profit_margin_percent', 'date'];

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
