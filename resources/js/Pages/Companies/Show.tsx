import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FiEdit2, FiArrowLeft, FiCalendar } from 'react-icons/fi';

interface Transfer {
  id: number;
  amount: number;
  currency: string;
  type: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  transfers?: Transfer[];
}

interface CompaniesShowProps {
  company: Company;
}

export default function CompaniesShow({ company }: CompaniesShowProps) {
    console.log(company)
  return (
    <RootLayout
      title={company.name}
      breadcrumbs={[
        { label: 'الشركات', href: route('companies.index') },
        { label: company.name },
      ]}
      headerActions={
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link href={route('companies.edit', company.id)}>
            <PrimaryButton className="text-sm">
              <FiEdit2 className="w-4 h-4 ml-2" />
              تعديل
            </PrimaryButton>
          </Link>
          <Link href={route('companies.index')}>
            <SecondaryButton className="text-sm">
              <FiArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </SecondaryButton>
          </Link>
        </div>
      }
    >
      <Head title={company.name} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {company.name}
        </h1>
        <p className="text-gray-600">تفاصيل الشركة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              معلومات الشركة
            </h2>

            <div className="space-y-4">
              {/* Created At */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    تاريخ الإنشاء
                  </p>
                  <p className="text-gray-900">
                    {new Date(company.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Updated At */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">آخر تحديث</p>
                  <p className="text-gray-900">
                    {new Date(company.updated_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إجراءات سريعة
            </h3>
            <div className="space-y-3">
              <Link
                href={route('companies.edit', company.id)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="w-4 h-4 ml-2" />
                تعديل الشركة
              </Link>
            </div>
          </div>

          {/* Company Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إحصائيات
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">عدد التحويلات</span>
                <span className="text-sm font-medium text-gray-900">
                  {company.transfers?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Section */}
      {company.transfers && company.transfers.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              التحويلات
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العملة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {company.transfers.map(transfer => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfer.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transfer.created_at).toLocaleDateString(
                          'ar-EG',
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </RootLayout>
  );
}
