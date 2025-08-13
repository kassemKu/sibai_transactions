import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Currency } from '@/types';
import { FiPlus, FiEdit3, FiLoader, FiEye } from 'react-icons/fi';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface CurrenciesIndexProps {
  currencies: Currency[];
}

export default function CurrenciesIndex({
  currencies: initialCurrencies,
}: CurrenciesIndexProps) {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch currencies to refresh the list
  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/get-currencies');
      setCurrencies(response.data.data.currencies);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('فشل في تحديث قائمة العملات');
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency rate for display
  const formatRate = (rate: string | number) => {
    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(numRate);
  };

  // Handle navigation to create page
  const handleCreate = () => {
    router.visit('/admin/currencies/create');
  };

  // Handle navigation to edit page
  const handleEdit = (currency: Currency) => {
    router.visit(`/admin/currencies/${currency.id}/edit`);
  };

  // Handle navigation to show page
  const handleShow = (currency: Currency) => {
    router.visit(`/admin/currencies/${currency.id}`);
  };

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <PrimaryButton onClick={handleCreate} className="text-sm">
        <FiPlus className="w-4 h-4 ml-2" />
        إضافة عملة جديدة
      </PrimaryButton>
    </div>
  );

  return (
    <RootLayout
      title="إدارة العملات"
      breadcrumbs={[
        { label: 'لوحة التحكم', href: '/admin' },
        { label: 'إدارة العملات' },
      ]}
      headerActions={headerActions}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                قائمة العملات
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                إدارة أسعار الصرف وإعدادات العملات
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm text-gray-500">
                العدد الكلي: {currencies.length}
              </span>
              {isLoading && (
                <FiLoader className="w-4 h-4 animate-spin text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {/* Currencies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FiLoader className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">جاري تحميل العملات...</p>
              </div>
            </div>
          ) : currencies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiPlus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد عملات
              </h3>
              <p className="text-gray-500 mb-6">
                ابدأ بإضافة عملة جديدة لإدارة أسعار الصرف
              </p>
              <PrimaryButton onClick={handleCreate}>
                <FiPlus className="w-4 h-4 ml-2" />
                إضافة عملة جديدة
              </PrimaryButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table aria-label="جدول العملات" className="min-w-full">
                <TableHeader>
                  <TableColumn>اسم العملة</TableColumn>
                  <TableColumn>الرمز</TableColumn>
                  <TableColumn>السعر المرجعي (USD)</TableColumn>
                  <TableColumn>سعر الشراء (USD)</TableColumn>
                  <TableColumn>سعر البيع (USD)</TableColumn>
                  <TableColumn>النوع</TableColumn>
                  <TableColumn>الإجراءات</TableColumn>
                </TableHeader>
                <TableBody>
                  {currencies.map(currency => (
                    <TableRow key={currency.id}>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {currency.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 font-mono">
                          {currency.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-yellow-700 font-mono font-medium">
                          {formatRate(currency.rate_to_usd)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-green-700 font-mono font-medium">
                          {formatRate(currency.buy_rate_to_usd)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-red-700 font-mono font-medium">
                          {formatRate(currency.sell_rate_to_usd)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            currency.is_crypto
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {currency.is_crypto ? 'رقمية' : 'تقليدية'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <SecondaryButton
                            onClick={() => handleShow(currency)}
                            className="inline-flex items-center text-xs"
                          >
                            <FiEye className="w-3 h-3 ml-1" />
                            عرض
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => handleEdit(currency)}
                            className="inline-flex items-center text-xs"
                          >
                            <FiEdit3 className="w-3 h-3 ml-1" />
                            تعديل
                          </PrimaryButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {currencies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      $
                    </span>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">
                    العملات التقليدية
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currencies.filter(c => !c.is_crypto).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      ₿
                    </span>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">
                    العملات الرقمية
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currencies.filter(c => c.is_crypto).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      #
                    </span>
                  </div>
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-500">
                    إجمالي العملات
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {currencies.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
