import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import {
  CurrenciesResponse,
  CashSession,
  InertiaSharedProps,
  Currency,
} from '@/types';
import { usePage, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { useStatusPolling } from '@/Hooks/useStatusPolling';

// Import dashboard components

import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import TransactionForm from '@/Components/Dashboard/TransactionForm';
import RecentTransactionsTable from '@/Components/Dashboard/RecentTransactionsTable';
import RecentTransactionsList from '@/Components/Dashboard/RecentTransactionsList';
import QuickActions from '@/Components/Dashboard/QuickActions';
import DangerButton from '@/Components/DangerButton';
import CloseSessionModal from '@/Components/CloseSessionModal';
import CurrencyEditModal from '@/Components/Dashboard/CurrencyEditModal';
import SecondaryButton from '@/Components/SecondaryButton';
import PendingTransactionsConfirmModal from '@/Components/PendingTransactionsConfirmModal';
import AddCashboxModal from '@/Components/AddCashboxModal';

interface DashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
  user_roles: string[];
}

export default function Dashboard({ currencies, user_roles }: DashboardProps) {
  const { auth, cash_session, roles } = usePage().props as any;
  const route = useRoute();
  const isAdmin =
    roles &&
    Array.isArray(roles) &&
    (roles as string[]).includes('super_admin');
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPendingTransactionsModal, setShowPendingTransactionsModal] =
    useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null,
  );
  const [showAddCashboxModal, setShowAddCashboxModal] = useState(false);

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

  // Handle opening a cash session
  const handleOpenSession = async () => {
    setIsSessionLoading(true);
    try {
      const response = await axios.post('/admin/cash-sessions/open');
      if (response.status) {
        toast.success('تم فتح الجلسة النقدية بنجاح');
        await refetch();
        setIsSessionLoading(false);
      } else {
        setIsSessionLoading(false);
      }
    } catch (error) {
      console.error('Error opening cash session:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء فتح الجلسة');
      }
      setIsSessionLoading(false);
    }
  };

  // Handle opening close session modal with pending transactions check
  const handleCloseSession = () => {
    // Check if there are pending transactions
    const pendingTransactions = transactions.filter(
      transaction => transaction.status === 'pending',
    );

    if (pendingTransactions.length > 0) {
      // Show confirmation modal if there are pending transactions
      setShowPendingTransactionsModal(true);
    } else {
      // No pending transactions, proceed with normal close
      setShowCloseModal(true);
    }
  };

  // Handle continuing with session close despite pending transactions
  const handleContinueWithClose = () => {
    setShowPendingTransactionsModal(false);
    setShowCloseModal(true);
  };

  // Handle redirect to pending transactions
  const handleGoToPendingTransactions = () => {
    setShowPendingTransactionsModal(false);

    // Scroll to the pending transactions table
    setTimeout(() => {
      // Try to find the specific table first
      let pendingTransactionsTable = document.querySelector(
        '[aria-label="Recent pending transactions table"]',
      );

      // Fallback to any transactions table
      if (!pendingTransactionsTable) {
        pendingTransactionsTable = document.querySelector(
          '[aria-label*="transactions table"]',
        );
      }

      // Last fallback - find the table container
      if (!pendingTransactionsTable) {
        pendingTransactionsTable = document.querySelector('table');
      }

      if (pendingTransactionsTable) {
        pendingTransactionsTable.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });

        // Add a highlight effect
        pendingTransactionsTable.classList.add(
          'ring-2',
          'ring-yellow-400',
          'ring-opacity-75',
        );
        setTimeout(() => {
          pendingTransactionsTable.classList.remove(
            'ring-2',
            'ring-yellow-400',
            'ring-opacity-75',
          );
        }, 3000);
      }
    }, 100);
  };

  // Handle successful session close
  const handleSessionCloseSuccess = () => {
    // Close modal first
    setShowCloseModal(false);

    // Refetch status to update local state (with a slight delay to ensure modal is fully closed)
    setTimeout(() => {
      refetch();
    }, 300);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCloseModal(false);
  };

  // Handle pending transactions modal close
  const handlePendingTransactionsModalClose = () => {
    setShowPendingTransactionsModal(false);
  };

  // Handle currency edit
  const handleEditCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowEditModal(true);
  };

  // Handle currency edit modal close
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedCurrency(null);
  };

  // Handle currency edit success
  const handleEditSuccess = () => {
    // Refetch currencies to update the display
    refetch();
  };

  // Handle add cashbox modal
  const handleAddCashboxModalClose = () => {
    setShowAddCashboxModal(false);
  };

  // Handle add cashbox success
  const handleAddCashboxSuccess = () => {
    // Refetch status to update the display
    refetch();
  };

  // Handle session becoming pending
  const handleSessionPending = () => {
    // Refetch status to update local state (with a slight delay to avoid race conditions)
    setTimeout(() => {
      refetch();
    }, 500);

    // Optionally reload the page state to sync with server
    setTimeout(() => {
      router.reload({ only: ['cash_session'] });
    }, 100);
  };

  const isSessionOpen = !!(
    currentCashSession && currentCashSession.status === 'active'
  );
  const isSessionPending = !!(
    currentCashSession && currentCashSession.status === 'pending'
  );
  console.log(isSessionLoading);
  // Create a stable session state that doesn't change during loading
  const isSessionActiveOrLoading = isSessionOpen || isSessionLoading;

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

      {isSessionOpen && !isSessionLoading && (
        <>
          <PrimaryButton
            className="text-sm"
            onClick={() => {
              const transactionForm =
                document.getElementById('transaction-form');
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
          <PrimaryButton
            className="text-sm"
            onClick={() => setShowAddCashboxModal(true)}
          >
            إضافة صندوق للجلسة
          </PrimaryButton>
        </>
      )}

      {/* Session Management Buttons - ADMIN ONLY */}
      {isAdmin && (
        <>
          {isInitialSessionLoading ? (
            <div className="text-sm text-gray-500 px-4 py-2">
              جاري التحقق...
            </div>
          ) : isSessionLoading ? (
            <PrimaryButton className="text-sm" disabled>
              جاري الفتح...
            </PrimaryButton>
          ) : isSessionOpen ? (
            <DangerButton className="text-sm" onClick={handleCloseSession}>
              إغلاق الجلسة
            </DangerButton>
          ) : isSessionPending ? (
            <DangerButton className="text-sm" onClick={handleCloseSession}>
              إنهاء الإغلاق
            </DangerButton>
          ) : (
            <PrimaryButton
              className="text-sm"
              onClick={handleOpenSession}
              disabled={isSessionLoading}
            >
              بدء جلسة جديدة
            </PrimaryButton>
          )}
        </>
      )}
    </div>
  );

  // Show loading state while fetching initial session - only for the main content
  if (isInitialSessionLoading) {
    return (
      <RootLayout
        title="لوحة التحكم"
        breadcrumbs={[{ label: 'لوحة التحكم' }]}
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
      title="لوحة التحكم"
      breadcrumbs={[{ label: 'لوحة التحكم' }]}
      headerActions={headerActions}
      welcomeMessage={`أهلاً بك مرة أخرى ${auth?.user?.name || ''}! إليك ما يحدث مع معاملاتك اليوم.`}
    >
      <CurrencyCardsSlider
        currencies={currenciesState}
        onEditCurrency={isAdmin ? handleEditCurrency : undefined}
        isEditable={isAdmin}
      />

      {/* Always show TransactionForm with overlay when session is not active */}
      <div id="transaction-form">
        <TransactionForm
          currencies={currenciesState}
          isSessionOpen={!!isSessionOpen}
          isSessionPending={!!isSessionPending}
          onStartSession={isAdmin ? handleOpenSession : undefined}
        />
      </div>

      <RecentTransactionsTable
        transactions={transactions as any}
        isSessionActive={!!isSessionOpen}
        isSessionPending={!!isSessionPending}
        isLoading={isInitialSessionLoading}
        isPolling={isPolling}
        lastUpdated={lastUpdated}
        onRefetch={refetch}
      />

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactionsList />
        <QuickActions />
      </div> */}

      {/* Pending Transactions Confirmation Modal */}
      <PendingTransactionsConfirmModal
        isOpen={showPendingTransactionsModal}
        onClose={handlePendingTransactionsModalClose}
        onContinue={handleContinueWithClose}
        onGoToPending={handleGoToPendingTransactions}
        pendingCount={transactions.filter(t => t.status === 'pending').length}
      />

      {/* Close Session Modal */}
      <CloseSessionModal
        isOpen={showCloseModal}
        onClose={handleModalClose}
        onSuccess={handleSessionCloseSuccess}
        isSessionPending={!!isSessionPending}
        onSessionPending={handleSessionPending}
      />

      {/* Currency Edit Modal */}
      <CurrencyEditModal
        currency={selectedCurrency}
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
      />

      {/* Add Cashbox Modal */}
      <AddCashboxModal
        isOpen={showAddCashboxModal}
        onClose={handleAddCashboxModalClose}
        onSuccess={handleAddCashboxSuccess}
        currencies={currenciesState}
      />
    </RootLayout>
  );
}
