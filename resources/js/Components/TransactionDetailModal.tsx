import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
} from '@heroui/react';
import {
  FiCopy,
  FiDownload,
  FiEye,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiCalendar,
  FiUser,
  FiInfo,
  FiEdit3,
} from 'react-icons/fi';
import { Transaction, Currency } from '@/types';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
}

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transactionId,
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction details when modal opens
  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetails();
    } else {
      setTransaction(null);
      setError(null);
    }
  }, [isOpen, transactionId]);

  const fetchTransactionDetails = async () => {
    if (!transactionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/admin/transactions/${transactionId}`);
      console.log(response.data.transaction);
      setTransaction(response.data.transaction);
    } catch (err: any) {
      setError('فشل في تحميل تفاصيل المعاملة');
      console.error('Error fetching transaction details:', err);
    } finally {
      setIsLoading(false);
    }
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
      return `${formattedAmount} ${currency.code}`;
    } catch (error) {
      return 'غير متاح';
    }
  };

  // Format USD amount
  const formatUsdAmount = (amount: number | undefined) => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
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
      <Chip color={config.color} size="md">
        {config.label}
      </Chip>
    );
  };

  // Check if transaction was manually adjusted
  const isManuallyAdjusted = useCallback(() => {
    if (
      !transaction?.from_currency_rates_snapshot ||
      !transaction?.to_currency_rates_snapshot
    ) {
      return false;
    }

    // Calculate what the amount should be based on the rates snapshot
    const usdAmount =
      transaction.original_amount /
      transaction.from_currency_rates_snapshot.buy_rate_to_usd;
    const calculatedAmount =
      usdAmount * transaction.to_currency_rates_snapshot.sell_rate_to_usd;

    // Compare with actual converted amount (with small tolerance for rounding)
    const difference = Math.abs(
      calculatedAmount - transaction.converted_amount,
    );
    return difference > 0.01; // If difference is more than 1 cent, it was manually adjusted
  }, [transaction]);

  // Get the calculated amount for comparison
  const getCalculatedAmount = useCallback(() => {
    if (
      !transaction?.from_currency_rates_snapshot ||
      !transaction?.to_currency_rates_snapshot
    ) {
      return null;
    }

    const usdAmount =
      transaction.original_amount /
      transaction.from_currency_rates_snapshot.buy_rate_to_usd;
    const calculatedAmount =
      usdAmount * transaction.to_currency_rates_snapshot.sell_rate_to_usd;

    return calculatedAmount;
  }, [transaction]);

  // Copy transaction data to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة');
  };

  // Copy transaction as JSON
  const copyAsJson = () => {
    if (transaction) {
      const jsonData = JSON.stringify(transaction, null, 2);
      copyToClipboard(jsonData);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'bg-white',
        body: 'p-0',
        header: 'border-b border-gray-200 px-6 py-4',
        footer: 'border-t border-gray-200 px-6 py-4',
      }}
    >
      <ModalContent dir="rtl">
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <FiEye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  تفاصيل المعاملة #{transactionId}
                </h2>
                <p className="text-sm text-gray-600">
                  عرض تفاصيل المعاملة والأرباح
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyAsJson}
                startContent={<FiCopy className="w-4 h-4" />}
              >
                نسخ JSON
              </Button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
              <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-2">{error}</div>
              <Button
                color="primary"
                variant="ghost"
                onClick={fetchTransactionDetails}
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    معاملة #{transaction.id}
                  </h3>
                  {getTransactionStatusChip(transaction.status)}
                  {isManuallyAdjusted() && (
                    <Chip color="warning" size="sm" variant="flat">
                      تم تعديلها يدوياً
                    </Chip>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {formatDateTime(transaction.created_at).date} -{' '}
                      {formatDateTime(transaction.created_at).time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Adjustment Notice */}
              {isManuallyAdjusted() && (
                <Card>
                  <CardBody className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-start gap-3">
                      <FiInfo className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-orange-900 mb-1">
                          تم تعديل المبلغ المحول يدوياً
                        </div>
                        <div className="text-xs text-orange-700">
                          المبلغ المحسوب تلقائياً:{' '}
                          {formatAmount(
                            getCalculatedAmount() || 0,
                            transaction.to_currency,
                          )}
                        </div>
                        <div className="text-xs text-orange-700">
                          المبلغ المحول الفعلي:{' '}
                          {formatAmount(
                            transaction.converted_amount,
                            transaction.to_currency,
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Transaction Flow */}
              <Card>
                <CardBody className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiArrowRight className="w-4 h-4" />
                    تدفق المعاملة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">من</div>
                        <div className="font-medium text-gray-900">
                          {transaction.from_currency?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.from_currency?.code}
                        </div>
                        <div className="text-lg font-bold text-red-600 mt-2">
                          {formatAmount(
                            transaction.original_amount,
                            transaction.from_currency,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <FiArrowRight className="w-8 h-8 text-gray-400 mx-auto" />
                    </div>
                    <div className="text-center">
                      <div
                        className={`p-4 rounded-lg ${isManuallyAdjusted() ? 'bg-orange-50 border border-orange-200' : 'bg-green-50'}`}
                      >
                        <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
                          <span>إلى</span>
                          {isManuallyAdjusted() && (
                            <FiEdit3 className="w-3 h-3 text-orange-600" />
                          )}
                        </div>
                        <div className="font-medium text-gray-900">
                          {transaction.to_currency?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.to_currency?.code}
                        </div>
                        <div
                          className={`text-lg font-bold mt-2 ${isManuallyAdjusted() ? 'text-orange-600' : 'text-green-600'}`}
                        >
                          {formatAmount(
                            transaction.converted_amount,
                            transaction.to_currency,
                          )}
                        </div>
                        {isManuallyAdjusted() && (
                          <div className="text-xs text-orange-600 mt-1">
                            معدل يدوياً
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Profit Details */}
              {(transaction.profit_from_usd ||
                transaction.profit_to_usd ||
                transaction.total_profit_usd) && (
                <Card>
                  <CardBody className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiTrendingUp className="w-4 h-4" />
                      تفاصيل الأرباح
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          الربح من العملة المستلمة
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${formatUsdAmount(transaction.profit_from_usd)}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          الربح من العملة المباعة
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          ${formatUsdAmount(transaction.profit_to_usd)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          إجمالي الربح
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ${formatUsdAmount(transaction.total_profit_usd)}
                        </div>
                      </div>
                      {transaction.usd_intermediate && (
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            المبلغ الوسيط بالدولار
                          </div>
                          <div className="text-lg font-bold text-gray-600">
                            ${formatUsdAmount(transaction.usd_intermediate)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Exchange Rates Snapshot */}
              {(transaction.from_currency_rates_snapshot ||
                transaction.to_currency_rates_snapshot) && (
                <Card>
                  <CardBody className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      أسعار الصرف وقت المعاملة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {transaction.from_currency_rates_snapshot && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">
                            {transaction.from_currency?.name} (
                            {transaction.from_currency?.code})
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                سعر الصرف الأساسي:
                              </span>
                              <span className="font-medium">
                                {
                                  transaction.from_currency_rates_snapshot
                                    .rate_to_usd
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">سعر الشراء:</span>
                              <span className="font-medium">
                                {
                                  transaction.from_currency_rates_snapshot
                                    .buy_rate_to_usd
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">سعر البيع:</span>
                              <span className="font-medium">
                                {
                                  transaction.from_currency_rates_snapshot
                                    .sell_rate_to_usd
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {transaction.to_currency_rates_snapshot && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">
                            {transaction.to_currency?.name} (
                            {transaction.to_currency?.code})
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                سعر الصرف الأساسي:
                              </span>
                              <span className="font-medium">
                                {
                                  transaction.to_currency_rates_snapshot
                                    .rate_to_usd
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">سعر الشراء:</span>
                              <span className="font-medium">
                                {
                                  transaction.to_currency_rates_snapshot
                                    .buy_rate_to_usd
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">سعر البيع:</span>
                              <span className="font-medium">
                                {
                                  transaction.to_currency_rates_snapshot
                                    .sell_rate_to_usd
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Transaction Details */}
              <Card>
                <CardBody className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    تفاصيل المعاملة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          منشئ المعاملة
                        </div>
                        <div className="font-medium text-gray-900">
                          {transaction.created_by?.name || 'غير متاح'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.created_by?.email || 'غير متاح'}
                        </div>
                      </div>
                      {transaction.assigned_to && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            مُعين إلى
                          </div>
                          <div className="font-medium text-gray-900">
                            {transaction.assigned_to.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.assigned_to.email}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          تاريخ الإنشاء
                        </div>
                        <div className="font-medium text-gray-900">
                          {formatDateTime(transaction.created_at).date}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(transaction.created_at).time}
                        </div>
                      </div>
                      {transaction.closed_by && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            أُغلقت بواسطة
                          </div>
                          <div className="font-medium text-gray-900">
                            {transaction.closed_by.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.closed_by.email}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            إغلاق
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
