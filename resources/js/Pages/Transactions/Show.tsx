import React from 'react';
import { Transaction, Currency, User } from '@/types';
import RootLayout from '@/Layouts/RootLayout';
import {
  FiClock,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiRepeat,
} from 'react-icons/fi';
import { IoCalculatorSharp } from 'react-icons/io5';
import { formatDateTime, formatCurrency } from '@/utils';
import { route } from 'ziggy-js';

interface CashMovement {
  id: number;
  type: string;
  amount: string;
  exchange_rate: string;
  transaction_id: number;
  currency_id: number;
  by: number | null;
  cash_session_id: number;
  created_at: string;
  updated_at: string;
  currency?: Currency;
}

interface Props {
  transaction: Transaction & {
    fromCurrency: Currency;
    toCurrency: Currency;
    createdBy: User;
    closedBy: User | null;
    assignedTo: User | null;
    cashMovements: CashMovement[];
    calculated_converted_amount?: number;
  };
}

export default function Show({ transaction }: Props) {
  console.log(transaction);
  // Check if transaction has calculated_converted_amount field for manual adjustment detection
  const isManuallyAdjusted = transaction.calculated_converted_amount
    ? transaction.converted_amount !== transaction.calculated_converted_amount
    : false;
  return (
    <RootLayout
      title={`تفاصيل المعاملة #${transaction.id}`}
      breadcrumbs={[
        { label: 'لوحة التحكم', href: route('dashboard') },
        { label: `معاملة #${transaction.id}` },
      ]}
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
          {/* Header Section */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              تفاصيل المعاملة #{transaction.id}
            </h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiClock className="ml-2" />
              <span>
                تم الإنشاء في {formatDateTime(transaction.created_at)}
              </span>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  المبلغ الأصلي ({transaction?.from_currency?.name})
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(Number(transaction?.original_amount))}
                </div>
                <div className="text-sm text-gray-500">
                  {transaction?.from_currency?.code}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  المبلغ المحول ({transaction?.to_currency?.name})
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(transaction?.converted_amount)}
                </div>
                <div className="text-sm text-gray-500">
                  {transaction?.to_currency?.code}
                </div>
                {isManuallyAdjusted && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      تعديل يدوي
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">إجمالي الربح</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${formatCurrency(transaction?.total_profit_usd || 0)}
                </div>
                <div className="text-sm text-gray-500">دولار أمريكي</div>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                معلومات المعاملة
              </h2>
              <div className=" grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <FiUser className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block">
                      منشئ المعاملة
                    </span>
                    <p className="font-medium text-gray-800">
                      {transaction?.created_by?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.created_by?.email}
                    </p>
                  </div>
                </div>

                {transaction.assigned_to && (
                  <div className="flex items-start">
                    <FiUser className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 block">
                        معين إلى
                      </span>
                      <p className="font-medium text-gray-800">
                        {transaction.assigned_to?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.assigned_to?.email}
                      </p>
                    </div>
                  </div>
                )}

                {transaction?.closed_by && (
                  <div className="flex items-start">
                    <FiUser className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 block">
                        أُغلقت بواسطة
                      </span>
                      <p className="font-medium text-gray-800">
                        {transaction.closed_by.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.closed_by.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <FiCalendar className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block">الحالة</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status === 'completed'
                          ? 'مكتملة'
                          : transaction.status === 'pending'
                            ? 'معلقة'
                            : 'ملغية'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiClock className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block">التوقيت</span>
                    <p className="font-medium text-gray-800">
                      {formatDateTime(transaction.created_at)}
                    </p>
                    {transaction.updated_at !== transaction.created_at && (
                      <p className="text-sm text-gray-500">
                        آخر تحديث: {formatDateTime(transaction.updated_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Amount Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                تفاصيل التحويل
              </h2>
              <div className=" grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <FiDollarSign className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block">
                      من العملة
                    </span>
                    <p className="font-medium text-gray-800">
                      {transaction?.from_currency?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction?.from_currency?.code}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiRepeat className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 block">
                      إلى العملة
                    </span>
                    <p className="font-medium text-gray-800">
                      {transaction?.to_currency?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction?.to_currency?.code}
                    </p>
                  </div>
                </div>

                {transaction?.usd_intermediate && (
                  <div className="flex items-start">
                    <FiDollarSign className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 block">
                        القيمة الوسطية بالدولار
                      </span>
                      <p className="font-medium text-gray-800">
                        ${formatCurrency(Number(transaction.usd_intermediate))}
                      </p>
                    </div>
                  </div>
                )}

                {isManuallyAdjusted &&
                  transaction?.calculated_converted_amount && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <IoCalculatorSharp className="w-4 h-4 text-orange-600 ml-2" />
                        <span className="text-sm font-medium text-orange-800">
                          تعديل يدوي
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        المبلغ المحسوب تلقائياً:{' '}
                        {formatCurrency(
                          Number(transaction?.calculated_converted_amount),
                        )}{' '}
                        {transaction?.to_currency?.code}
                      </p>
                      <p className="text-sm text-orange-700">
                        المبلغ الفعلي:{' '}
                        {formatCurrency(Number(transaction?.converted_amount))}{' '}
                        {transaction?.to_currency?.code}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Profit Information */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">معلومات الربح</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-500">
                  الربح من {transaction?.from_currency?.name} (
                  {transaction?.from_currency?.code})
                </span>
                <p className="text-lg font-semibold">
                  $ {formatCurrency(transaction?.profit_from_usd || 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-500">
                  الربح من {transaction?.to_currency?.name} (
                  {transaction?.to_currency?.code})
                </span>
                <p className="text-lg font-semibold">
                  $ {formatCurrency(transaction.profit_to_usd || 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-500">إجمالي الربح</span>
                <p className="text-lg font-semibold">
                  $ {formatCurrency(transaction.total_profit_usd || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Snapshots */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">
              أسعار العملات وقت المعاملة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Currency Rates */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium mb-4 text-center bg-blue-50 p-2 rounded">
                  أسعار {transaction?.from_currency?.code} وقت المعاملة
                </h3>
                {transaction.from_currency_rates_snapshot ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        السعر الأساسي مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {parseFloat(
                          String(
                            transaction.from_currency_rates_snapshot
                              .rate_to_usd,
                          ),
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        سعر الشراء مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {parseFloat(
                          transaction.from_currency_rates_snapshot.buy_rate_to_usd.toString(),
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        سعر البيع مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        {parseFloat(
                          transaction.from_currency_rates_snapshot.sell_rate_to_usd.toString(),
                        ).toFixed(6)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    لا توجد بيانات أسعار متاحة
                  </div>
                )}
              </div>

              {/* To Currency Rates */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-md font-medium mb-4 text-center bg-orange-50 p-2 rounded">
                  أسعار {transaction?.to_currency?.code} وقت المعاملة
                </h3>
                {transaction.to_currency_rates_snapshot ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        السعر الأساسي مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {parseFloat(
                          transaction.to_currency_rates_snapshot.rate_to_usd.toString(),
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        سعر الشراء مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {parseFloat(
                          transaction.to_currency_rates_snapshot.buy_rate_to_usd.toString(),
                        ).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        سعر البيع مقابل الدولار:
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        {parseFloat(
                          transaction.to_currency_rates_snapshot.sell_rate_to_usd.toString(),
                        ).toFixed(6)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    لا توجد بيانات أسعار متاحة
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cash Movements */}
          {transaction.cashMovements &&
            transaction.cashMovements.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">حركات النقد</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العملة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transaction.cashMovements.map(movement => (
                        <tr key={movement.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.type === 'in'
                              ? 'دخل'
                              : movement.type === 'out'
                                ? 'خرج'
                                : movement.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(parseFloat(movement.amount))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.currency?.code || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(movement.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>
    </RootLayout>
  );
}
