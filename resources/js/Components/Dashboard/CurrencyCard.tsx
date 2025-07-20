import React from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import { Currency, CurrenciesResponse } from '@/types';
import { FiArrowUp, FiArrowDown, FiEdit3, FiDollarSign } from 'react-icons/fi';

interface CurrencyCardProps {
  currency: Currency;
  currencies?: CurrenciesResponse; // Add currencies prop to access SYP rates
  onEdit?: (currency: Currency) => void;
  isEditable?: boolean;
}

export default function CurrencyCard({
  currency,
  currencies = [],
  onEdit,
  isEditable = false,
}: CurrencyCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from interfering with Swiper
    if (isEditable && onEdit) {
      onEdit(currency);
    }
  };

  // Calculate SYP equivalent
  const calculateSYPEquivalent = () => {
    if (!currencies || currencies.length === 0) return null;

    const sypCurrency = currencies.find(c => c.code === 'SYP');
    if (!sypCurrency) return null;

    // Calculate: (1 / currency_rate_to_usd) * syp_rate_to_usd
    const currencyRate = parseFloat(currency.rate_to_usd);
    const sypRate = parseFloat(sypCurrency.rate_to_usd);

    if (currencyRate === 0 || !isFinite(currencyRate) || !isFinite(sypRate)) return null;

    const sypEquivalent = (1 / currencyRate) * sypRate;

    if (!isFinite(sypEquivalent) || sypEquivalent <= 0) return null;

    return {
      value: sypEquivalent,
      formatted: new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(sypEquivalent)
    };
  };

  const sypEquivalent = calculateSYPEquivalent();

  return (
    <Card
      className={`currency-card border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 w-[280px] transition-all duration-200 ${
        isEditable
          ? 'relative group hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
          : 'cursor-grab active:cursor-grabbing'
      }`}
      padding="xs"
    >
      {/* Clickable overlay for admins */}
      {isEditable && (
        <div
          className="absolute inset-0 z-0 cursor-pointer"
          onClick={handleEditClick}
          title="اضغط لتعديل العملة"
        />
      )}

      <CardContent className="flex flex-col justify-between gap-4 px-6 py-4 relative z-10">
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
          {isEditable && (
            <button
              onClick={handleEditClick}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors z-20 relative"
              title="تعديل العملة"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {/* Reference Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">مرجعي</span>
            </div>
            <span className="text-lg font-bold text-yellow-600">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
                useGrouping: true,
              }).format(parseFloat(currency.rate_to_usd))}
            </span>
          </div>

          {/* Buy Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">شراء</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
                useGrouping: true,
              }).format(parseFloat(currency.buy_rate_to_usd))}
            </span>
          </div>

          {/* Sell Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiArrowUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">بيع</span>
            </div>
            <span className="text-lg font-bold text-red-600">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
                useGrouping: true,
              }).format(parseFloat(currency.sell_rate_to_usd))}
            </span>
          </div>

          <div className="text-xs text-gray-500 text-center bg-gray-100 px-2 py-1 rounded-full">
            مقابل 1 دولار أمريكي
          </div>

          {/* SYP Equivalent Line */}
          {sypEquivalent && currency.code !== 'SYP' && (
            <div className="text-xs text-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
              1 {currency.name} ≈ {sypEquivalent.formatted} ليرة سورية
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
