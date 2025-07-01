import React, { useEffect } from 'react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { CurrenciesResponse } from '@/types';
import { usePage } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

// Import dashboard components
import WelcomeSection from '@/Components/Dashboard/WelcomeSection';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import TransactionForm from '@/Components/Dashboard/TransactionForm';
import RecentTransactionsTable from '@/Components/Dashboard/RecentTransactionsTable';
import RecentTransactionsList from '@/Components/Dashboard/RecentTransactionsList';
import QuickActions from '@/Components/Dashboard/QuickActions';

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

  useEffect(() => {
    console.log('Dashboard mounted with data:', {
      currencies,
      cashSessions,
      auth: auth,
      cash_session: cash_session,
    });
  }, []);

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
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
      <TransactionForm currencies={currencies} />
      <RecentTransactionsTable />

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactionsList />
        <QuickActions />
      </div> */}
    </RootLayout>
  );
}
