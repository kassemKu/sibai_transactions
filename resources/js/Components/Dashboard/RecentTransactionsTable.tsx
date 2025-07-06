import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
  TableColumn,
  Table,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from '@heroui/react';

interface Currency {
  id: number;
  name: string;
  code: string;
  rate_to_usd: string | number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
}

interface Transaction {
  id: number;
  customer_id: number;
  user_id: number;
  cash_session_id: number;
  from_currency_id: number;
  to_currency_id: number;
  original_amount: number;
  from_rate_to_usd: string | number;
  to_rate_to_usd: string | number;
  converted_amount: number;
  status: 'pending' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
  from_currency: Currency;
  to_currency: Currency;
  user: User;
  customer: Customer;
}

interface PendingTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: Transaction[];
  };
}

interface RecentTransactionsTableProps {
  isSessionActive?: boolean;
  isSessionPending?: boolean;
}

export default function RecentTransactionsTable({
  isSessionActive = false,
  isSessionPending = false,
}: RecentTransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTransactions, setUpdatingTransactions] = useState<Set<number>>(
    new Set(),
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Helper functions defined first
  const getStatusLabel = (status: Transaction['status']) => {
    const labels = {
      pending: 'معلقة',
      completed: 'مكتملة',
      canceled: 'ملغية',
    };
    return labels[status] || status;
  };

  // Get status color and label
  const getStatusChip = (status: Transaction['status']) => {
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
      console.error('Error formatting date:', error);
      return { date: 'غير متاح', time: 'غير متاح' };
    }
  };

  // Format amount with currency
  const formatAmount = (amount: number, currency: Currency) => {
    try {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }).format(amount);
      return `${formattedAmount} ${currency.code}`;
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} ${currency?.code || ''}`;
    }
  };

  // Fetch pending transactions
  const fetchPendingTransactions = async (showLoader = true) => {
    // Don't fetch if session is not active or is pending (being closed)
    if (!isSessionActive || isSessionPending) {
      if (showLoader) setIsLoading(false);
      else setIsPolling(false);
      if (isSessionPending) {
        setTransactions([]); // Clear transactions when session is pending
      }
      return;
    }

    if (showLoader) setIsLoading(true);
    else setIsPolling(true);

    try {
      const response = await axios.get<PendingTransactionsResponse>(
        '/admin/pending-transactions',
      );
      if (response.data.status) {
        setTransactions(response.data.data.transactions || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      // Only show error on initial load, not on polling
      if (showLoader) {
        toast.error('فشل في جلب المعاملات المعلقة');
      }
    } finally {
      if (showLoader) setIsLoading(false);
      else setIsPolling(false);
    }
  };

  // Update transaction status
  const updateTransactionStatus = async (
    transactionId: number,
    status: 'pending' | 'complete' | 'cancel',
  ) => {
    // Don't update if session is not active or is pending
    if (!isSessionActive || isSessionPending) {
      if (isSessionPending) {
        toast.error('لا يمكن تحديث حالة المعاملة - الجلسة في حالة جرد');
      } else {
        toast.error('لا يمكن تحديث حالة المعاملة - الجلسة غير نشطة');
      }
      return;
    }

    setUpdatingTransactions(prev => new Set(prev).add(transactionId));

    try {
      const endpoint = `/transactions/${transactionId}/${status}`;
      const response = await axios.put(endpoint);

      if (response.data.status) {
        toast.success(
          `تم تحديث حالة المعاملة إلى ${getStatusLabel(status === 'complete' ? 'completed' : status === 'cancel' ? 'canceled' : 'pending')}`,
        );
        // Refresh the data immediately
        await fetchPendingTransactions(false);
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('حدث خطأ أثناء تحديث حالة المعاملة');
      }
    } finally {
      setUpdatingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  // Watch for session status changes
  useEffect(() => {
    if (isSessionActive && !isSessionPending) {
      // Fetch data when session becomes active and not pending
      fetchPendingTransactions();
    } else {
      // Clear data when session becomes inactive or pending
      setTransactions([]);
      setLastUpdated(null);
    }
  }, [isSessionActive, isSessionPending]);

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !isLoading &&
        !Array.from(updatingTransactions).length &&
        isSessionActive &&
        !isSessionPending
      ) {
        fetchPendingTransactions(false); // Don't show loader for polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, updatingTransactions, isSessionActive, isSessionPending]);

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any ongoing requests or intervals
    };
  }, []);

  return (
    <div className="w-full mb-8">
      <Table
        aria-label="Recent pending transactions table"
        topContent={
          <div className="mb-1 text-bold-x14 text-[#1F2937] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div>المعاملات المعلقة</div>
                <div className="text-med-x14 text-text-grey-light">
                  {isSessionPending ? (
                    'الجلسة في حالة جرد حاليًا، لا يمكن تنفيذ عمليات جديدة'
                  ) : isSessionActive ? (
                    <>
                      المعاملات التي تحتاج إلى مراجعة ({transactions.length})
                      {lastUpdated && (
                        <span className="text-xs ml-2">
                          • آخر تحديث:{' '}
                          {lastUpdated.toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </>
                  ) : (
                    'يتطلب جلسة نشطة لعرض المعاملات المعلقة'
                  )}
                </div>
              </div>
              {(isLoading || isPolling) && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">
                    {isLoading ? 'جاري التحميل...' : 'جاري التحديث...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        }
      >
        <TableHeader>
          <TableColumn>التاريخ والوقت</TableColumn>
          <TableColumn>العميل</TableColumn>
          <TableColumn>من</TableColumn>
          <TableColumn>إلى</TableColumn>
          <TableColumn>المبلغ الأصلي</TableColumn>
          <TableColumn>المبلغ المحول</TableColumn>
          <TableColumn>الصراف</TableColumn>
          <TableColumn>الحالة</TableColumn>
          <TableColumn>الإجراءات</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            isLoading
              ? 'جاري التحميل...'
              : isSessionPending
                ? 'الجلسة في حالة جرد - تم إيقاف المعاملات المعلقة'
                : !isSessionActive
                  ? 'لا توجد جلسة نشطة - لا يمكن عرض المعاملات المعلقة'
                  : 'لا توجد معاملات معلقة'
          }
        >
          {transactions
            .filter(transaction => transaction && transaction.id) // Filter out invalid transactions
            .map(transaction => {
              const dateTime = formatDateTime(transaction.created_at);
              const isUpdating = updatingTransactions.has(transaction.id);

              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{dateTime.date}</div>
                      <div className="text-gray-500">{dateTime.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{transaction.customer?.name || 'غير محدد'}</div>
                      {transaction.customer?.phone && (
                        <div className="text-gray-500">
                          {transaction.customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{transaction.from_currency?.name || 'غير محدد'}</div>
                      <div className="text-gray-500">
                        {transaction.from_currency?.code || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{transaction.to_currency?.name || 'غير محدد'}</div>
                      <div className="text-gray-500">
                        {transaction.to_currency?.code || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.from_currency
                        ? formatAmount(
                            transaction.original_amount,
                            transaction.from_currency,
                          )
                        : new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            useGrouping: true,
                          }).format(transaction.original_amount || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.to_currency
                        ? formatAmount(
                            transaction.converted_amount,
                            transaction.to_currency,
                          )
                        : new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            useGrouping: true,
                          }).format(transaction.converted_amount || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {transaction.user?.name || 'غير محدد'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusChip(transaction.status)}</TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={isUpdating}
                          isDisabled={
                            isUpdating || !isSessionActive || isSessionPending
                          }
                        >
                          {isUpdating
                            ? 'جاري التحديث...'
                            : isSessionPending
                              ? 'جلسة معلقة'
                              : !isSessionActive
                                ? 'غير متاح'
                                : 'الإجراءات'}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Transaction actions"
                        onAction={key => {
                          if (
                            key === 'complete' ||
                            key === 'cancel' ||
                            key === 'pending'
                          ) {
                            updateTransactionStatus(
                              transaction.id,
                              key as 'complete' | 'cancel' | 'pending',
                            );
                          }
                        }}
                      >
                        <DropdownItem
                          key="complete"
                          color="success"
                          description="تأكيد إكمال المعاملة"
                        >
                          تأكيد إكمال
                        </DropdownItem>
                        <DropdownItem
                          key="cancel"
                          color="danger"
                          description="إلغاء المعاملة"
                        >
                          إلغاء المعاملة
                        </DropdownItem>
                        <DropdownItem
                          key="pending"
                          color="warning"
                          description="إعادة إلى الانتظار"
                        >
                          إعادة للانتظار
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
