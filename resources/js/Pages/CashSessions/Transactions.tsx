import React, { useState } from 'react';
import { router } from '@inertiajs/react';
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
  Pagination,
  Button,
} from '@heroui/react';
import {
  FiArrowLeft,
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiList,
} from 'react-icons/fi';
import SecondaryButton from '@/Components/SecondaryButton';
import TransactionDetailModal from '@/Components/TransactionDetailModal';
import { Currency, CashSession, Transaction } from '@/types';
import { route } from 'ziggy-js';

interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CashSessionTransactionsProps {
  cashSession: CashSession;
  transactions: PaginatedTransactions;
}

export default function CashSessionTransactions({
  cashSession,
  transactions,
}: CashSessionTransactionsProps) {
  console.log('Cash Session:', cashSession);
  console.log('Transactions:', transactions);

  // State for transaction modal
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Handle transaction row click
  const handleTransactionClick = (transactionId: number) => {
    router.get(route('transaction.show', { transaction: transactionId }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    router.get(
      route('cash_sessions.transactions', { cashSession: cashSession.id }),
      { page },
      { preserveState: true, preserveScroll: true },
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
    amount: string | number,
    currency: Currency | null | undefined,
  ) => {
    try {
      if (!currency || !amount) {
        return 'غير متاح';
      }
      const numAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) {
        return 'غير متاح';
      }
      const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }).format(numAmount);
      return `${formattedAmount}`;
    } catch (error) {
      return 'غير متاح';
    }
  };

  // Get session status chip
  const getSessionStatusChip = (status: string) => {
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

  return (
    <RootLayout
      title={`معاملات جلسة #${cashSession.id}`}
      breadcrumbs={[
        { label: 'الرئيسية', href: route('dashboard') },
        { label: 'الجلسات النقدية', href: route('cash_sessions.index') },
        {
          label: `جلسة #${cashSession.id}`,
          href: route('cash_sessions.show', { cashSession: cashSession.id }),
        },
        { label: 'المعاملات' },
      ]}
      headerActions={
        <div className="flex items-center gap-3">
          <SecondaryButton
            onClick={() =>
              router.get(
                route('cash_sessions.show', { cashSession: cashSession.id }),
              )
            }
            className="text-sm"
          >
            <FiArrowLeft className="w-4 h-4 ml-1" />
            العودة للجلسة
          </SecondaryButton>
        </div>
      }
    >
      {/* Transactions Table */}
      <div className="mb-8">
        {transactions.data.length > 0 ? (
          <Card>
            <CardBody className="p-0">
              <Table
                aria-label="معاملات الجلسة النقدية"
                selectionMode="single"
                classNames={{
                  wrapper: 'shadow-none border-none',
                  table: 'min-h-[400px]',
                }}
              >
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
                  <TableColumn>الإجراءات</TableColumn>
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
                              transaction.original_amount,
                              transaction.from_currency,
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatAmount(
                              transaction.converted_amount,
                              transaction.to_currency,
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTransactionStatusChip(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              handleTransactionClick(transaction.id);
                            }}
                            startContent={<FiEye className="w-4 h-4" />}
                          >
                            عرض
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
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

      {/* Pagination */}
      {transactions.last_page > 1 && (
        <div className="flex justify-center mb-8">
          <Pagination
            total={transactions.last_page}
            page={transactions.current_page}
            onChange={handlePageChange}
            showControls
            className="gap-2"
          />
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionId={selectedTransactionId}
      />
    </RootLayout>
  );
}
