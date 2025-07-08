<?php

namespace App\Enums;

enum CashSessionEnum: string
{
    case ACTIVE = 'active';
    case CLOSED = 'closed';
    case PENDING = 'pending';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
