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
import { toast } from 'react-hot-toast';

// Import casher-specific components
import TransactionForm from '@/Components/Casher/TransactionForm';
import PendingTransactionsTable from '@/Components/Casher/PendingTransactionsTable';
import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import TransferForm from '@/Components/Dashboard/TransferForm';
import UnifiedFormComponent from '@/Components/Dashboard/UnifiedFormComponent';

interface CasherDashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
  companies: any[];
}

interface MySession {
  id: number;
  opened_at: string;
  closed_at: string | null;
  opened_by: number;
  closed_by: number | null;
  opening_balances: Array<{
    amount: number;
    currency_id: number;
  }>;
  system_balances: any;
  differences: any;
  actual_closing_balances: any;
  cash_session_id: number;
  casher_id: number;
  transfers: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const CasherDashboard = ({ currencies, companies }: CasherDashboardProps) => {
  const { auth, cash_session, roles } = usePage<InertiaSharedProps>().props;

  // Use unified status polling hook
  const {
    currentSession: currentCashSession,
    currencies: currenciesState,
    transactions,
    availableCashers,
    mySession,

    isLoading: isInitialSessionLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
    updateCurrentSession,
    updateMySession,
    updateTransactions,
  } = useStatusPolling(3000, true);

  // State for cashier balance modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Add form type toggle state for transfer/transaction
  const [formType, setFormType] = useState<'transaction' | 'transfer'>(
    'transaction',
  );

  // Add session key state to trigger assignment rules reset when session changes
  const [sessionKey, setSessionKey] = useState<string>('');

  // Local state for user availability status
  const [localIsActive, setLocalIsActive] = useState<number | undefined>(
    auth?.user?.is_active,
  );

  // Update session key when session status changes
  useEffect(() => {
    if (currentCashSession) {
      setSessionKey(
        `session-${currentCashSession.id}-${currentCashSession.status}-${Date.now()}`,
      );
    }
  }, [currentCashSession?.id, currentCashSession?.status]);

  const isSessionOpen = !!(
    currentCashSession && currentCashSession.status === 'active'
  );
  const isSessionPending = !!(
    currentCashSession && currentCashSession.status === 'pending'
  );

  // Use my_session from the new API structure
  const hasActiveCashierSession = mySession?.status === 'active';

  // Use local state for availability checking, fallback to auth.user.is_active
  const isPresent = localIsActive === 1 || auth?.user?.is_active === 1;

  // Determine if user can transfer (if you have a field for this in the new API, otherwise keep as false or implement as needed)
  const canTransfer = false; // TODO: Update if /status API provides this info

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

  // Handle opening balance modal using my_session data
  const handleOpenBalanceModal = () => {
    setShowBalanceModal(true);
  };

  // Handle closing balance modal
  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
  };

  const handleSelfChangeStatus = async () => {
    // Check if user has an active cashier session before making the request
    if (!hasActiveCashierSession) {
      toast.error(
        'لا توجد جلسة صراف نشطة. يرجى التأكد من وجود جلسة نشطة قبل تغيير حالة التواجد.',
      );
      return;
    }

    try {
      const response = await axios.put('/casher/change-status');

      // Check if the response indicates success
      if (response.data?.status === true) {
        const message = response.data?.message || 'تم تغيير حالة التواجد بنجاح';

        // Update local state with new is_active value from response
        if (response.data?.data?.user?.is_active !== undefined) {
          setLocalIsActive(response.data.data.user.is_active);
        }

        toast.success(message);
      } else {
        // Handle case where status is false but no error was thrown
        const errorMessage =
          response.data?.message || 'حدث خطأ أثناء تغيير حالة التواجد';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      let message = 'حدث خطأ أثناء تغيير حالة التواجد';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          message =
            'لا توجد جلسة نقدية نشطة. يرجى التأكد من وجود جلسة نشطة قبل تغيير حالة التواجد.';
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.status === 500) {
          message = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.';
        } else if (error.response?.status === 401) {
          message = 'غير مصرح لك بتنفيذ هذا الإجراء.';
        }
      }

      toast.error(message);
    }
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
          <span className="text-sm text-red font-medium">
            لا توجد جلسة نشطة
          </span>
        </div>
      ) : null}

      {/* Presence Status Badge */}
      {hasActiveCashierSession && (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red'}`}
        >
          {isPresent ? 'متواجد' : 'غير متواجد'}
        </span>
      )}
      {/* Change Presence Status Button */}
      {hasActiveCashierSession && (
        <SecondaryButton className="text-sm" onClick={handleSelfChangeStatus}>
          تغيير حالة التواجد
        </SecondaryButton>
      )}

      {/* Balance Button - Always show if cashier has a session */}
      {mySession && (
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

      {/* Transaction/Transfer Form Toggle */}
      <div id="transaction-form">
        {canTransfer ? (
          <UnifiedFormComponent
            formType={formType}
            setFormType={setFormType}
            currencies={currenciesState}
            companies={companies}
            isSessionOpen={!!canPerformTransactions}
            isSessionPending={!!isSessionPending}
            availableCashers={availableCashers}
            sessionKey={sessionKey}
          />
        ) : (
          <TransactionForm
            currencies={currenciesState}
            isSessionOpen={!!canPerformTransactions}
            isSessionPending={!!isSessionPending}
            availableCashers={availableCashers}
            isUnavailable={!isPresent}
            sessionKey={sessionKey}
          />
        )}
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
        currencies={currenciesState}
        availableCashers={availableCashers}
        isUnavailable={!isPresent}
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
        currencies={currenciesState}
      />
    </RootLayout>
  );
};

export default CasherDashboard;
