import React, { useMemo } from 'react';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  time: string;
}

export default function RecentTransactionsList() {
  const recentTransactions: Transaction[] = useMemo(
    () => [
      {
        id: 1,
        type: 'دائن',
        amount: '$1,200',
        currency: 'USD',
        status: 'مكتملة',
        time: 'منذ ساعتين',
      },
      {
        id: 2,
        type: 'مدين',
        amount: '$850',
        currency: 'EUR',
        status: 'معلقة',
        time: 'منذ 4 ساعات',
      },
      {
        id: 3,
        type: 'دائن',
        amount: '$2,100',
        currency: 'USD',
        status: 'مكتملة',
        time: 'منذ 6 ساعات',
      },
      {
        id: 4,
        type: 'مدين',
        amount: '$450',
        currency: 'GBP',
        status: 'فاشلة',
        time: 'منذ 8 ساعات',
      },
    ],
    [],
  );

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          المعاملات الأخيرة
        </h3>
        <p className="mt-1 text-sm text-gray-500">نشاط معاملاتك الأحدث</p>
      </div>
      <div className="px-6 py-4">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {recentTransactions.map(transaction => (
              <li key={transaction.id} className="py-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex-shrink-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                        transaction.type === 'دائن'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {transaction.type === 'دائن' ? '+' : '-'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.type} - {transaction.amount}{' '}
                      {transaction.currency}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {transaction.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'مكتملة'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'معلقة'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="#"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            عرض جميع المعاملات
          </a>
        </div>
      </div>
    </div>
  );
}
