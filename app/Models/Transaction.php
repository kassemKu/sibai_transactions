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
        'converted_amount',
        'assigned_to',
        'closed_by',
        'status', // 'pending', 'completed', 'cancelled'.
        'notes',
        'profit_from_usd',
        'profit_to_usd',
        'total_profit_usd',
        'usd_intermediate',
        'from_currency_rates_snapshot',
        'to_currency_rates_snapshot',
    ];

    public function cashMovements()
    {
        return $this->hasMany(CashMovement::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to', 'id');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by', 'id');
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

    public function getFromCurrencyRatesSnapshotAttribute($value)
    {
        return json_decode($value, true);
    }

    public function getToCurrencyRatesSnapshotAttribute($value)
    {
        return json_decode($value, true);
    }

    public function setFromCurrencyRatesSnapshotAttribute($value)
    {
        $this->attributes['from_currency_rates_snapshot'] = is_array($value) ? json_encode($value) : $value;
    }

    public function setToCurrencyRatesSnapshotAttribute($value)
    {
        $this->attributes['to_currency_rates_snapshot'] = is_array($value) ? json_encode($value) : $value;
    }
}
