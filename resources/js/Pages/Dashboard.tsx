import React from 'react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Dashboard() {
  // Sample dashboard data - replace with real data from your backend
  const stats = [
    {
      name: 'Total Transactions',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Revenue',
      value: '$45,231',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Sessions',
      value: '12',
      change: '-2%',
      changeType: 'negative' as const,
    },
    {
      name: 'Pending Transactions',
      value: '23',
      change: '+4%',
      changeType: 'positive' as const,
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'Credit',
      amount: '$1,200',
      currency: 'USD',
      status: 'Completed',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'Debit',
      amount: '$850',
      currency: 'EUR',
      status: 'Pending',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'Credit',
      amount: '$2,100',
      currency: 'USD',
      status: 'Completed',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'Debit',
      amount: '$450',
      currency: 'GBP',
      status: 'Failed',
      time: '8 hours ago',
    },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <PrimaryButton className="text-sm">New Transaction</PrimaryButton>
    </div>
  );

  return (
    <RootLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      headerActions={headerActions}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your transactions today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(stat => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                </div>
              </div>
              <div className="mt-1">
                <div className="text-sm font-medium text-gray-500">
                  {stat.name}
                </div>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your latest transaction activity
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentTransactions.map(transaction => (
                  <li key={transaction.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            transaction.type === 'Credit'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {transaction.type === 'Credit' ? '+' : '-'}
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
                            transaction.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'Pending'
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
                View all transactions
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Common tasks and shortcuts
            </p>
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
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Create Transaction
                  </p>
                  <p className="text-sm text-gray-500">
                    Add a new transaction record
                  </p>
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
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Generate Report
                  </p>
                  <p className="text-sm text-gray-500">
                    Create financial reports
                  </p>
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
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Manage Currencies
                  </p>
                  <p className="text-sm text-gray-500">Update exchange rates</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
