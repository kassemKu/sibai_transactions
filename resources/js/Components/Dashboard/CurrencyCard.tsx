import React from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import { Currency } from '@/types';
import { FiArrowUp, FiArrowDown, FiEdit3 } from 'react-icons/fi';

interface CurrencyCardProps {
  currency: Currency;
  onEdit?: (currency: Currency) => void;
  isEditable?: boolean;
}

export default function CurrencyCard({
  currency,
  onEdit,
  isEditable = false,
}: CurrencyCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from interfering with Swiper
    if (isEditable && onEdit) {
      onEdit(currency);
    }
  };

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
