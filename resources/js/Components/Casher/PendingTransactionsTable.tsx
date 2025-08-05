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
  Button,
  Chip,
} from '@heroui/react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import NotesModal from '../NotesModal';
import EditTransactionModal from '../EditTransactionModal';
import type { Transaction, User, Currency, Customer } from '../../types';

interface PendingTransactionsResponse {
  status: boolean;
  message: string;
  data: {
    transactions: Transaction[];
  };
}

interface PendingTransactionsTableProps {
  transactions: Transaction[];
  isSessionActive?: boolean;
  isSessionPending?: boolean;
  isLoading?: boolean;
  isPolling?: boolean;
  lastUpdated?: Date | null;
  onRefetch?: () => void;
  isAdmin?: boolean; // Add admin prop
  currencies?: any[]; // Add currencies for edit modal
  availableCashers?: User[]; // Add available cashers for edit modal
  isUnavailable?: boolean; // NEW: cashier unavailable
}

export default function PendingTransactionsTable({
  transactions,
  isSessionActive = false,
  isSessionPending = false,
  isLoading = false,
  isPolling = false,
  lastUpdated = null,
  onRefetch,
  isAdmin = false,
  currencies = [],
  availableCashers = [],
  isUnavailable = false,
}: PendingTransactionsTableProps) {
  // Track which transaction and which action is being updated
  const [updatingAction, setUpdatingAction] = useState<{
    id: number;
    action: 'confirm' | 'cancel';
  } | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    number | null
  >(null);

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

  // This component now receives transactions as props from the parent
  // No need for separate API calls since parent uses unified status polling

  // Update transaction status
  const updateTransactionStatus = async (
    transactionId: number,
    status: 'confirm' | 'cancel',
  ) => {
    // Block if session is not active, is pending, or cashier is unavailable
    if (!isSessionActive || isSessionPending || isUnavailable) {
      if (isSessionPending) {
        toast.error('لا يمكن تحديث حالة المعاملة - الجلسة في حالة جرد');
      } else if (isUnavailable) {
        toast.error(
          'لا يمكنك تنفيذ عمليات حالياً لأن حالتك غير متاحة. يرجى تغيير حالتك إلى "متواجد" للمتابعة.',
        );
      } else {
        toast.error('لا يمكن تحديث حالة المعاملة - الجلسة غير نشطة');
      }
      return;
    }
    setUpdatingAction({ id: transactionId, action: status });
    try {
      const base = status === 'cancel' && isAdmin ? '/admin' : '/casher';
      const endpoint = `${base}/transactions/${transactionId}/${status}`;
      const response = await axios.put(endpoint);
      if (response.data.status) {
        toast.success(`تم ${status} المعاملة بنجاح`);
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
      setUpdatingAction(null);
    }
  };

  // No need for polling logic since parent handles unified status polling

  const handleTransactionClick = (transactionId: number) => {
    router.get(
      route('admin.transactions.show', { transaction: transactionId }),
    );
  };

  const handleViewNotes = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNotesModalOpen(true);
  };

  const handleCloseNotesModal = () => {
    setNotesModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (transactionId: number) => {
    setEditingTransactionId(transactionId);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTransactionId(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
    if (onRefetch) {
      onRefetch();
    }
  };

  const isBlocked = !isSessionActive || isSessionPending || isUnavailable;
  // Determine overlay message and icon for blocked state
  let overlayIcon = null;
  let overlayTitle = '';
  let overlayMessage = '';
  if (isSessionPending) {
    overlayIcon = (
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
        <svg
          className="w-8 h-8 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
    overlayTitle = 'الجلسة النقدية معلقة';
    overlayMessage =
      'الجلسة الحالية معلقة، يتم الآن جرد الأرصدة ولا يمكن تنفيذ عمليات جديدة.';
  } else if (!isSessionActive) {
    overlayIcon = (
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    );
    overlayTitle = 'الجلسة النقدية مغلقة';
    overlayMessage = 'يجب فتح جلسة نقدية جديدة قبل تنفيذ أي عمليات تحويل';
  } else if (isUnavailable) {
    overlayIcon = (
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
    );
    overlayTitle = 'غير متاح';
    overlayMessage =
      'لا يمكنك تنفيذ معاملات حالياً لأن حالتك غير متاحة. يرجى تغيير حالتك إلى "متواجد" للمتابعة.';
  }

  return (
    <div className="w-full mb-8">
      <Table
        aria-label="Casher pending transactions table"
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
                      المعاملات المعينة لك والتي تحتاج إلى تأكيد (
                      {transactions.length})
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

          <TableColumn>من</TableColumn>
          <TableColumn>إلى</TableColumn>
          <TableColumn>المبلغ الأصلي</TableColumn>
          <TableColumn>المبلغ المحول</TableColumn>
          <TableColumn>منشئ العملية</TableColumn>
          <TableColumn>مُعين إلى</TableColumn>
          <TableColumn>ملاحظات</TableColumn>
          <TableColumn>الحالة</TableColumn>
          <TableColumn>{isAdmin ? 'الإجراءات' : 'الإجراءات'}</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            isLoading ? (
              'جاري التحميل...'
            ) : isSessionPending || isUnavailable ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-yellow-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  غير متاح
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  لا يمكنك تنفيذ معاملات حالياً لأن حالتك غير متاحة. يرجى تغيير
                  حالتك إلى "متواجد" للمتابعة.
                </p>
              </div>
            ) : !isSessionActive ? (
              'لا توجد جلسة نشطة - لا يمكن عرض المعاملات المعلقة'
            ) : (
              'لا توجد معاملات معلقة مُعينة لك'
            )
          }
        >
          {!isUnavailable && !isSessionPending
            ? transactions
                .filter(transaction => transaction && transaction.id)
                .map(transaction => {
                  const dateTime = formatDateTime(transaction.created_at);
                  const isConfirmLoading =
                    updatingAction &&
                    updatingAction.id === transaction.id &&
                    updatingAction.action === 'confirm';
                  const isCancelLoading =
                    updatingAction &&
                    updatingAction.id === transaction.id &&
                    updatingAction.action === 'cancel';
                  const isAnyUpdating =
                    updatingAction && updatingAction.id === transaction.id;
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
                          <div>
                            {transaction.to_currency?.name || 'غير محدد'}
                          </div>
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
                          <div>
                            {transaction.created_by?.name || 'غير محدد'}
                          </div>
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
                              variant="ghost"
                              onClick={e => {
                                e.stopPropagation(); // Prevent row click
                                handleViewNotes(transaction);
                              }}
                              className="h-6 px-2"
                            >
                              <span className="text-blue-600 text-sm">📝</span>
                              <span className="text-xs text-gray-600 mr-1">
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
                        <div className="flex gap-2">
                          <Button
                            color="success"
                            size="sm"
                            isLoading={!!isConfirmLoading}
                            isDisabled={isAnyUpdating || isBlocked}
                            onClick={e => {
                              e.stopPropagation();
                              updateTransactionStatus(
                                transaction.id,
                                'confirm',
                              );
                            }}
                          >
                            {isConfirmLoading
                              ? 'جاري التأكيد...'
                              : isSessionPending
                                ? 'جلسة معلقة'
                                : !isSessionActive
                                  ? 'غير متاح'
                                  : isUnavailable
                                    ? 'غير متاح'
                                    : 'تأكيد'}
                          </Button>
                          {isAdmin && (
                            <Button
                              color="danger"
                              size="sm"
                              isLoading={!!isCancelLoading}
                              isDisabled={isAnyUpdating || isBlocked}
                              onClick={e => {
                                e.stopPropagation();
                                updateTransactionStatus(
                                  transaction.id,
                                  'cancel',
                                );
                              }}
                            >
                              {isCancelLoading
                                ? 'جاري الإلغاء...'
                                : isSessionPending
                                  ? 'جلسة معلقة'
                                  : !isSessionActive
                                    ? 'غير متاح'
                                    : isUnavailable
                                      ? 'غير متاح'
                                      : 'إلغاء'}
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              color="primary"
                              size="sm"
                              variant="ghost"
                              isDisabled={isAnyUpdating || isBlocked}
                              onClick={e => {
                                e.stopPropagation();
                                handleEditTransaction(transaction.id);
                              }}
                            >
                              تعديل
                            </Button>
                          )}
                        </div>
                        {/* Overlay when session is closed/pending or cashier unavailable */}
                        {isBlocked && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                            <div className="bg-white rounded-xl shadow-lg p-4 mx-4 max-w-md text-center border border-gray-200">
                              {overlayIcon}
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {overlayTitle}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                {overlayMessage}
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
            : []}
        </TableBody>
      </Table>

      <NotesModal
        isOpen={notesModalOpen}
        onClose={handleCloseNotesModal}
        transaction={selectedTransaction}
      />

      {/* Edit Transaction Modal */}
      {editingTransactionId && (
        <EditTransactionModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          transactionId={editingTransactionId}
          currencies={currencies} // This should already be the live array from status polling
          availableCashers={availableCashers}
          isSessionOpen={isSessionActive}
          isSessionPending={isSessionPending}
        />
      )}
    </div>
  );
}
