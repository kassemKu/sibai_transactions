import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import RootLayout from '@/Layouts/RootLayout';
import {
  Accordion,
  AccordionItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
} from '@heroui/react';
import { FiCalendar, FiClock, FiUser, FiEye, FiLoader } from 'react-icons/fi';
import PrimaryButton from '@/Components/PrimaryButton';
import {
  Currency,
  CashSession,
  User,
  Transaction,
  CashSessionsResponse,
} from '@/types';
import { route } from 'ziggy-js';

interface CashSessionsIndexProps {
  cashSessions: CashSessionsResponse;
}

interface SessionTransactions {
  [sessionId: number]: {
    transactions: Transaction[];
    totalCount: number;
    isLoading: boolean;
    hasLoaded: boolean;
  };
}

export default function CashSessionsIndex({
  cashSessions,
}: CashSessionsIndexProps) {
  // State for managing transactions per session
  const [sessionTransactions, setSessionTransactions] =
    useState<SessionTransactions>({});

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
      <Chip color={config.color} size="sm">
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
        return 'غير متاح';
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        return 'غير متاح';
      }
      const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }).format(numAmount);
      return `${formattedAmount} ${currency.code}`;
    } catch (error) {
      return 'غير متاح';
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

  // Fetch transactions for a specific session
  const fetchSessionTransactions = async (sessionId: number) => {
    // Don't fetch if already loaded or loading
    if (
      sessionTransactions[sessionId]?.hasLoaded ||
      sessionTransactions[sessionId]?.isLoading
    ) {
      return;
    }

    setSessionTransactions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        isLoading: true,
      },
    }));

    try {
      const response = await axios.get(
        `/admin/cash-sessions/${sessionId}/transactions`,
        {
          params: { page: 1, per_page: 10 }, // Only fetch last 10 transactions
        },
      );

      setSessionTransactions(prev => ({
        ...prev,
        [sessionId]: {
          transactions: response.data.data.data || [],
          totalCount: response.data.data.total || 0,
          isLoading: false,
          hasLoaded: true,
        },
      }));
    } catch (error) {
      console.error('Error fetching session transactions:', error);
      setSessionTransactions(prev => ({
        ...prev,
        [sessionId]: {
          transactions: [],
          totalCount: 0,
          isLoading: false,
          hasLoaded: true,
        },
      }));
    }
  };

  // Handle accordion item selection
  const handleAccordionChange = (keys: any) => {
    if (typeof keys === 'string') {
      const sessionId = parseInt(keys);
      if (!isNaN(sessionId)) {
        fetchSessionTransactions(sessionId);
      }
    } else if (keys instanceof Set) {
      keys.forEach(key => {
        const sessionId = parseInt(key);
        if (!isNaN(sessionId)) {
          fetchSessionTransactions(sessionId);
        }
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    router.get(route('cash_sessions.index'), { page }, { preserveState: true });
  };

  // Navigate to session details
  const viewSessionDetails = (sessionId: number) => {
    router.get(route('cash_sessions.show', sessionId));
  };

  return (
    <RootLayout
      title="الجلسات النقدية"
      breadcrumbs={[
        { label: 'الرئيسية', href: route('dashboard') },
        { label: 'الجلسات النقدية' },
      ]}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الجلسات النقدية
        </h1>
        <p className="text-gray-600">
          عرض وإدارة جميع الجلسات النقدية والمعاملات المرتبطة بها
        </p>
      </div>

      {cashSessions.data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">لا توجد جلسات نقدية</div>
        </div>
      ) : (
        <>
          <Accordion
            variant="splitted"
            selectionMode="multiple"
            className="w-full mb-6"
            onSelectionChange={handleAccordionChange}
          >
            {cashSessions.data.map(session => {
              const openedDateTime = formatDateTime(session.opened_at);
              const closedDateTime = session.closed_at
                ? formatDateTime(session.closed_at)
                : null;
              const duration = calculateDuration(
                session.opened_at,
                session.closed_at,
              );

              return (
                <AccordionItem
                  key={session.id.toString()}
                  aria-label={`جلسة ${session.id}`}
                  title={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <FiCalendar className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">
                            جلسة #{session.id}
                          </span>
                        </div>
                        {getStatusChip(session.status)}
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <FiClock className="w-4 h-4" />
                          <span>{duration}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <FiCalendar className="w-4 h-4" />
                          <span>{openedDateTime.date}</span>
                        </div>
                      </div>
                    </div>
                  }
                  subtitle={
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mt-1">
                      <span>فتحت في: {openedDateTime.time}</span>
                      {closedDateTime && (
                        <span>أغلقت في: {closedDateTime.time}</span>
                      )}
                      {session.opened_by && (
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <FiUser className="w-3 h-3" />
                          <span>بواسطة: {session.opened_by.name}</span>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="pt-4">
                    {/* Action Button */}
                    <div className="mb-4 flex justify-end">
                      <PrimaryButton
                        onClick={() => viewSessionDetails(session.id)}
                        className="text-sm"
                      >
                        <FiEye className="w-4 h-4 ml-1" />
                        عرض التفاصيل
                      </PrimaryButton>
                    </div>

                    {/* Session Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        تفاصيل الجلسة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">تاريخ الفتح:</span>
                          <div className="font-medium">
                            {openedDateTime.date} - {openedDateTime.time}
                          </div>
                        </div>
                        {closedDateTime && (
                          <div>
                            <span className="text-gray-500">
                              تاريخ الإغلاق:
                            </span>
                            <div className="font-medium">
                              {closedDateTime.date} - {closedDateTime.time}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">المدة:</span>
                          <div className="font-medium">{duration}</div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          المعاملات (
                          {sessionTransactions[session.id]?.isLoading
                            ? '...'
                            : sessionTransactions[session.id]?.hasLoaded
                              ? sessionTransactions[session.id].totalCount
                              : '...'}
                          )
                        </h3>
                        {sessionTransactions[session.id]?.hasLoaded && (
                          <PrimaryButton
                            onClick={() => viewSessionDetails(session.id)}
                            className="text-sm"
                          >
                            <FiEye className="w-4 h-4 ml-1" />
                            عرض جميع المعاملات
                          </PrimaryButton>
                        )}
                      </div>
                      {sessionTransactions[session.id]?.isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <FiLoader className="w-6 h-6 text-gray-500 animate-spin" />
                            <span className="text-gray-500">
                              جاري تحميل المعاملات...
                            </span>
                          </div>
                        </div>
                      ) : sessionTransactions[session.id]?.transactions &&
                        sessionTransactions[session.id].transactions.length >
                          0 ? (
                        <>
                          <div className="mb-2 text-sm text-gray-600">
                            عرض آخر{' '}
                            {
                              sessionTransactions[session.id].transactions
                                .length
                            }{' '}
                            معاملة من أصل{' '}
                            {sessionTransactions[session.id].totalCount} معاملة
                          </div>
                          <Table aria-label={`معاملات الجلسة ${session.id}`}>
                            <TableHeader>
                              <TableColumn>التاريخ والوقت</TableColumn>
                              <TableColumn>أنشأت بواسطة</TableColumn>
                              <TableColumn>من</TableColumn>
                              <TableColumn>إلى</TableColumn>
                              <TableColumn>المبلغ الأصلي</TableColumn>
                              <TableColumn>المبلغ المحول</TableColumn>
                              <TableColumn>الحالة</TableColumn>
                            </TableHeader>
                            <TableBody>
                              {sessionTransactions[session.id].transactions.map(
                                transaction => {
                                  const transactionDateTime = formatDateTime(
                                    transaction.created_at,
                                  );

                                  return (
                                    <TableRow key={transaction.id}>
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
                                            {transaction.created_by?.name ||
                                              'غير متاح'}
                                          </div>
                                          <div className="text-gray-500">
                                            {transaction.created_by?.email ||
                                              'غير متاح'}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          <div className="font-medium">
                                            {transaction.from_currency?.name ||
                                              'غير متاح'}
                                          </div>
                                          <div className="text-gray-500">
                                            {transaction.from_currency?.code ||
                                              'N/A'}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          <div className="font-medium">
                                            {transaction.to_currency?.name ||
                                              'غير متاح'}
                                          </div>
                                          <div className="text-gray-500">
                                            {transaction.to_currency?.code ||
                                              'N/A'}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="font-medium">
                                          {transaction.from_currency &&
                                          transaction.original_amount
                                            ? formatAmount(
                                                transaction.original_amount.toString(),
                                                transaction.from_currency,
                                              )
                                            : 'غير متاح'}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="font-medium">
                                          {transaction.to_currency &&
                                          transaction.converted_amount
                                            ? formatAmount(
                                                transaction.converted_amount.toString(),
                                                transaction.to_currency,
                                              )
                                            : 'غير متاح'}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getTransactionStatusChip(
                                          transaction.status,
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                },
                              )}
                            </TableBody>
                          </Table>
                        </>
                      ) : sessionTransactions[session.id]?.hasLoaded ? (
                        <div className="text-center py-8 text-gray-500">
                          لا توجد معاملات في هذه الجلسة
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          انقر لتحميل المعاملات
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Pagination */}
          {cashSessions.last_page > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={cashSessions.last_page}
                page={cashSessions.current_page}
                onChange={handlePageChange}
                showControls
                className="gap-2"
              />
            </div>
          )}
        </>
      )}
    </RootLayout>
  );
}
