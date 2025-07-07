import React from 'react';
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
} from '@heroui/react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowLeft,
  FiDollarSign,
} from 'react-icons/fi';
import SecondaryButton from '@/Components/SecondaryButton';
import {
  Currency,
  CashSession,
  User,
  Transaction,
  SessionOpeningBalance,
  CashBalance,
} from '@/types';
import { route } from 'ziggy-js';

interface CashSessionShowProps {
  cashSession: CashSession;
}

export default function CashSessionShow({ cashSession }: CashSessionShowProps) {
  console.log(cashSession);

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
        <SecondaryButton
          onClick={() => router.get(route('cash_sessions.index'))}
          className="text-sm"
        >
          <FiArrowLeft className="w-4 h-4 ml-1" />
          العودة للقائمة
        </SecondaryButton>
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
        {/* Opening Details */}
        <Card>
          <CardBody className="p-6 dir-rtl">
            <div className="flex items-center space-x-2 space-x-reverse mb-3">
              <FiCalendar className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-right">
                تفاصيل الفتح
              </h3>
            </div>
            <div className="space-y-2 text-sm text-right">
              <div>
                <span className="text-gray-500">التاريخ:</span>
                <div className="font-medium">{openedDateTime.date}</div>
              </div>
              <div>
                <span className="text-gray-500">الوقت:</span>
                <div className="font-medium">{openedDateTime.time}</div>
              </div>
              {cashSession.opened_by && (
                <div>
                  <span className="text-gray-500">فتحت بواسطة:</span>
                  <div className="font-medium">
                    {cashSession.opened_by.name}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Closing Details */}
        {closedDateTime && (
          <Card>
            <CardBody className="p-6 dir-rtl">
              <div className="flex items-center space-x-2 space-x-reverse mb-3">
                <FiCalendar className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900 text-right">
                  تفاصيل الإغلاق
                </h3>
              </div>
              <div className="space-y-2 text-sm text-right">
                <div>
                  <span className="text-gray-500">التاريخ:</span>
                  <div className="font-medium">{closedDateTime.date}</div>
                </div>
                <div>
                  <span className="text-gray-500">الوقت:</span>
                  <div className="font-medium">{closedDateTime.time}</div>
                </div>
                {cashSession.closed_by && (
                  <div>
                    <span className="text-gray-500">أغلقت بواسطة:</span>
                    <div className="font-medium">
                      {cashSession.closed_by.name}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

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
                <div className="font-medium">
                  {cashSession.transactions?.length || 0}
                </div>
              </div>
              <div>
                <span className="text-gray-500">المدة الإجمالية:</span>
                <div className="font-medium">{duration}</div>
              </div>
              {cashSession.transactions && (
                <div>
                  <span className="text-gray-500">المعاملات المكتملة:</span>
                  <div className="font-medium">
                    {
                      cashSession.transactions.filter(
                        t => t.status === 'completed',
                      ).length
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          المعاملات ({cashSession.transactions?.length || 0})
        </h2>
        {cashSession.transactions && cashSession.transactions.length > 0 ? (
          <Card>
            <CardBody>
              <Table aria-label="معاملات الجلسة">
                <TableHeader>
                  <TableColumn>رقم المعاملة</TableColumn>
                  <TableColumn>التاريخ والوقت</TableColumn>
                  <TableColumn>أنشأت بواسطه</TableColumn>
                  <TableColumn>الصراف</TableColumn>
                  <TableColumn>من</TableColumn>
                  <TableColumn>إلى</TableColumn>
                  <TableColumn>المبلغ الأصلي</TableColumn>
                  <TableColumn>المبلغ المحول</TableColumn>
                  <TableColumn>الحالة</TableColumn>
                </TableHeader>
                <TableBody>
                  {cashSession.transactions.map(transaction => {
                    const transactionDateTime = formatDateTime(
                      transaction.created_at,
                    );
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <span className="font-mono text-sm">
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
                              {transaction.assigned_to?.name || 'غير مخصص'}
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

      {/* Closing Balances */}
      {cashSession.cash_balances &&
        cashSession.cash_balances.length > 0 &&
        cashSession.status === 'closed' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              الأرصدة الختامية
            </h2>
            <Card>
              <CardBody>
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
                          <TableCell>
                            {balance.currency?.code || 'N/A'}
                          </TableCell>
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
                              {formatAmount(
                                balance.difference,
                                balance.currency,
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )}
    </RootLayout>
  );
}
