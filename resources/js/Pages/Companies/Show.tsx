import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
  FiEdit2,
  FiArrowLeft,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface Currency {
  id: number;
  name: string;
  code: string;
  rate_to_usd: string;
  sell_rate_to_usd: string;
  buy_rate_to_usd: string;
  created_at: string;
  updated_at: string;
}

interface Transfer {
  id: number;
  company_id: number;
  currency_id: number;
  amount: string;
  type: string;
  created_at: string;
  updated_at: string;
  company: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  currency: Currency;
}

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  transfers?: Transfer[];
}

interface PaginatedTransfers {
  current_page: number;
  data: Transfer[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface CompaniesShowProps {
  company: Company;
  transfers: PaginatedTransfers;
}

export default function CompaniesShow({
  company,
  transfers,
}: CompaniesShowProps) {
  console.log(company);
  console.log(transfers);
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
                  {transfers.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Section */}
      {transfers.data && transfers.data.length > 0 && (
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
                  {transfers.data.map(transfer => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parseFloat(transfer.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.currency.name} ({transfer.currency.code})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.type === 'in' ? 'وارد' : 'صادر'}
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

            {/* Pagination */}
            {transfers.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  عرض {transfers.from} إلى {transfers.to} من {transfers.total}{' '}
                  نتيجة
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {/* Previous Page */}
                  {transfers.prev_page_url && (
                    <button
                      onClick={() => {
                        const url = new URL(transfers.prev_page_url!);
                        router.get(url.pathname + url.search);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      title="الصفحة السابقة"
                    >
                      <FiChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </button>
                  )}

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {transfers.links.map((link, index) => {
                      if (link.url === null && !link.active) {
                        return (
                          <span
                            key={index}
                            className="px-3 py-2 text-sm text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (link.url) {
                              const url = new URL(link.url);
                              router.get(url.pathname + url.search);
                            }
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            link.active
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                          title={`الصفحة ${link.label.replace(/[^0-9]/g, '')}`}
                        />
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  {transfers.next_page_url && (
                    <button
                      onClick={() => {
                        const url = new URL(transfers.next_page_url!);
                        router.get(url.pathname + url.search);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      title="الصفحة التالية"
                    >
                      التالي
                      <FiChevronLeft className="w-4 h-4 mr-1" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </RootLayout>
  );
}
