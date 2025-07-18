import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FiEdit2, FiArrowLeft, FiCalendar, FiMail, FiShield } from 'react-icons/fi';

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

interface UsersShowProps {
  user: User;
}

export default function UsersShow({ user }: UsersShowProps) {
  return (
    <RootLayout
      title={user.name}
      breadcrumbs={[
        { label: 'المستخدمين', href: route('users.index') },
        { label: user.name },
      ]}
      headerActions={
        <div className="flex items-center space-x-3 space-x-reverse">
          <Link href={route('users.edit', user.id)}>
            <PrimaryButton className="text-sm">
              <FiEdit2 className="w-4 h-4 ml-2" />
              تعديل
            </PrimaryButton>
          </Link>
          <Link href={route('users.index')}>
            <SecondaryButton className="text-sm">
              <FiArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </SecondaryButton>
          </Link>
        </div>
      }
    >
      <Head title={user.name} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user.name}
        </h1>
        <p className="text-gray-600">تفاصيل المستخدم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              معلومات المستخدم
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    البريد الإلكتروني
                  </p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="flex items-start space-x-3 space-x-reverse">
                <FiShield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    الأدوار والصلاحيات
                  </p>
                  <div className="mt-2">
                    {user.roles.map(role => (
                      <span
                        key={role.id}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        {role.display_name}
                      </span>
                    ))}
                  </div>
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
                    {new Date(user.created_at).toLocaleDateString('ar-EG', {
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
                    {new Date(user.updated_at).toLocaleDateString('ar-EG', {
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
                href={route('users.edit', user.id)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="w-4 h-4 ml-2" />
                تعديل المستخدم
              </Link>
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إحصائيات
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">عدد الأدوار</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.roles.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
} 