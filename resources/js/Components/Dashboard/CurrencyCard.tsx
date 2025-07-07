import React from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import { Currency } from '@/types';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface CurrencyCardProps {
  currency: Currency;
}

export default function CurrencyCard({ currency }: CurrencyCardProps) {
  return (
    <Card
      className="currency-card border border-gray-200  hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 w-[280px] cursor-grab active:cursor-grabbing"
      padding="xs"
    >
      <CardContent className="flex flex-col justify-between gap-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currency.code.substring(0, 3)}
              </span>
            </div>
            <div>
              <h3 className="text-bold-x16 text-text-black">{currency.name}</h3>
              <span className="text-med-x14 text-text-grey-light">
                {currency.code}
              </span>
            </div>
          </div>
  
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-bold-x20 text-primaryBlue font-bold">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
                useGrouping: true,
              }).format(parseFloat(currency.rate_to_usd))}
            </span>
          </div>
          <div className="text-xs text-gray-500 text-right bg-gray-100 px-2 py-1 rounded-full">
            مقابل 1 دولار أمريكي
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
