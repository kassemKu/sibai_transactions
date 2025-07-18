import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';

interface Company {
  id: number;
  name: string;
}

interface Transfer {
  id: number;
  amount: number;
  currency: string;
  type: string;
  created_at: string;
  company: Company;
}

interface TransfersIndexProps {
  transfers: Transfer[];
}

export default function TransfersIndex({ transfers }: TransfersIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = transfers.filter(transfer =>
    transfer.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.currency.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <RootLayout
      title="التحويلات"
      breadcrumbs={[{ label: 'التحويلات' }]}
      headerActions={
        <PrimaryButton className="text-sm">
          <FiPlus className="w-4 h-4 ml-2" />
          إضافة تحويل جديد
        </PrimaryButton>
      }
    >
      <Head title="التحويلات" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التحويلات</h1>
        <p className="text-gray-600">إدارة التحويلات المالية</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في التحويلات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transfers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransfers.map(transfer => (
          <div
            key={transfer.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {transfer.company.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {transfer.amount.toLocaleString()} {transfer.currency}
                </p>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {transfer.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                تم الإنشاء:{' '}
                {new Date(transfer.created_at).toLocaleDateString('ar-EG')}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <a
                  href={route('transfers.show', transfer.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="عرض التفاصيل"
                >
                  <FiEye className="w-4 h-4" />
                </a>
                <a
                  href={route('transfers.edit', transfer.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <FiEdit2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransfers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiPlus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد تحويلات
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'لا توجد نتائج للبحث المحدد' : 'ابدأ بإضافة تحويل جديد'}
          </p>
        </div>
      )}
    </RootLayout>
  );
} 