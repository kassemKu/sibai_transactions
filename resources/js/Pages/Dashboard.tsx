import React from 'react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Card, CardContent, CardHeader } from '@/Components/UI/Card';
import { Currency, CurrenciesResponse } from '@/types';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

interface DashboardProps {
  currencies: CurrenciesResponse;
}

export default function Dashboard({ currencies }: DashboardProps) {
  // Sample dashboard data - replace with real data from your backend
  console.log(currencies);

  const stats = [
    {
      name: 'إجمالي المعاملات',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'إجمالي الإيرادات',
      value: '$45,231',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'الجلسات النشطة',
      value: '12',
      change: '-2%',
      changeType: 'negative' as const,
    },
    {
      name: 'المعاملات المعلقة',
      value: '23',
      change: '+4%',
      changeType: 'positive' as const,
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'دائن',
      amount: '$1,200',
      currency: 'USD',
      status: 'مكتملة',
      time: 'منذ ساعتين',
    },
    {
      id: 2,
      type: 'مدين',
      amount: '$850',
      currency: 'EUR',
      status: 'معلقة',
      time: 'منذ 4 ساعات',
    },
    {
      id: 3,
      type: 'دائن',
      amount: '$2,100',
      currency: 'USD',
      status: 'مكتملة',
      time: 'منذ 6 ساعات',
    },
    {
      id: 4,
      type: 'مدين',
      amount: '$450',
      currency: 'GBP',
      status: 'فاشلة',
      time: 'منذ 8 ساعات',
    },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
    </div>
  );

  return (
    <RootLayout
      title="لوحة التحكم"
      breadcrumbs={[{ label: 'لوحة التحكم' }]}
      headerActions={headerActions}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">أهلاً بك مرة أخرى!</h1>
        <p className="mt-1 text-sm text-gray-600">
          إليك ما يحدث مع معاملاتك اليوم.
        </p>
      </div>

      <div className="text-bold-x18 text-text-black mb-5">
        إليك أسعار العملات طبقاً للدولار الأمريكي
      </div>

      {/* Currencies Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 mb-8">
        {currencies &&
          currencies.map((currency: Currency) => (
            <Card
              key={currency.id}
              className="border border-gray-200"
              padding="xs"
            >
              <CardContent className="flex flex-col justify-between gap-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-bold-x16 text-text-black">
                      {currency.name}
                    </h3>
                    <span className="text-med-x14 text-text-grey-light">
                      {currency.code}
                    </span>
                    {/* Currency movement arrow - alternating for demo */}
                    {currency.id % 2 === 0 ? (
                      <FiArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <FiArrowDown className="w-4 h-4 text-red" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bold-x16 text-primaryBlue">
                    {parseFloat(
                      currency.currency_rate.rate_to_usd,
                    ).toLocaleString('ar-EG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  مقابل 1 دولار أمريكي
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              المعاملات الأخيرة
            </h3>
            <p className="mt-1 text-sm text-gray-500">نشاط معاملاتك الأحدث</p>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentTransactions.map(transaction => (
                  <li key={transaction.id} className="py-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            transaction.type === 'دائن'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {transaction.type === 'دائن' ? '+' : '-'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.type} - {transaction.amount}{' '}
                          {transaction.currency}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {transaction.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'مكتملة'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'معلقة'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                عرض جميع المعاملات
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              الإجراءات السريعة
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              المهام الشائعة والاختصارات
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إنشاء معاملة
                  </p>
                  <p className="text-sm text-gray-500">إضافة سجل معاملة جديد</p>
                </div>
              </button>

              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إنشاء تقرير
                  </p>
                  <p className="text-sm text-gray-500">
                    إنشاء التقارير المالية
                  </p>
                </div>
              </button>

              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0v9a1.5 1.5 0 001.5 1.5h9M7.5 15a1.5 1.5 0 01-1.5-1.5V9A1.5 1.5 0 017.5 7.5h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H9a1.5 1.5 0 01-1.5-1.5z"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إدارة العملات
                  </p>
                  <p className="text-sm text-gray-500">تحديث أسعار الصرف</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
