<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'opened_at',
        'closed_at',
        'opened_by',
        'closed_by',
        'open_exchange_rates',
        'close_exchange_rates',
        'status', // 'active', 'closed', 'pending'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function cashBalances()
    {
        return $this->hasMany(CashBalance::class);
    }

    public function openedBy()
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}
