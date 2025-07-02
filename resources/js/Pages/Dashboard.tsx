import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { CurrenciesResponse, CashSession } from '@/types';
import { usePage } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

// Import dashboard components
import WelcomeSection from '@/Components/Dashboard/WelcomeSection';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import TransactionForm from '@/Components/Dashboard/TransactionForm';
import RecentTransactionsTable from '@/Components/Dashboard/RecentTransactionsTable';
import RecentTransactionsList from '@/Components/Dashboard/RecentTransactionsList';
import QuickActions from '@/Components/Dashboard/QuickActions';
import DangerButton from '@/Components/DangerButton';

interface DashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
}

export default function Dashboard({
  currencies,
  cashSessions,
}: DashboardProps) {
  const { auth, cash_session } = usePage().props;
  const route = useRoute();

  const [currentCashSession, setCurrentCashSession] =
    useState<CashSession | null>(cash_session as CashSession | null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  // Handle opening a cash session
  const handleOpenSession = async () => {
    setIsSessionLoading(true);

    try {
      const response = await axios.post('/cash-sessions/open');

      if (response.data.success) {
        setCurrentCashSession(response.data.cash_session);
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

  // Handle closing a cash session
  const handleCloseSession = async () => {
    if (!currentCashSession) return;

    setIsSessionLoading(true);

    try {
      // For now, we'll send empty actual_closing_balances
      // In a real implementation, you'd want to show a modal to collect this data
      const response = await axios.post('/cash-sessions/close', {
        actual_closing_balances: currencies.map(currency => ({
          currency_id: currency.id,
          amount: 0, // This should be collected from user input
        })),
      });

      if (response.data.success) {
        setCurrentCashSession(null);
        toast.success('تم إغلاق الجلسة النقدية بنجاح');
      }
    } catch (error) {
      console.error('Error closing cash session:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء إغلاق الجلسة');
      }
    } finally {
      setIsSessionLoading(false);
    }
  };

  const isSessionOpen = currentCashSession && !currentCashSession.is_closed;

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      {/* New Transaction Button - only show if session is open */}
      {isSessionOpen && (
        <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
      )}

      {/* Session Management Button */}
      {isSessionOpen ? (
        <DangerButton
          className="text-sm"
          onClick={handleCloseSession}
          disabled={isSessionLoading}
        >
          {isSessionLoading ? 'جاري الإغلاق...' : 'إغلاق الجلسة'}
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
      <CurrencyCardsSlider currencies={currencies} />

      {/* Always show TransactionForm with overlay when session is closed */}
      <TransactionForm
        currencies={currencies}
        isSessionOpen={!!isSessionOpen}
        onStartSession={handleOpenSession}
      />

      <RecentTransactionsTable />

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactionsList />
        <QuickActions />
      </div> */}
    </RootLayout>
  );
}
