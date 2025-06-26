<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'user_id',
        'cash_session_id',
        'from_currency_id',
        'to_currency_id',
        'amount_original',
        'amount_usd',
        'exchange_rate_used',
        'market_exchange_rate',
        'profit_usd',
    ];

    public function cashMovements()
    {
        return $this->hasMany(CashMovement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cashSession()
    {
        return $this->belongsTo(CashSession::class);
    }

    public function fromCurrency()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
