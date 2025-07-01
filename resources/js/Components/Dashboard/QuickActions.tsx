import React from 'react';

export default function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          الإجراءات السريعة
        </h3>
        <p className="mt-1 text-sm text-gray-500">المهام الشائعة والاختصارات</p>
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
              <p className="text-sm font-medium text-gray-900">إنشاء معاملة</p>
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
              <p className="text-sm font-medium text-gray-900">إنشاء تقرير</p>
              <p className="text-sm text-gray-500">إنشاء التقارير المالية</p>
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
              <p className="text-sm font-medium text-gray-900">إدارة العملات</p>
              <p className="text-sm text-gray-500">تحديث أسعار الصرف</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
