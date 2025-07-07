<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'rate_to_usd'];

    public function cashMovements()
    {
        return $this->hasMany(CashMovement::class);
    }

    public function fromTransactions()
    {
        return $this->hasMany(Transaction::class, 'from_currency_id');
    }

    public function toTransactions()
    {
        return $this->hasMany(Transaction::class, 'to_currency_id');
    }

    public function cashBalances()
    {
        return $this->hasMany(CashBalance::class);
    }
}
