<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'created_by',
        'cash_session_id',
        'from_currency_id',
        'to_currency_id',
        'original_amount',
        'from_rate_to_usd',
        'to_rate_to_usd',
        'converted_amount',
        'assigned_to',
        'status', // 'pending', 'completed', 'cancelled'.
        'notes',
    ];

    public function cashMovements()
    {
        return $this->hasMany(CashMovement::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
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
