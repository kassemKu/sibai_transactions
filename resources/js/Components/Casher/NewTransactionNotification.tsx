import React, { useEffect, useState } from 'react';
import { Transaction } from '@/types';

interface NewTransactionNotificationProps {
  transactions: Transaction[];
  isVisible: boolean;
  onClose: () => void;
}

export default function NewTransactionNotification({
  transactions,
  isVisible,
  onClose,
}: NewTransactionNotificationProps) {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      setNotificationCount(prev => prev + 1);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border-l-4 border-green-600">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">معاملة جديدة</h4>
            <p className="text-xs opacity-90">
              تم استلام معاملة معلقة جديدة من مستخدم آخر تحتاج إلى تأكيد
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            aria-label="إغلاق الإشعار"
            title="إغلاق الإشعار"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
