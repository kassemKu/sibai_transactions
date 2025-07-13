import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { CurrenciesResponse, CashSession, InertiaSharedProps } from '@/types';
import RootLayout from '@/Layouts/RootLayout';
import { useStatusPolling } from '@/Hooks/useStatusPolling';
import { useNewTransactionNotification } from '@/Hooks/useNewTransactionNotification';
import PrimaryButton from '@/Components/PrimaryButton';
import NewTransactionNotification from '@/Components/Casher/NewTransactionNotification';

// Import casher-specific components
import TransactionForm from '@/Components/Casher/TransactionForm';
import PendingTransactionsTable from '@/Components/Casher/PendingTransactionsTable';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';

interface CasherDashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
}

const CasherDashboard = ({ currencies }: CasherDashboardProps) => {
  const { auth, cash_session, roles } = usePage().props;

  // Use unified status polling hook
  const {
    currentSession: currentCashSession,
    currencies: currenciesState,
    transactions,
    isLoading: isInitialSessionLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
  } = useStatusPolling(3000, true);

  const isSessionOpen = !!(
    currentCashSession && currentCashSession.status === 'active'
  );
  const isSessionPending = !!(
    currentCashSession && currentCashSession.status === 'pending'
  );

  // Use notification hook for new pending transactions
  const { showVisualNotification, hideVisualNotification } =
    useNewTransactionNotification(transactions, {
      enabled: isSessionOpen, // Only enable when session is active
      currentUserEmail: auth?.user?.email, // Pass current user email to filter self-created transactions
    });

  // Create header actions for casher
  const headerActions: React.ReactNode = (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* Session Status Indicator */}
      {isSessionPending && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-600 font-medium">
            جلسة معلقة
          </span>
        </div>
      )}
      {isSessionOpen && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">جلسة نشطة</span>
        </div>
      )}
      {!isSessionOpen && !isSessionPending && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-600 font-medium">
            لا توجد جلسة نشطة
          </span>
        </div>
      )}

      {/* New Transaction Button - only show if session is open */}
      {isSessionOpen && (
        <PrimaryButton
          className="text-sm"
          onClick={() => {
            const transactionForm = document.getElementById('transaction-form');
            if (transactionForm) {
              transactionForm.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
              });
              // Optional: Focus on the first input field
              setTimeout(() => {
                const firstInput =
                  transactionForm.querySelector('input, select');
                if (firstInput && firstInput instanceof HTMLElement) {
                  firstInput.focus();
                }
              }, 500);
            }
          }}
        >
          معاملة جديدة
        </PrimaryButton>
      )}
    </div>
  );

  // Show loading state while fetching initial session
  if (isInitialSessionLoading) {
    return (
      <RootLayout
        title="لوحة الصراف"
        breadcrumbs={[{ label: 'لوحة الصراف' }]}
        headerActions={headerActions}
        welcomeMessage={`أهلاً بك مرة أخرى ${auth?.user?.name || ''}! إليك ما يحدث مع معاملاتك اليوم.`}
      >
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">جاري تحميل بيانات الجلسة...</span>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout
      title="لوحة الصراف"
      breadcrumbs={[{ label: 'لوحة الصراف' }]}
      headerActions={headerActions}
      welcomeMessage={`أهلاً بك مرة أخرى ${auth?.user?.name || ''}! إليك ما يحدث مع معاملاتك اليوم.`}
    >
      {/* Header Content Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة الصراف</h1>
        <p className="text-gray-600">إدارة المعاملات وتأكيد العمليات</p>
      </div>

      {/* Currency Cards Slider */}
      <CurrencyCardsSlider currencies={currenciesState} />

      {/* Transaction Form */}
      <div id="transaction-form">
        <TransactionForm
          currencies={currenciesState}
          isSessionOpen={!!isSessionOpen}
          isSessionPending={!!isSessionPending}
        />
      </div>

      {/* Pending Transactions Table */}
      <PendingTransactionsTable
        transactions={transactions}
        isSessionActive={!!isSessionOpen}
        isSessionPending={!!isSessionPending}
        isLoading={isInitialSessionLoading}
        isPolling={isPolling}
        lastUpdated={lastUpdated}
        onRefetch={refetch}
      />

      {/* New Transaction Notification */}
      <NewTransactionNotification
        transactions={transactions}
        isVisible={showVisualNotification}
        onClose={hideVisualNotification}
      />
    </RootLayout>
  );
};

export default CasherDashboard;
