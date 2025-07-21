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
        'cash_session_id',
        'by',
        'sub', // Indicates if this movement is a sub-movement (e.g., created by a casher)
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function session()
    {
        return $this->belongsTo(CashSession::class, 'cash_session_id', 'id');
    }

    public function by()
    {
        return $this->belongsTo(User::class, 'by', 'id');
    }
}
