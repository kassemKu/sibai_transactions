<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'currency_id',
        'type',
        'amount',
        'exchange_rate',
        'notes',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
