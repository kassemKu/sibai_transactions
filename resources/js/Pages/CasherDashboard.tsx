import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { CurrenciesResponse, CashSession, InertiaSharedProps } from '@/types';
import RootLayout from '@/Layouts/RootLayout';
import { useStatusPolling } from '@/Hooks/useStatusPolling';
import { useNewTransactionNotification } from '@/Hooks/useNewTransactionNotification';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import NewTransactionNotification from '@/Components/Casher/NewTransactionNotification';
import CashierBalanceModal from '@/Components/Casher/CashierBalanceModal';

// Import casher-specific components
import TransactionForm from '@/Components/Casher/TransactionForm';
import PendingTransactionsTable from '@/Components/Casher/PendingTransactionsTable';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';

interface CasherDashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
}

interface Cashier {
  id: number;
  name: string;
  email: string;
  system_balances?: Array<{
    currency_id: number;
    amount: number;
    currency?: any;
  }>;
  has_active_session?: boolean;
}

const CasherDashboard = ({ currencies }: CasherDashboardProps) => {
  const { auth, cash_session, roles } = usePage<InertiaSharedProps>().props;

  // Use unified status polling hook
  const {
    currentSession: currentCashSession,
    currencies: currenciesState,
    transactions,
    cashiers,
    isLoading: isInitialSessionLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
  } = useStatusPolling(3000, true);

  // State for cashier balance modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

  const isSessionOpen = !!(
    currentCashSession && currentCashSession.status === 'active'
  );
  const isSessionPending = !!(
    currentCashSession && currentCashSession.status === 'pending'
  );

  // Check if current user has an active cashier session
  const currentUserCashier = cashiers?.find(
    (cashier: Cashier) => cashier.email === auth?.user?.email,
  );
  const hasActiveCashierSession = currentUserCashier?.has_active_session;

  // Check if user is admin (Admin Cashier)
  const isAdmin =
    roles && Array.isArray(roles) && (roles as string[]).includes('admin');

  // Both Admin and Regular Cashiers need active session to perform transactions
  // Admin users are treated the same as regular cashiers for session management
  const canPerformTransactions = isSessionOpen && hasActiveCashierSession;

  // Use notification hook for new pending transactions
  const { showVisualNotification, hideVisualNotification } =
    useNewTransactionNotification(transactions, {
      enabled: !!canPerformTransactions, // Only enable when session is active and user can perform transactions
      currentUserEmail: auth?.user?.email, // Pass current user email to filter self-created transactions
    });

  // Handle opening balance modal
  const handleOpenBalanceModal = () => {
    if (currentUserCashier) {
      setSelectedCashier(currentUserCashier);
      setShowBalanceModal(true);
    }
  };

  // Handle closing balance modal
  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
    setSelectedCashier(null);
  };

  // Create header actions for casher
  const headerActions: React.ReactNode = (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* Session Status Indicators */}
      {isSessionPending && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-600 font-medium">
            جلسة معلقة
          </span>
        </div>
      )}
      {isSessionOpen && !hasActiveCashierSession ? (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-orange-600 font-medium">
            لا توجد جلسة صراف نشطة
          </span>
        </div>
      ) : null}
      {isSessionOpen && hasActiveCashierSession ? (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">
            {isAdmin ? 'جلسة نشطة (مدير صراف)' : 'جلسة نشطة'}
          </span>
        </div>
      ) : null}
      {!isSessionOpen && !isSessionPending ? (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-600 font-medium">
            لا توجد جلسة نشطة
          </span>
        </div>
      ) : null}

      {/* Balance Button - Show if cashier has system balances */}
      {currentUserCashier?.system_balances &&
        currentUserCashier.system_balances.some(
          balance => balance.amount > 0,
        ) && (
          <SecondaryButton className="text-sm" onClick={handleOpenBalanceModal}>
            عرض رصيدي النظامي
          </SecondaryButton>
        )}

      {/* New Transaction Button - only show if session is open and user can perform transactions */}
      {canPerformTransactions && (
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isAdmin ? 'لوحة مدير الصراف' : 'لوحة الصراف'}
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? 'إدارة المعاملات وتأكيد العمليات - صلاحيات مدير الصراف'
            : 'إدارة المعاملات وتأكيد العمليات'}
        </p>
      </div>

      {/* Session Status Alert */}
      {isSessionOpen && !hasActiveCashierSession ? (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">
              لا توجد جلسة صراف نشطة
            </span>
          </div>
          <p className="text-sm text-yellow-700">
            الجلسة النقدية العامة نشطة، لكن لا توجد جلسة صراف نشطة لك. يرجى
            التواصل مع المشرف لفتح جلسة صراف جديدة.
          </p>
        </div>
      ) : null}

      {/* Session Closed Alert */}
      {!isSessionOpen && !isSessionPending ? (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">
              الجلسة النقدية مغلقة
            </span>
          </div>
          <p className="text-sm text-red-700">
            لا يمكن إجراء معاملات جديدة لأن الجلسة النقدية مغلقة. يرجى التواصل
            مع المشرف لفتح جلسة جديدة.
          </p>
        </div>
      ) : null}

      {/* Admin Cashier Info Alert */}
      {isAdmin && isSessionOpen && hasActiveCashierSession ? (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">
              مدير الصراف - صلاحيات متقدمة
            </span>
          </div>
          <p className="text-sm text-blue-700">
            يمكنك عرض وتأكيد جميع المعاملات المعلقة، بغض النظر عن تعيينها. كما
            يمكنك استقبال معاملات بأي عملة.
          </p>
        </div>
      ) : null}

      {/* Currency Cards Slider */}
      <CurrencyCardsSlider currencies={currenciesState} />

      {/* Transaction Form */}
      <div id="transaction-form">
        <TransactionForm
          currencies={currenciesState}
          isSessionOpen={!!canPerformTransactions}
          isSessionPending={!!isSessionPending}
        />
      </div>

      {/* Pending Transactions Table */}
      <PendingTransactionsTable
        transactions={transactions}
        isSessionActive={!!canPerformTransactions}
        isSessionPending={!!isSessionPending}
        isLoading={isInitialSessionLoading}
        isPolling={isPolling}
        lastUpdated={lastUpdated}
        onRefetch={refetch}
        isAdmin={!!isAdmin}
      />

      {/* New Transaction Notification */}
      <NewTransactionNotification
        transactions={transactions}
        isVisible={showVisualNotification}
        onClose={hideVisualNotification}
      />

      {/* Cashier Balance Modal */}
      <CashierBalanceModal
        isOpen={showBalanceModal}
        onClose={handleCloseBalanceModal}
        cashier={selectedCashier}
        currencies={currenciesState}
      />
    </RootLayout>
  );
};

export default CasherDashboard;
