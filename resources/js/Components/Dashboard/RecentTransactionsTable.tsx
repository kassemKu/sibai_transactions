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
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useNewTransactionNotification } from '@/Hooks/useNewTransactionNotification';
import NewTransactionNotification from '@/Components/Casher/NewTransactionNotification';
import { usePage } from '@inertiajs/react';
import {
  Transaction as GlobalTransaction,
  User,
  Currency,
  Customer,
} from '@/types';
import NotesModal from '../NotesModal';

interface PendingTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: GlobalTransaction[];
  };
}

interface RecentTransactionsTableProps {
  transactions: GlobalTransaction[];
  isSessionActive?: boolean;
  isSessionPending?: boolean;
  isLoading?: boolean;
  isPolling?: boolean;
  lastUpdated?: Date | null;
  onRefetch?: () => void;
}

export default function RecentTransactionsTable({
  transactions,
  isSessionActive = false,
  isSessionPending = false,
  isLoading = false,
  isPolling = false,
  lastUpdated = null,
  onRefetch,
}: RecentTransactionsTableProps) {
  const { auth } = usePage().props as any;
  const [updatingTransactions, setUpdatingTransactions] = useState<Set<number>>(
    new Set(),
  );
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<GlobalTransaction | null>(null);

  // Use notification hook for new pending transactions
  const { showVisualNotification, hideVisualNotification } =
    useNewTransactionNotification(transactions as GlobalTransaction[], {
      enabled: isSessionActive, // Only enable when session is active
      currentUserEmail: auth?.user?.email, // Pass current user email to filter self-created transactions
    });

  // Helper functions defined first
  const getStatusLabel = (status: GlobalTransaction['status']) => {
    const labels = {
      pending: 'معلقة',
      completed: 'مكتملة',
      canceled: 'ملغية',
    };
    return labels[status] || status;
  };

  // Get status color and label
  const getStatusChip = (status: GlobalTransaction['status']) => {
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

  // This component now receives transactions as props from the parent
  // No need for separate API calls since parent uses unified status polling

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
      const endpoint = `/admin/transactions/${transactionId}/${status}`;
      const response = await axios.put(endpoint);

      if (response.data.status) {
        toast.success(
          `تم تحديث حالة المعاملة إلى ${getStatusLabel(status === 'complete' ? 'completed' : status === 'cancel' ? 'canceled' : 'pending')}`,
        );
        // Refresh the data immediately
        if (onRefetch) {
          await onRefetch();
        }
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

  const handleTransactionClick = (transactionId: number) => {
    router.get(route('transaction.show', { transaction: transactionId }));
  };

  const handleOpenNotesModal = (transaction: GlobalTransaction) => {
    setSelectedTransaction(transaction);
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
    setSelectedTransaction(null);
  };

  // No need for polling logic since parent handles unified status polling
  return (
    <>
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
            {/* <TableColumn>العميل</TableColumn> */}
            <TableColumn>من</TableColumn>
            <TableColumn>إلى</TableColumn>
            <TableColumn>المبلغ الأصلي</TableColumn>
            <TableColumn>المبلغ المحول</TableColumn>
            <TableColumn>منشئ العملية</TableColumn>
            <TableColumn>مُعين إلى</TableColumn>
            <TableColumn>ملاحظات</TableColumn>
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
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTransactionClick(transaction.id)}
                  >
                    <TableCell>
                      <div className="text-sm">
                        <div>{dateTime.date}</div>
                        <div className="text-gray-500">{dateTime.time}</div>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                    <div className="text-sm">
                      <div>{transaction.customer?.name || 'غير محدد'}</div>
                      {transaction.customer?.phone && (
                        <div className="text-gray-500">
                          {transaction.customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell> */}
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {transaction.from_currency?.name || 'غير محدد'}
                        </div>
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
                        <div>{transaction.created_by?.name || 'غير محدد'}</div>
                        <div className="text-gray-500 text-xs">
                          {transaction.created_by?.email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{transaction.assigned_to?.name || 'Admin'}</div>
                        <div className="text-gray-500 text-xs">
                          {transaction.assigned_to?.email || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.notes ? (
                          <Button
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenNotesModal(transaction);
                            }}
                          >
                            <span className="text-blue-600 text-lg">📝</span>
                            <span className="text-xs text-gray-600">
                              ملاحظة
                            </span>
                          </Button>
                        ) : (
                          <>
                            <span className="text-gray-400 text-lg">-</span>
                            <span className="text-xs text-gray-400">
                              لايوجد
                            </span>
                          </>
                        )}
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
                              ? ''
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
                            if (key === 'complete' || key === 'cancel') {
                              updateTransactionStatus(
                                transaction.id,
                                key as 'complete' | 'cancel',
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
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* New Transaction Notification */}
      <NewTransactionNotification
        transactions={transactions as GlobalTransaction[]}
        isVisible={showVisualNotification}
        onClose={hideVisualNotification}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={handleCloseNotesModal}
        transaction={selectedTransaction}
      />
    </>
  );
}
