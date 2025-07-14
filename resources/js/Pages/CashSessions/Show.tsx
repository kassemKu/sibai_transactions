import React, { useState, useEffect } from 'react';
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
  console.log(cashSession);

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
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [selectedCashierSession, setSelectedCashierSession] =
    useState<CasherCashSession | null>(null);

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
    window.location.reload();
  };

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
      console.log(response.data.data.balances.system_closing_balances);
    } catch (error) {
      console.error('Error fetching cashier balances:', error);
    } finally {
      setLoadingBalances(prev => ({ ...prev, [casherCashSessionId]: false }));
    }
  };

  // Handle view cashier details
  const handleViewCashierDetails = (casherCashSession: CasherCashSession) => {
    setSelectedCashierSession(casherCashSession);
    setIsCashierModalOpen(true);
    // Fetch balances when modal opens
    if (!cashierBalances[casherCashSession.id]) {
      fetchCashierBalances(casherCashSession.id);
    }
  };

  // Handle modal close
  const handleCashierModalClose = () => {
    setIsCashierModalOpen(false);
    setSelectedCashierSession(null);
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions(1);
  }, [cashSession.id]);

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
      {cashSession.casher_cash_sessions &&
        cashSession.casher_cash_sessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              صناديق الصرافين في هذه الجلسة
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cashSession.casher_cash_sessions.map(casherSession => (
                <Card key={casherSession.id} className="dir-rtl">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiUser className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-right">
                            {casherSession.casher.name}
                          </h3>
                          <p className="text-sm text-gray-500 text-right">
                            {casherSession.casher.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusChip(casherSession.status)}
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() =>
                            handleViewCashierDetails(casherSession)
                          }
                          className="text-blue-600"
                        >
                          <FiEye className="w-4 h-4 ml-1" />
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">عدد العملات:</span>
                        <span className="font-medium">
                          {casherSession?.opening_balances?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">تاريخ الفتح:</span>
                        <span className="font-medium">
                          {formatDateTime(casherSession.opened_at).date}
                        </span>
                      </div>
                      {casherSession.closed_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">تاريخ الإغلاق:</span>
                          <span className="font-medium">
                            {formatDateTime(casherSession.closed_at).date}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

      {/* Cashier Details Modal */}
      <DialogModal
        isOpen={isCashierModalOpen}
        onClose={handleCashierModalClose}
        maxWidth="6xl"
      >
        <DialogModal.Content
          title={`تفاصيل صندوق الصراف - ${selectedCashierSession?.casher.name}`}
        >
          {selectedCashierSession && (
            <div className="space-y-6" dir="rtl">
              <div className="text-sm text-gray-600 mb-4 text-right">
                عرض تفاصيل الأرصدة الافتتاحية والأرصدة النظامية للصراف
              </div>

              {/* Opening Balances Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-right text-lg">
                  الأرصدة الافتتاحية
                </h4>
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full divide-y divide-gray-200"
                    dir="rtl"
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العملة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الرصيد الافتتاحي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCashierSession?.opening_balances?.map(
                        (balance, index) => {
                          const currency = currencies?.find(
                            c => c.id === balance.currency_id,
                          );
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {currency?.name ||
                                    `العملة ${balance.currency_id}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {currency?.code || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-gray-900">
                                  {formatAmount(
                                    balance?.amount?.toString(),
                                    currency,
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Balances Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-right text-lg">
                  الأرصدة النظامية
                </h4>
                {loadingBalances[selectedCashierSession.id] ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mr-3 text-gray-600">
                      جاري تحميل الأرصدة...
                    </span>
                  </div>
                ) : cashierBalances[selectedCashierSession.id] &&
                  Array.isArray(cashierBalances[selectedCashierSession.id]) ? (
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full divide-y divide-gray-200"
                      dir="rtl"
                    >
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            العملة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الرصيد الافتتاحي
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            إجمالي الداخل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            إجمالي الخارج
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الرصيد النظامي
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cashierBalances[selectedCashierSession.id].map(
                          (balance: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {balance.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {balance.code}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-gray-900">
                                  {formatAmount(balance.opening_balance, {
                                    name: balance.name,
                                    code: balance.code,
                                  } as Currency)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-green-600">
                                  {formatAmount(balance.total_in, {
                                    name: balance.name,
                                    code: balance.code,
                                  } as Currency)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-red-600">
                                  {formatAmount(balance.total_out, {
                                    name: balance.name,
                                    code: balance.code,
                                  } as Currency)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-blue-600">
                                  {formatAmount(balance.system_balance, {
                                    name: balance.name,
                                    code: balance.code,
                                  } as Currency)}
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد أرصدة نظامية متاحة
                  </div>
                )}
              </div>

              {/* Session Info Section */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-medium text-gray-900 text-right text-lg">
                  معلومات الجلسة
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-right">
                    <span className="text-gray-600 block mb-1">
                      اسم الصراف:
                    </span>
                    <div className="font-medium text-gray-900">
                      {selectedCashierSession.casher.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 block mb-1">
                      تاريخ الفتح:
                    </span>
                    <div className="font-medium text-gray-900">
                      {formatDateTime(selectedCashierSession.opened_at).date} -{' '}
                      {formatDateTime(selectedCashierSession.opened_at).time}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 block mb-1">الحالة:</span>
                    <div className="font-medium">
                      {getStatusChip(selectedCashierSession.status)}
                    </div>
                  </div>
                  {selectedCashierSession.closed_at && (
                    <div className="text-right">
                      <span className="text-gray-600 block mb-1">
                        تاريخ الإغلاق:
                      </span>
                      <div className="font-medium text-gray-900">
                        {formatDateTime(selectedCashierSession.closed_at).date}{' '}
                        -{' '}
                        {formatDateTime(selectedCashierSession.closed_at).time}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogModal.Content>

        <DialogModal.Footer>
          <div className="flex justify-end space-x-3 space-x-reverse">
            <SecondaryButton onClick={handleCashierModalClose}>
              إغلاق
            </SecondaryButton>
          </div>
        </DialogModal.Footer>
      </DialogModal>

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
                              : 'text-red-600'
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
