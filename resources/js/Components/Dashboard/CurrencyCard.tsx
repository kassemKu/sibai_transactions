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

  // Calculate SYP equivalent (old logic, kept for reference)
  const calculateSYPEquivalent = () => {
    if (!currencies || currencies.length === 0) return null;
    const sypCurrency = currencies.find(c => c.code === 'SYP');
    if (!sypCurrency) return null;
    const currencyBuyRate = parseFloat(currency.buy_rate_to_usd);
    const sypBuyRate = parseFloat(sypCurrency.buy_rate_to_usd);
    if (
      currencyBuyRate === 0 ||
      !isFinite(currencyBuyRate) ||
      !isFinite(sypBuyRate)
    )
      return null;
    const sypEquivalent = (1 / currencyBuyRate) * sypBuyRate;
    if (!isFinite(sypEquivalent) || sypEquivalent <= 0) return null;
    return {
      value: sypEquivalent,
      formatted: new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(sypEquivalent),
    };
  };

  // New SYP buy/sell calculation logic
  const calculateSYPBuySell = () => {
    if (!currencies || currencies.length === 0) return null;
    const sypCurrency = currencies.find(c => c.code === 'SYP');
    if (!sypCurrency) return null;
    const sypBuy = parseFloat(sypCurrency.buy_rate_to_usd);
    const sypSell = parseFloat(sypCurrency.sell_rate_to_usd);
    const curBuy = parseFloat(currency.buy_rate_to_usd);
    const curSell = parseFloat(currency.sell_rate_to_usd);
    if (
      !isFinite(sypBuy) ||
      !isFinite(sypSell) ||
      !isFinite(curBuy) ||
      !isFinite(curSell) ||
      curBuy === 0 ||
      curSell === 0
    )
      return null;
    const buyValue = sypBuy / curBuy;
    const sellValue = sypSell / curSell;
    return {
      buy: buyValue,
      sell: sellValue,
      buyFormatted: new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(buyValue),
      sellFormatted: new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(sellValue),
    };
  };

  // Helper to format buy/sell price for strong currencies
  const formatRate = (rate: number, code: string) => {
    if (rate < 1 && rate > 0) {
      // Show inverse for strong currencies
      const inverse = 1 / rate;
      return `${inverse.toFixed(4)} دولار`;
    }
    // Normal display for weaker currencies
    return `${rate.toFixed(4)}`;
  };

  const sypEquivalent = calculateSYPEquivalent();
  const sypBuySell = calculateSYPBuySell();

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
              {formatRate(parseFloat(currency.buy_rate_to_usd), currency.code)}
            </span>
          </div>

          {/* Sell Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiArrowUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">بيع</span>
            </div>
            <span className="text-lg font-bold text-red-600">
              {formatRate(parseFloat(currency.sell_rate_to_usd), currency.code)}
            </span>
          </div>

          <div className="text-xs text-gray-500 text-center bg-gray-100 px-2 py-1 rounded-full">
            مقابل 1 دولار أمريكي
          </div>

          {/* SYP Equivalent Line (new logic) */}
          {sypBuySell && currency.code !== 'SYP' && (
            <div className="text-xs text-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200 mt-2 flex flex-col gap-1">
              <span>
                1 {currency.name} ≈ {sypBuySell.buyFormatted} ل.س (شراء)
              </span>
              <span>
                1 {currency.name} ≈ {sypBuySell.sellFormatted} ل.س (بيع)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
