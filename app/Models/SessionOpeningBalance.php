<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionOpeningBalance extends Model
{
    use HasFactory;

    protected $fillable = ['cash_session_id', 'currency_id', 'opening_balance'];

    public function cashSession()
    {
        return $this->belongsTo(CashSession::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
