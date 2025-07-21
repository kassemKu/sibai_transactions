import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FiEdit2, FiArrowLeft, FiCalendar, FiDollarSign, FiHome } from 'react-icons/fi';

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
  updated_at: string;
  company: Company;
}

interface TransfersShowProps {
  transfer: Transfer;
}

export default function TransfersShow({ transfer }: TransfersShowProps) {
  return (
    <RootLayout
      title={`تحويل ${transfer.company.name}`}
      breadcrumbs={[
        { label: 'التحويلات', href: route('transfers.index') },
        { label: `تحويل ${transfer.company.name}` },
      ]}
      headerActions={
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link href={route('transfers.edit', transfer.id)}>
            <PrimaryButton className="text-sm">
              <FiEdit2 className="w-4 h-4 ml-2" />
              تعديل
            </PrimaryButton>
          </Link>
          <Link href={route('transfers.index')}>
            <SecondaryButton className="text-sm">
              <FiArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </SecondaryButton>
          </Link>
        </div>
      }
    >
      <Head title={`تحويل ${transfer.company.name}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تحويل {transfer.company.name}
        </h1>
        <p className="text-gray-600">تفاصيل التحويل المالي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              معلومات التحويل
            </h2>

            <div className="space-y-4">
              {/* Amount */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiDollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    المبلغ
                  </p>
                  <p className="text-gray-900">
                    {transfer.amount.toLocaleString()} {transfer.currency}
                  </p>
                </div>
              </div>

              {/* Currency */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiDollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    العملة
                  </p>
                  <p className="text-gray-900">{transfer.currency}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiDollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    نوع التحويل
                  </p>
                  <p className="text-gray-900">{transfer.type}</p>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiHome className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    الشركة
                  </p>
                  <p className="text-gray-900">{transfer.company.name}</p>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    تاريخ الإنشاء
                  </p>
                  <p className="text-gray-900">
                    {new Date(transfer.created_at).toLocaleDateString('ar-EG', {
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
                    {new Date(transfer.updated_at).toLocaleDateString('ar-EG', {
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
                href={route('transfers.edit', transfer.id)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="w-4 h-4 ml-2" />
                تعديل التحويل
              </Link>
            </div>
          </div>

          {/* Transfer Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إحصائيات
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المبلغ</span>
                <span className="text-sm font-medium text-gray-900">
                  {transfer.amount.toLocaleString()} {transfer.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
