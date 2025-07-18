import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';

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
  roles: Role[];
}

interface UsersIndexProps {
  users: User[];
}

export default function UsersIndex({ users }: UsersIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <RootLayout
      title="المستخدمين"
      breadcrumbs={[{ label: 'المستخدمين' }]}
      headerActions={
        <PrimaryButton className="text-sm">
          <FiPlus className="w-4 h-4 ml-2" />
          إضافة مستخدم جديد
        </PrimaryButton>
      }
    >
      <Head title="المستخدمين" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">المستخدمين</h1>
        <p className="text-gray-600">إدارة المستخدمين والصلاحيات</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في المستخدمين..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2">
                  {user.roles.map(role => (
                    <span
                      key={role.id}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1"
                    >
                      {role.display_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                تم الإنشاء:{' '}
                {new Date(user.created_at).toLocaleDateString('ar-EG')}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <a
                  href={route('users.show', user.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="عرض التفاصيل"
                >
                  <FiEye className="w-4 h-4" />
                </a>
                <a
                  href={route('users.edit', user.id)}
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
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiPlus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد مستخدمين
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'لا توجد نتائج للبحث المحدد'
              : 'ابدأ بإضافة مستخدم جديد'}
          </p>
        </div>
      )}
    </RootLayout>
  );
}
