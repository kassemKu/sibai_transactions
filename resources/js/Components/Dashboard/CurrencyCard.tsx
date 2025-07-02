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
      className="currency-card border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 w-[280px] cursor-grab active:cursor-grabbing"
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
          {/* Currency movement arrow - alternating for demo */}
          <div className="flex items-center gap-1">
            {currency.id % 2 === 0 ? (
              <>
                <FiArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500 font-medium">
                  +2.5%
                </span>
              </>
            ) : (
              <>
                <FiArrowDown className="w-4 h-4 text-red" />
                <span className="text-xs text-red font-medium">-1.2%</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-bold-x20 text-primaryBlue font-bold">
              {parseFloat(currency.rate_to_usd).toLocaleString(
                'ar-EG',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                },
              )}
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
