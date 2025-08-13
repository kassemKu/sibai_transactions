import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import RootLayout from '@/Layouts/RootLayout';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Card,
  CardBody,
  Button,
  Pagination,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowLeft,
  FiDollarSign,
  FiLoader,
  FiEye,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import TransactionDetailModal from '@/Components/TransactionDetailModal';
import AddCashboxModal from '@/Components/AddCashboxModal';
import DialogModal from '@/Components/DialogModal';
import CashierBoxModal from '@/Components/Casher/CashierBoxModal';
import {
  Currency,
  CashSession,
  User,
  Transaction,
  SessionOpeningBalance,
  CashBalance,
  CurrenciesResponse,
  CasherCashSession,
} from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import NumberInput from '@/Components/NumberInput';

interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CashSessionShowProps {
  cashSession: CashSession;
  currencies?: CurrenciesResponse;
}

export default function CashSessionShow({
  cashSession,
  currencies,
}: CashSessionShowProps) {
  // console.log(cashSession);

  // State for add cashbox modal
  const [showAddCashboxModal, setShowAddCashboxModal] = useState(false);

  // State for transaction modal
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // State for transactions API
  const [transactions, setTransactions] =
    useState<PaginatedTransactions | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State for cashier boxes balances
  const [loadingBalances, setLoadingBalances] = useState<
    Record<number, boolean>
  >({});
  const [cashierBalances, setCashierBalances] = useState<Record<number, any>>(
    {},
  );

  // State for cashier details modal
  const [isCashierBoxModalOpen, setIsCashierBoxModalOpen] = useState(false);
  const [selectedCashierSession, setSelectedCashierSession] =
    useState<CasherCashSession | null>(null);
  const [cashierBoxModalStage, setCashierBoxModalStage] = useState<
    'view' | 'pending' | 'closing'
  >('view');
  const [isCashierBoxSubmitting, setIsCashierBoxSubmitting] = useState(false);

  // State to track updated casher sessions for UI updates
  const [updatedCasherSessions, setUpdatedCasherSessions] = useState<
    CasherCashSession[]
  >(cashSession.casher_cash_sessions || []);
  const [cashierClosingBalances, setCashierClosingBalances] = useState<any[]>(
    [],
  );
  const [cashierActualAmounts, setCashierActualAmounts] = useState<
    Record<number, string>
  >({});
  const [isCashierClosingLoading, setIsCashierClosingLoading] = useState(false);
  const [isCashierClosingSubmitting, setIsCashierClosingSubmitting] =
    useState(false);

  // Handle transaction row click
  const handleTransactionClick = (transactionId: number) => {
    router.get(route('transaction.show', { transaction: transactionId }));
  };
  // Fetch transactions from API
  const fetchTransactions = async (page: number = 1) => {
    setIsLoadingTransactions(true);
    try {
      const response = await axios.get(
        `/admin/cash-sessions/${cashSession.id}/transactions`,
        {
          params: { page },
        },
      );
      setTransactions(response.data.data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchTransactions(page);
  };

  // Handle add cashbox modal
  const handleAddCashboxModalClose = () => {
    setShowAddCashboxModal(false);
  };

  // Handle add cashbox success
  const handleAddCashboxSuccess = () => {
    // Refresh the page to show updated data
    router.visit(route('cash_sessions.show', cashSession.id));
  };

  // Fetch cashier box balances API - MEMOIZED to prevent unnecessary re-renders
  const fetchCashierBoxBalances = useCallback(
    async (casherCashSessionId: number) => {
      const response = await axios.get(
        `/admin/get-closing-balances/${casherCashSessionId}`,
      );
      return response.data.data.balances.system_closing_balances || [];
    },
    [],
  );

  // Fetch cashier balances
  const fetchCashierBalances = async (casherCashSessionId: number) => {
    setLoadingBalances(prev => ({ ...prev, [casherCashSessionId]: true }));
    try {
      const response = await axios.get(
        `/admin/get-closing-balances/${casherCashSessionId}`,
      );
      setCashierBalances(prev => ({
        ...prev,
        [casherCashSessionId]:
          response.data.data.balances.system_closing_balances,
      }));
      // console.log(response.data.data.balances.system_closing_balances);
    } catch (error) {
      console.error('Error fetching cashier balances:', error);
    } finally {
      setLoadingBalances(prev => ({ ...prev, [casherCashSessionId]: false }));
    }
  };

  // Handle view cashier details
  const handleViewCashierDetails = (casherCashSession: CasherCashSession) => {
    setSelectedCashierSession(casherCashSession);

    // Check session status and set appropriate modal stage
    if (casherCashSession.status === 'pending') {
      // Show closing stage for pending sessions
      setCashierBoxModalStage('closing');
      // Fetch closing balances immediately for pending sessions
      fetchCashierClosingBalances(casherCashSession.id);
    } else if (casherCashSession.status === 'active') {
      // Show pending stage for active sessions
      setCashierBoxModalStage('pending');
      // Fetch balances for display in pending confirmation
      fetchCashierClosingBalances(casherCashSession.id);
    } else if (casherCashSession.status === 'closed') {
      // Show view stage for closed sessions (read-only)
      setCashierBoxModalStage('view');
      // Fetch balances when modal opens for closed sessions
      if (!cashierBalances[casherCashSession.id]) {
        fetchCashierBalances(casherCashSession.id);
      }
    }

    setIsCashierBoxModalOpen(true);
  };

  // Handle modal close
  const handleCashierModalClose = () => {
    setIsCashierBoxModalOpen(false);
    setSelectedCashierSession(null);
    setCashierBoxModalStage('view');
    setCashierClosingBalances([]);
    setCashierActualAmounts({});
    setIsCashierClosingLoading(false);
    setIsCashierClosingSubmitting(false);

    // Only reset if the session was in pending state but not completed
    // This allows the UI to show the updated pending status
    if (selectedCashierSession?.status === 'pending') {
      // Keep the pending status visible in the UI
      // The user can see that the session is pending and can continue later
    }
  };

  // Handle confirm close (stage 1 to 2)
  const handleConfirmClose = async () => {
    if (!selectedCashierSession) return;

    setIsCashierClosingLoading(true);
    try {
      const response = await axios.post(
        `/admin/casher-cash-session/${selectedCashierSession.id}/pending`,
      );
      if (response.data.status || response.data.success) {
        // Update the local session status to pending
        setSelectedCashierSession(prev =>
          prev
            ? {
                ...prev,
                status: 'pending',
              }
            : null,
        );

        // Update the cash session's casher sessions to reflect the new status
        setUpdatedCasherSessions(prev =>
          prev.map(session =>
            session.id === selectedCashierSession.id
              ? { ...session, status: 'pending' }
              : session,
          ),
        );

        // Fetch closing balances for the next stage
        await fetchCashierClosingBalances(selectedCashierSession.id);
        setCashierBoxModalStage('closing');
        toast.success('تم تحويل صندوق الصراف إلى وضع الإغلاق');
      }
    } catch (error) {
      console.error('Error setting cashier session to pending:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء تحضير صندوق الصراف للإغلاق');
      }
    } finally {
      setIsCashierClosingLoading(false);
    }
  };

  // Handle cashier actual amount change
  const handleCashierActualAmountChange = (
    currencyId: number,
    value: string,
  ) => {
    setCashierActualAmounts(prev => ({
      ...prev,
      [currencyId]: value,
    }));
  };

  // Handle cashier submit (stage 3)
  const handleCashierSubmit = async () => {
    if (!selectedCashierSession || isCashierClosingSubmitting) return;

    setIsCashierClosingSubmitting(true);
    try {
      const actualClosingBalances = cashierClosingBalances.map(balance => ({
        currency_id: balance.currency_id,
        amount: parseFloat(cashierActualAmounts[balance.currency_id] || '0'),
      }));

      const response = await axios.post(
        `/admin/casher-close-cash-session/${selectedCashierSession.id}/close`,
        {
          actual_closing_balances: actualClosingBalances,
        },
      );

      if (response.data.status || response.data.success) {
        // Update the local session status to closed
        setSelectedCashierSession(prev =>
          prev
            ? {
                ...prev,
                status: 'closed',
              }
            : null,
        );

        // Update the casher sessions list to reflect the closed status
        setUpdatedCasherSessions(prev =>
          prev.map(session =>
            session.id === selectedCashierSession.id
              ? { ...session, status: 'closed' }
              : session,
          ),
        );

        toast.success('تم إغلاق صندوق الصراف بنجاح');

        // Clean up modal state
        setCashierClosingBalances([]);
        setCashierActualAmounts({});
        setIsCashierBoxModalOpen(false);
        setCashierBoxModalStage('view');
        setSelectedCashierSession(null);
      }
    } catch (error) {
      console.error('Error closing cashier session:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء إغلاق صندوق الصراف');
      }
    } finally {
      setIsCashierClosingSubmitting(false);
    }
  };

  // Handle submit close for cashier box modal (shared component)
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

      // Clear assignment rules from localStorage when cashier session is closed
      localStorage.setItem('transactionAssignmentRules', JSON.stringify([]));
      console.log(
        '[Cashier Session Close] Assignment rules cleared from localStorage',
      );
      toast.success('تم مسح قواعد التعيين التلقائي مع إغلاق صندوق الصراف');

      setIsCashierBoxModalOpen(false);
      setSelectedCashierSession(null);
      setCashierBoxModalStage('view');
      setIsCashierBoxSubmitting(false);

      // Update the casher sessions list to reflect the closed status
      setUpdatedCasherSessions(prev =>
        prev.map(session =>
          session.id === selectedCashierSession.id
            ? { ...session, status: 'closed' }
            : session,
        ),
      );
    } catch (error) {
      toast.error('حدث خطأ أثناء إغلاق صندوق الصراف');
      setIsCashierBoxSubmitting(false);
    }
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
        setSelectedCashierSession(prev =>
          prev
            ? {
                ...prev,
                status: 'pending',
              }
            : null,
        );

        // Update the casher sessions list to reflect the new status
        setUpdatedCasherSessions(prev =>
          prev.map(session =>
            session.id === selectedCashierSession.id
              ? { ...session, status: 'pending' }
              : session,
          ),
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

  // Fetch cashier closing balances
  const fetchCashierClosingBalances = async (casherCashSessionId: number) => {
    setIsCashierClosingLoading(true);
    try {
      const response = await axios.get(
        `/admin/get-closing-balances/${casherCashSessionId}`,
      );
      if (response.data.status || response.data.success) {
        const balancesData =
          response.data.data.balances.system_closing_balances || [];
        setCashierClosingBalances(balancesData);

        // Initialize actual amounts with system balances
        const initialAmounts: Record<number, string> = {};
        balancesData.forEach((balance: any) => {
          initialAmounts[balance.currency_id] =
            balance.system_balance.toString();
        });
        setCashierActualAmounts(initialAmounts);
      }
    } catch (error) {
      console.error('Error fetching cashier closing balances:', error);
    } finally {
      setIsCashierClosingLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions(1);
  }, [cashSession.id]);

  // Initialize updated casher sessions when component mounts
  useEffect(() => {
    setUpdatedCasherSessions(cashSession.casher_cash_sessions || []);
  }, [cashSession.casher_cash_sessions]);

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
      <Chip color={config.color} size="md">
        {config.label}
      </Chip>
    );
  };

  // Get transaction status chip
  const getTransactionStatusChip = (status: Transaction['status']) => {
    const configs = {
      pending: { label: 'معلقة', color: 'warning' as const },
      completed: { label: 'مكتملة', color: 'success' as const },
      canceled: { label: 'ملغية', color: 'danger' as const },
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

  // Format amount with currency
  const formatAmount = (
    amount: string,
    currency: Currency | null | undefined,
  ) => {
    try {
      if (!currency || !amount) {
        return '0.00';
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        return '0.00';
      }
      const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }).format(numAmount);
      return `${formattedAmount}`;
    } catch (error) {
      return '0.00';
    }
  };

  // Calculate session duration
  const calculateDuration = (openedAt: string, closedAt: string | null) => {
    const start = new Date(openedAt);
    const end = closedAt ? new Date(closedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  };

  const openedDateTime = formatDateTime(cashSession.opened_at);
  const closedDateTime = cashSession.closed_at
    ? formatDateTime(cashSession.closed_at)
    : null;
  const duration = calculateDuration(
    cashSession.opened_at,
    cashSession.closed_at,
  );

  return (
    <RootLayout
      title={`جلسة #${cashSession.id}`}
      breadcrumbs={[
        { label: 'الرئيسية', href: route('dashboard') },
        { label: 'الجلسات النقدية', href: route('cash_sessions.index') },
        { label: `جلسة #${cashSession.id}` },
      ]}
      headerActions={
        <div className="flex items-center space-x-3 space-x-reverse">
          <SecondaryButton
            onClick={() => router.get(route('cash_sessions.index'))}
            className="text-sm"
          >
            <FiArrowLeft className="w-4 h-4 ml-1" />
            العودة للقائمة
          </SecondaryButton>
          {cashSession.status === 'active' && currencies && (
            <PrimaryButton
              className="text-sm"
              onClick={() => setShowAddCashboxModal(true)}
            >
              إضافة صندوق للجلسة
            </PrimaryButton>
          )}
        </div>
      }
    >
      {/* Session Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <h1 className="text-3xl font-bold text-gray-900">
              جلسة #{cashSession.id}
            </h1>
            {getStatusChip(cashSession.status)}
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-1 space-x-reverse">
              <FiClock className="w-4 h-4" />
              <span>المدة: {duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Session Info */}
        <Card>
          <CardBody className="p-6 dir-rtl">
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <FiCalendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-right">
                معلومات الجلسة
              </h3>
            </div>
            <div className="space-y-2 text-sm text-right">
              <div>
                <span className="text-gray-500">تاريخ الفتح:</span>
                <div className="font-medium">
                  {openedDateTime.date} - {openedDateTime.time}
                </div>
              </div>
              {closedDateTime && (
                <div>
                  <span className="text-gray-500">تاريخ الإغلاق:</span>
                  <div className="font-medium">
                    {closedDateTime.date} - {closedDateTime.time}
                  </div>
                </div>
              )}
              <div>
                <span className="text-gray-500">مفتوحة بواسطة:</span>
                <div className="font-medium">
                  {cashSession.opened_by?.name || 'غير متاح'}
                </div>
              </div>
              {cashSession.closed_by && (
                <div>
                  <span className="text-gray-500">مغلقة بواسطة:</span>
                  <div className="font-medium">
                    {cashSession.closed_by.name}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* User Info */}
        <Card>
          <CardBody className="p-6 dir-rtl">
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <FiUser className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-right">
                مسؤول الجلسة
              </h3>
            </div>
            <div className="space-y-2 text-sm text-right">
              <div>
                <span className="text-gray-500">الاسم:</span>
                <div className="font-medium">
                  {cashSession.opened_by?.name || 'غير متاح'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">البريد الإلكتروني:</span>
                <div className="font-medium">
                  {cashSession.opened_by?.email || 'غير متاح'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">الحالة:</span>
                <div className="font-medium">
                  {getStatusChip(cashSession.status)}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistics */}
        <Card>
          <CardBody className="p-6 dir-rtl">
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <FiDollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 text-right">
                إحصائيات
              </h3>
            </div>
            <div className="space-y-2 text-sm text-right">
              <div>
                <span className="text-gray-500">عدد المعاملات:</span>
                <div className="font-medium">{transactions?.total || 0}</div>
              </div>
              <div>
                <span className="text-gray-500">المدة الإجمالية:</span>
                <div className="font-medium">{duration}</div>
              </div>
              {transactions && (
                <div>
                  <span className="text-gray-500">المعاملات المكتملة:</span>
                  <div className="font-medium">
                    {
                      transactions.data.filter(t => t.status === 'completed')
                        .length
                    }
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transactions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            المعاملات ({transactions?.total || 0})
          </h2>
        </div>

        {isLoadingTransactions ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-gray-600">جاري تحميل المعاملات...</span>
              </div>
            </CardBody>
          </Card>
        ) : transactions?.data && transactions.data.length > 0 ? (
          <>
            <Table aria-label="معاملات الجلسة" selectionMode="single">
              <TableHeader>
                <TableColumn>رقم المعاملة</TableColumn>
                <TableColumn>التاريخ والوقت</TableColumn>
                <TableColumn>منشئ العملية</TableColumn>
                <TableColumn>مُعين إلى</TableColumn>
                <TableColumn>من</TableColumn>
                <TableColumn>إلى</TableColumn>
                <TableColumn>المبلغ الأصلي</TableColumn>
                <TableColumn>المبلغ المحول</TableColumn>
                <TableColumn>الحالة</TableColumn>
                <TableColumn>أُغلقت بواسطة</TableColumn>
              </TableHeader>
              <TableBody>
                {transactions.data.map(transaction => {
                  const transactionDateTime = formatDateTime(
                    transaction.created_at,
                  );
                  return (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleTransactionClick(transaction.id)}
                    >
                      <TableCell>
                        <span className="font-mono text-sm text-blue-600">
                          #{transaction.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{transactionDateTime.date}</div>
                          <div className="text-gray-500">
                            {transactionDateTime.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {transaction.created_by?.name || 'غير متاح'}
                          </div>
                          <div className="text-gray-500">
                            {transaction.created_by?.email || 'غير متاح'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {transaction.assigned_to?.name || 'Admin'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {transaction.from_currency?.name || 'غير متاح'}
                          </div>
                          <div className="text-gray-500">
                            {transaction.from_currency?.code || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {transaction.to_currency?.name || 'غير متاح'}
                          </div>
                          <div className="text-gray-500">
                            {transaction.to_currency?.code || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(
                            transaction.original_amount.toString(),
                            transaction.from_currency,
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(
                            transaction.converted_amount.toString(),
                            transaction.to_currency,
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionStatusChip(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {transaction.closed_by?.name || 'غير متاح'}
                          </div>
                          {transaction.closed_by?.email && (
                            <div className="text-gray-500">
                              {transaction.closed_by.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {transactions && transactions.last_page > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={transactions.last_page}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                  className="gap-2"
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-gray-500 text-lg">
                لا توجد معاملات في هذه الجلسة
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Cashier Boxes */}
      {updatedCasherSessions && updatedCasherSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            صناديق الصرافين في هذه الجلسة
          </h2>
          <Table aria-label="صناديق الصرافين" selectionMode="single">
            <TableHeader>
              <TableColumn>الصراف</TableColumn>
              <TableColumn>البريد الإلكتروني</TableColumn>
              <TableColumn>الحالة</TableColumn>
              <TableColumn>عدد العملات</TableColumn>
              <TableColumn>تاريخ الفتح</TableColumn>
              <TableColumn>تاريخ الإغلاق</TableColumn>
              <TableColumn>المدة</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody>
              {updatedCasherSessions.map(casherSession => {
                const openedDateTime = formatDateTime(casherSession.opened_at);
                const closedDateTime = casherSession.closed_at
                  ? formatDateTime(casherSession.closed_at)
                  : null;
                const duration = calculateDuration(
                  casherSession.opened_at,
                  casherSession.closed_at,
                );

                return (
                  <TableRow key={casherSession.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiUser className="w-5 h-5 text-blue-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {casherSession.casher.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 text-right">
                        {casherSession.casher.email}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusChip(casherSession.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 text-center">
                        {casherSession?.opening_balances?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-right">
                        <div className="font-medium text-gray-900">
                          {openedDateTime.date}
                        </div>
                        <div className="text-gray-500">
                          {openedDateTime.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {closedDateTime ? (
                        <div className="text-sm text-right">
                          <div className="font-medium text-gray-900">
                            {closedDateTime.date}
                          </div>
                          <div className="text-gray-500">
                            {closedDateTime.time}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 text-right">
                          -
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 text-center">
                        {duration}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => handleViewCashierDetails(casherSession)}
                        className="text-blue-600"
                      >
                        <FiEye className="w-4 h-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cashier Box Modal (shared) */}
      <CashierBoxModal
        isOpen={isCashierBoxModalOpen}
        onClose={handleCashierModalClose}
        cashierSession={selectedCashierSession}
        currencies={currencies || []}
        fetchBalancesApi={fetchCashierBoxBalances}
        stage={cashierBoxModalStage}
        onSubmitClose={handleSubmitCashierBoxClose}
        isSubmitting={isCashierBoxSubmitting}
        onConfirmPending={handleConfirmPending}
      />

      {/* Closing Balances */}
      {cashSession.cash_balances &&
        cashSession.cash_balances.length > 0 &&
        cashSession.status === 'closed' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              الأرصدة الختامية
            </h2>
            <Table aria-label="الأرصدة الختامية">
              <TableHeader>
                <TableColumn>العملة</TableColumn>
                <TableColumn>الرمز</TableColumn>
                <TableColumn>الرصيد الافتتاحي</TableColumn>
                <TableColumn>إجمالي الداخل</TableColumn>
                <TableColumn>إجمالي الخارج</TableColumn>
                <TableColumn>الرصيد الختامي المحسوب</TableColumn>
                <TableColumn>الرصيد الختامي الفعلي</TableColumn>
                <TableColumn>الفرق</TableColumn>
              </TableHeader>
              <TableBody>
                {cashSession.cash_balances.map(balance => {
                  return (
                    <TableRow key={balance.id}>
                      <TableCell>
                        {balance.currency?.name || 'غير متاح'}
                      </TableCell>
                      <TableCell>{balance.currency?.code || 'N/A'}</TableCell>
                      <TableCell>
                        {formatAmount(
                          balance.opening_balance,
                          balance.currency,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatAmount(balance.total_in, balance.currency)}
                      </TableCell>
                      <TableCell>
                        {formatAmount(balance.total_out, balance.currency)}
                      </TableCell>
                      <TableCell>
                        {formatAmount(
                          balance.closing_balance,
                          balance.currency,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatAmount(
                          balance.actual_closing_balance,
                          balance.currency,
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-medium ${
                            parseFloat(balance.difference) === 0
                              ? 'text-green-600'
                              : 'text-red'
                          }`}
                        >
                          {formatAmount(balance.difference, balance.currency)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionId={selectedTransactionId}
      />

      {/* Add Cashbox Modal */}
      {currencies && (
        <AddCashboxModal
          isOpen={showAddCashboxModal}
          onClose={handleAddCashboxModalClose}
          onSuccess={handleAddCashboxSuccess}
          currencies={currencies}
        />
      )}
    </RootLayout>
  );
}
