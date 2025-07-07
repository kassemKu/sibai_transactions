import React from 'react';
import { router } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Currency } from '@/types';
import { FiEdit3, FiArrowRight, FiDollarSign, FiHash } from 'react-icons/fi';

interface CurrenciesShowProps {
  currency: Currency;
}

export default function CurrenciesShow({ currency }: CurrenciesShowProps) {
  // Format currency rate for display
  const formatRate = (rate: string | number) => {
    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(numRate);
  };

  // Handle navigation to edit page
  const handleEdit = () => {
    router.visit(`/admin/currencies/${currency.id}/edit`);
  };

  // Handle navigation back to index
  const handleBack = () => {
    router.visit('/admin/currencies');
  };

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <SecondaryButton onClick={handleBack}>
        <FiArrowRight className="w-4 h-4 ml-2" />
        العودة للقائمة
      </SecondaryButton>
      <PrimaryButton onClick={handleEdit}>
        <FiEdit3 className="w-4 h-4 ml-2" />
        تعديل العملة
      </PrimaryButton>
    </div>
  );

  return (
    <RootLayout
      title={`تفاصيل العملة: ${currency.name}`}
      breadcrumbs={[
        { label: 'لوحة التحكم', href: '/admin' },
        { label: 'إدارة العملات', href: '/admin/currencies' },
        { label: currency.name },
      ]}
      headerActions={headerActions}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Currency Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {currency.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  تفاصيل العملة ومعلومات سعر الصرف
                </p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    currency.is_crypto
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {currency.is_crypto ? 'عملة رقمية' : 'عملة تقليدية'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Code */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiHash className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    رمز العملة
                  </h3>
                  <p className="text-lg font-mono font-semibold text-gray-700 mt-1">
                    {currency.code}
                  </p>
                </div>
              </div>

              {/* Exchange Rate */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    سعر الصرف مقابل الدولار
                  </h3>
                  <p className="text-lg font-mono font-semibold text-gray-700 mt-1">
                    {formatRate(currency.rate_to_usd)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    1 USD = {formatRate(currency.rate_to_usd)} {currency.code}
                  </p>
                </div>
              </div>

              {/* Currency Type */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currency.is_crypto ? 'bg-purple-100' : 'bg-gray-100'
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        currency.is_crypto ? 'text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      {currency.is_crypto ? '₿' : '$'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    نوع العملة
                  </h3>
                  <p className="text-lg font-semibold text-gray-700 mt-1">
                    {currency.is_crypto ? 'عملة رقمية' : 'عملة تقليدية'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate Calculator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              حاسبة سعر الصرف
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              تحويل بين {currency.name} والدولار الأمريكي
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* USD to Currency */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  من الدولار الأمريكي إلى {currency.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">1 USD</span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(currency.rate_to_usd)} {currency.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">10 USD</span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(
                        parseFloat(currency.rate_to_usd.toString()) * 10,
                      )}{' '}
                      {currency.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">100 USD</span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(
                        parseFloat(currency.rate_to_usd.toString()) * 100,
                      )}{' '}
                      {currency.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Currency to USD */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  من {currency.name} إلى الدولار الأمريكي
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      1 {currency.code}
                    </span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(
                        1 / parseFloat(currency.rate_to_usd.toString()),
                      )}{' '}
                      USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      10 {currency.code}
                    </span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(
                        10 / parseFloat(currency.rate_to_usd.toString()),
                      )}{' '}
                      USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      100 {currency.code}
                    </span>
                    <span className="text-sm font-mono font-medium">
                      {formatRate(
                        100 / parseFloat(currency.rate_to_usd.toString()),
                      )}{' '}
                      USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-3 space-x-reverse">
          <SecondaryButton onClick={handleBack}>العودة للقائمة</SecondaryButton>
          <PrimaryButton onClick={handleEdit}>
            <FiEdit3 className="w-4 h-4 ml-2" />
            تعديل العملة
          </PrimaryButton>
        </div>
      </div>
    </RootLayout>
  );
}
