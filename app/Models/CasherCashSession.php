<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CasherCashSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'opened_at',
        'closed_at',
        'opened_by',
        'closed_by',
        'opening_balances',
        'system_balances',
        'actual_closing_balances',
        'cash_session_id',
        'casher_id',
        'status', // 'active', 'closed', 'pending'
    ];

    public function openedBy()
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function cashSession()
    {
        return $this->belongsTo(CashSession::class, 'cash_session_id');
    }

    public function casher()
    {
        return $this->belongsTo(User::class, 'casher_id');
    }

    public function getOpeningBalancesAttribute($value)
    {
        return json_decode($value, true);
    }

    public function getSystemBalancesAttribute($value)
    {
        return json_decode($value, true);
    }

    public function getActualClosingBalancesAttribute($value)
    {
        return json_decode($value, true);
    }
}
