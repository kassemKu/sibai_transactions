import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { CurrenciesResponse, CashSession } from '@/types';
import { usePage, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

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
}

export default function Dashboard({
  currencies,
  cashSessions,
}: DashboardProps) {
  const { auth, cash_session } = usePage().props;
  console.log(auth)
  const route = useRoute();

  const [currentCashSession, setCurrentCashSession] =
    useState<CashSession | null>(cash_session as CashSession | null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [currenciesState, setCurrenciesState] = useState<CurrenciesResponse>(currencies);

  // Sync with global cash_session state when it changes
  useEffect(() => {
    setCurrentCashSession(cash_session as CashSession | null);
  }, [cash_session]);

  // Poll /current-session every 1 second to keep currentCashSession up to date
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('/current-session');
        setCurrentCashSession(response.data.data.session);
      } catch (error) {
        // Optionally handle error, e.g., setCurrentCashSession(null)
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll /currencies every 1 second to keep currencies up to date
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get('/get-currencies');
        setCurrenciesState(response.data.data.currencies);

      } catch (error) {
        // Optionally handle error
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle opening a cash session
  const handleOpenSession = async () => {
    setIsSessionLoading(true);

    try {
      const response = await axios.post('/admin/cash-sessions/open');

      if (response.data.status || response.data.success) {
        // Update local state immediately
        setCurrentCashSession(
          response.data.data?.cash_session || response.data.cash_session,
        );
        toast.success('تم فتح الجلسة النقدية بنجاح');

        // Refresh the shared state to sync with server
        router.reload({ only: ['cash_session'] });
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

    // Update local state immediately
    setCurrentCashSession(null);

    // Refresh the shared state to sync with server after a short delay
    setTimeout(() => {
      router.reload({ only: ['cash_session'] });
    }, 100);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCloseModal(false);
  };

  // Handle session becoming pending
  const handleSessionPending = () => {
    // Update local state to reflect pending status
    if (currentCashSession) {
      setCurrentCashSession({
        ...currentCashSession,
        status: 'pending',
      });
    }

    // Optionally reload the page state to sync with server
    setTimeout(() => {
      router.reload({ only: ['cash_session'] });
    }, 100);
  };

  const isSessionOpen =
    currentCashSession && currentCashSession.status === 'active';
  const isSessionPending =
    currentCashSession && currentCashSession.status === 'pending';

  const headerActions = (
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

      {/* New Transaction Button - only show if session is open */}
      {isSessionOpen && (
        <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
      )}

      {/* Session Management Buttons */}
      {isSessionOpen ? (
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
    </div>
  );

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
        onStartSession={handleOpenSession}
      />

      <RecentTransactionsTable
        isSessionActive={!!isSessionOpen}
        isSessionPending={!!isSessionPending}
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
