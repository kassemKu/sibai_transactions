<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $fillable = ['company_id', 'currency_id', 'amount', 'type'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
