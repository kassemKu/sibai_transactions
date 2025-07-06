import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { CurrenciesResponse, CashSession, InertiaSharedProps } from '@/types';
import { usePage, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { useStatusPolling } from '@/Hooks/useStatusPolling';

// Import dashboard components
import WelcomeSection from '@/Components/Dashboard/WelcomeSection';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import TransactionForm from '@/Components/Dashboard/TransactionForm';
import RecentTransactionsTable from '@/Components/Dashboard/RecentTransactionsTable';
import RecentTransactionsList from '@/Components/Dashboard/RecentTransactionsList';
import QuickActions from '@/Components/Dashboard/QuickActions';
import DangerButton from '@/Components/DangerButton';
import CloseSessionModal from '@/Components/CloseSessionModal';
import SecondaryButton from '@/Components/SecondaryButton';

interface DashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
  user_roles: string[];
}

export default function Dashboard({ currencies, user_roles }: DashboardProps) {
  const { auth, cash_session, roles } = usePage().props;
  const route = useRoute();
  const isAdmin =
    roles &&
    Array.isArray(roles) &&
    (roles as string[]).includes('super_admin');
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

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

      if (response.data.success) {
        // Refetch status to update local state
        await refetch();
        toast.success('تم فتح الجلسة النقدية بنجاح');
      }
    } catch (error) {
      console.error('Error opening cash session:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء فتح الجلسة');
      }
    } finally {
      setIsSessionLoading(false);
    }
  };

  // Handle opening close session modal
  const handleCloseSession = () => {
    setShowCloseModal(true);
  };

  // Handle successful session close
  const handleSessionCloseSuccess = () => {
    // Close modal first
    setShowCloseModal(false);

    // Refetch status to update local state
    refetch();
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCloseModal(false);
  };

  // Handle session becoming pending
  const handleSessionPending = () => {
    // Refetch status to update local state
    refetch();

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
        <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
      )}

      {/* Session Management Buttons - ADMIN ONLY */}
      {isAdmin && (
        <>
          {isInitialSessionLoading ? (
            <div className="text-sm text-gray-500 px-4 py-2">
              جاري التحقق...
            </div>
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
              {isSessionLoading ? 'جاري الفتح...' : 'بدء جلسة جديدة'}
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
    >
      <WelcomeSection />
      <CurrencyCardsSlider currencies={currenciesState} />

      {/* Always show TransactionForm with overlay when session is not active */}
      <TransactionForm
        currencies={currenciesState}
        isSessionOpen={!!isSessionOpen}
        isSessionPending={!!isSessionPending}
        onStartSession={isAdmin ? handleOpenSession : undefined}
      />

      <RecentTransactionsTable
        transactions={transactions}
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

      {/* Close Session Modal */}
      <CloseSessionModal
        isOpen={showCloseModal}
        onClose={handleModalClose}
        onSuccess={handleSessionCloseSuccess}
        isSessionPending={!!isSessionPending}
        onSessionPending={handleSessionPending}
      />
    </RootLayout>
  );
}
