import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import {
  CurrenciesResponse,
  Currency,
} from '@/types';
import { usePage, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { useStatusPolling } from '@/Hooks/useStatusPolling';

// Import dashboard components

import CurrencyCardsSlider from '@/Components/Dashboard/CurrencyCardsSlider';
import RecentTransactionsTable from '@/Components/Dashboard/RecentTransactionsTable';
import DangerButton from '@/Components/DangerButton';
import CloseSessionModal from '@/Components/CloseSessionModal';
import CurrencyEditModal from '@/Components/Dashboard/CurrencyEditModal';
import SecondaryButton from '@/Components/SecondaryButton';
import PendingTransactionsConfirmModal from '@/Components/PendingTransactionsConfirmModal';
import AddCashboxModal from '@/Components/AddCashboxModal';
import DialogModal from '@/Components/DialogModal';
import {
  FiUsers,
  FiEye,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import { Chip } from '@heroui/react';
import CashierBoxModal from '@/Components/Casher/CashierBoxModal';
import UnifiedFormComponent from '@/Components/Dashboard/UnifiedFormComponent';

interface DashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
  user_roles: string[];
  companies: Company[];
}

interface ActiveCashier {
  id: number;
  casher: {
    id: number;
    name: string;
    email: string;
  };
  opened_at: string;
  closed_at?: string;
  status: string;
}

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard({
  currencies,
  user_roles,
  companies,
}: DashboardProps) {
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

  // Add form type toggle state
  const [formType, setFormType] = useState<'transaction' | 'transfer'>(
    'transaction',
  );

  // Quick View state
  const [showQuickView, setShowQuickView] = useState(false);
  const [activeCashiers, setActiveCashiers] = useState<ActiveCashier[]>([]);

  // Add state for cashier box modal
  const [isCashierBoxModalOpen, setIsCashierBoxModalOpen] = useState(false);
  const [selectedCashierSession, setSelectedCashierSession] =
    useState<any>(null);
  const [cashierBoxModalStage, setCashierBoxModalStage] = useState<
    'view' | 'pending' | 'closing'
  >('view');
  const [isCashierBoxSubmitting, setIsCashierBoxSubmitting] = useState(false);

  // Use unified status polling hook
  const {
    currentSession: currentCashSession,
    currencies: currenciesState,
    transactions,
    availableCashers,
    isLoading: isInitialSessionLoading,
    isPolling,
    lastUpdated,
    error,
    refetch,
  } = useStatusPolling(3000, true);

  // Get cashier sessions from current cash session
  const getCashierSessions = useCallback(() => {
    if (!currentCashSession?.casher_cash_sessions) return [];

    return currentCashSession.casher_cash_sessions.map((session: any) => ({
      id: session.id,
      casher: {
        id: session.casher.id,
        name: session.casher.name,
        email: session.casher.email,
      },
      opened_at: session.opened_at,
      closed_at: session.closed_at,
      status: session.status,
    }));
  }, [currentCashSession]);

  // Handle quick view open
  const handleQuickViewOpen = () => {
    if (!currentCashSession?.id) {
      toast.error('لا توجد جلسة نقدية نشطة');
      return;
    }

    setShowQuickView(true);
    setActiveCashiers(getCashierSessions());
  };

  // Update active cashiers when current session changes and modal is open
  useEffect(() => {
    if (showQuickView && currentCashSession) {
      setActiveCashiers(getCashierSessions());
    }
  }, [currentCashSession, showQuickView, getCashierSessions]);

  // Handle quick view close
  const handleQuickViewClose = () => {
    setShowQuickView(false);
    setActiveCashiers([]);
  };
  // Handle view cashier session details
  const handleViewCashierSession = (cashierSessionId: number) => {
    // Navigate to cash session show page with the specific cashier session
    if (!currentCashSession?.id) {
      toast.error('لا توجد جلسة نقدية نشطة');
      return;
    }

    router.visit(
      route('cash_sessions.show', { cash_session: currentCashSession.id }),
    );
    setShowQuickView(false);
  };

  // Handle cash counting for cashier
  const handleCashCounting = (cashierSessionId: number) => {
    // Navigate to cash session show page and trigger cash counting
    if (!currentCashSession?.id) {
      toast.error('لا توجد جلسة نقدية نشطة');
      return;
    }

    router.visit(
      route('cash_sessions.show', { cash_session: currentCashSession.id }),
    );
    setShowQuickView(false);
  };

  // Get status chip
  const getStatusChip = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: 'success' | 'warning' | 'default' }
    > = {
      active: { label: 'نشطة', color: 'success' as const },
      pending: { label: 'معلقة', color: 'warning' as const },
      closed: { label: 'مغلقة', color: 'default' as const },
    };
    const config = configs[status] || {
      label: status,
      color: 'default' as const,
    };
    return (
      <Chip color={config.color} size="sm">
        {config.label}
      </Chip>
    );
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('ar-EG'),
        time: date.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
    } catch (error) {
      return { date: 'غير متاح', time: 'غير متاح' };
    }
  };

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
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
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

  // Fetch balances API for cashier box modal - MEMOIZED to prevent unnecessary re-renders
  const fetchCashierBoxBalances = useCallback(
    async (casherCashSessionId: number) => {
      const response = await axios.get(
        `/admin/get-closing-balances/${casherCashSessionId}`,
      );
      return response.data.data.balances.system_closing_balances || [];
    },
    [],
  );

  // Handle open cashier box modal
  const handleOpenCashierBoxModal = (casherSession: any) => {
    setSelectedCashierSession(casherSession);

    // Set the appropriate modal stage based on cashier session status
    let modalStage: 'view' | 'pending' | 'closing';

    switch (casherSession.status) {
      case 'active':
        modalStage = 'pending'; // Show pending confirmation for active sessions
        break;
      case 'pending':
        modalStage = 'closing'; // Show closing form for pending sessions
        break;
      case 'closed':
        modalStage = 'view'; // Show final balances for closed sessions
        break;
      default:
        modalStage = 'view'; // Default to view stage
        break;
    }

    setCashierBoxModalStage(modalStage);
    setIsCashierBoxModalOpen(true);
  };

  // Handle close cashier box modal
  const handleCloseCashierBoxModal = () => {
    setIsCashierBoxModalOpen(false);
    setSelectedCashierSession(null);
    setCashierBoxModalStage('view');
    setIsCashierBoxSubmitting(false);
  };

  // Handle pending confirmation (step 1 to 2)
  const handleConfirmPending = async () => {
    if (!selectedCashierSession) return;
    setIsCashierBoxSubmitting(true);
    try {
      const response = await axios.post(
        `/admin/casher-cash-session/${selectedCashierSession.id}/pending`,
      );
      if (response.data.status || response.data.success) {
        // Update the local session status to pending
        setSelectedCashierSession((prev: any) =>
          prev
            ? {
              ...prev,
              status: 'pending',
            }
            : null,
        );

        // Move to closing stage
        setCashierBoxModalStage('closing');
        toast.success('تم تحويل صندوق الصراف إلى وضع الإغلاق');
      }
    } catch (error) {
      console.error('Error setting cashier session to pending:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء تحضير صندوق الصراف للإغلاق');
      }
    } finally {
      setIsCashierBoxSubmitting(false);
    }
  };

  // Handle submit close for cashier box
  const handleSubmitCashierBoxClose = async (
    actualClosingBalances: { currency_id: number; amount: number }[],
  ) => {
    if (!selectedCashierSession) return;
    setIsCashierBoxSubmitting(true);
    try {
      await axios.post(
        `/admin/casher-close-cash-session/${selectedCashierSession.id}/close`,
        {
          actual_closing_balances: actualClosingBalances,
        },
      );
      toast.success('تم إغلاق صندوق الصراف بنجاح');
      setIsCashierBoxModalOpen(false);
      setSelectedCashierSession(null);
      setCashierBoxModalStage('view');
      setIsCashierBoxSubmitting(false);
      refetch();
    } catch (error) {
      toast.error('حدث خطأ أثناء إغلاق صندوق الصراف');
      setIsCashierBoxSubmitting(false);
    }
  };

  const isSessionOpen = !!(
    currentCashSession && currentCashSession.status === 'active'
  );
  const isSessionPending = !!(
    currentCashSession && currentCashSession.status === 'pending'
  );
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

      {/* Quick View Button - Show when session is active */}
      {isSessionOpen && !isSessionLoading && (
        <SecondaryButton className="text-sm" onClick={handleQuickViewOpen}>
          <FiUsers className="w-4 h-4 ml-1" />
          عرض الصرافين النشطين
        </SecondaryButton>
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

  // Add this handler in the Dashboard component
  const handleChangeCashierStatus = async (userId: number) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/change-status`);
      const message = response.data?.message || 'تم تغيير حالة الصراف بنجاح';
      toast.success(message);
      refetch();
    } catch (error) {
      let message = 'حدث خطأ أثناء تغيير حالة الصراف';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    }
  };

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
        {/* Unified Form Component - Admin Only */}
        {isAdmin && (
          <UnifiedFormComponent
            formType={formType}
            setFormType={setFormType}
            currencies={currenciesState}
            companies={companies}
            isSessionOpen={!!isSessionOpen}
            isSessionPending={!!isSessionPending}
            onStartSession={handleOpenSession}
            availableCashers={availableCashers}
          />
        )}
      </div>

      <RecentTransactionsTable
        transactions={transactions as any}
        isSessionActive={!!isSessionOpen}
        isSessionPending={!!isSessionPending}
        isLoading={isInitialSessionLoading}
        isPolling={isPolling}
        lastUpdated={lastUpdated}
        onRefetch={refetch}
        currencies={currenciesState}
        availableCashers={availableCashers}
      />

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentTransactionsList />
        <QuickActions />
      </div> */}

      {/* Quick View Modal */}
      <DialogModal
        isOpen={showQuickView}
        onClose={handleQuickViewClose}
        maxWidth="2xl"
      >
        <DialogModal.Content title="صناديق الصرافين">
          <div className="space-y-4" dir="rtl">
            {activeCashiers.length > 0 ? (
              <div className="space-y-3">
                {activeCashiers.map(cashier => {
                  const isPresent = availableCashers.some(
                    u => u.id === cashier.casher.id,
                  );
                  const isActiveSession = cashier.status === 'active';

                  return (
                    <div
                      key={cashier.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          {getStatusChip(cashier.status)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {cashier.casher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cashier.casher.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Session Status */}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${cashier.status === 'active' ? 'bg-green-100 text-green-700' : cashier.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {getStatusChip(cashier.status)?.props.children}
                            </span>
                            {/* Presence Status */}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red'}`}
                            >
                              {isPresent ? 'متواجد' : 'غير متواجد'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1 space-x-reverse mt-1">
                            <FiClock className="w-3 h-3" />
                            <span>
                              بدأت في {formatDateTime(cashier.opened_at).date} -{' '}
                              {formatDateTime(cashier.opened_at).time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <SecondaryButton
                          onClick={() => {
                            handleOpenCashierBoxModal(cashier);
                            setShowQuickView(false);
                          }}
                          className="text-blue-600"
                        >
                          <FiEye className="w-4 h-4 ml-1" />
                          {cashier.status === 'active'
                            ? 'إغلاق الصندوق'
                            : 'عرض التفاصيل'}
                        </SecondaryButton>
                        {isActiveSession && (
                          <SecondaryButton
                            onClick={() =>
                              handleChangeCashierStatus(cashier.casher.id)
                            }
                            className="text-orange-600"
                          >
                            <FiRefreshCw className="w-4 h-4 ml-1" />
                            تغيير حالة التواجد
                          </SecondaryButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا يوجد صناديق صرافين في هذه الجلسة
              </div>
            )}
          </div>
        </DialogModal.Content>

        <DialogModal.Footer>
          <div className="flex justify-end">
            <SecondaryButton onClick={handleQuickViewClose}>
              إغلاق
            </SecondaryButton>
          </div>
        </DialogModal.Footer>
      </DialogModal>

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

      {/* Cashier Box Modal (shared) */}
      <CashierBoxModal
        isOpen={isCashierBoxModalOpen}
        onClose={handleCloseCashierBoxModal}
        cashierSession={selectedCashierSession}
        currencies={currenciesState}
        fetchBalancesApi={fetchCashierBoxBalances}
        stage={cashierBoxModalStage}
        onSubmitClose={handleSubmitCashierBoxClose}
        isSubmitting={isCashierBoxSubmitting}
        onConfirmPending={handleConfirmPending}
      />
    </RootLayout>
  );
}
