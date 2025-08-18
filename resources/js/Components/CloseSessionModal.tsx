import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import NumberInput from '@/Components/NumberInput';
import InputLabel from '@/Components/InputLabel';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface CurrencyBalance {
  currency_id: number;
  currency: {
    id: number;
    name: string;
    code: string;
    rate_to_usd?: string | number;
  };
  opening_balance: number;
  total_in: number;
  total_out: number;
  system_closing_balance: number;
}

interface LastSessionCashBalance {
  id: number;
  cash_session_id: number;
  currency_id: number;
  actual_closing_balance: string;
  currency: {
    id: number;
    code: string;
    name: string;
  };
}

interface LastSession {
  id: number;
  opened_at: string;
  closed_at: string;
  open_exchange_rates: string;
  close_exchange_rates: string;
  status: string;
  opened_by: number;
  closed_by: number;
  created_at: string;
  updated_at: string;
  cash_balances: LastSessionCashBalance[];
}

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSessionPending?: boolean; // New prop to indicate if session is already pending
  onSessionPending?: () => void; // Callback when session becomes pending
}

export default function CloseSessionModal({
  isOpen,
  onClose,
  onSuccess,
  isSessionPending = false,
  onSessionPending,
}: CloseSessionModalProps) {
  const [balances, setBalances] = useState<CurrencyBalance[]>([]);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [actualAmounts, setActualAmounts] = useState<Record<number, string>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActualInputs, setShowActualInputs] = useState(false);

  // Track if we've already fetched balances to prevent unnecessary re-fetching
  const hasFetchedBalances = useRef(false);
  const previousSessionPending = useRef(isSessionPending);

  // Fetch closing balances when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset the tracking flag when modal opens
      hasFetchedBalances.current = false;
      previousSessionPending.current = isSessionPending;

      fetchClosingBalances();
      // If session is already pending, skip preview and go directly to actual inputs
      if (isSessionPending) {
        setShowActualInputs(true);
      }
    } else {
      // Clean up state when modal closes
      setBalances([]);
      setLastSession(null);
      setActualAmounts({});
      setIsLoading(false);
      setIsSubmitting(false);
      setShowActualInputs(false);
      hasFetchedBalances.current = false;
      previousSessionPending.current = false;
    }
  }, [isOpen]); // Remove isSessionPending from dependencies to prevent double loading

  // Handle session status change from active to pending (without re-fetching)
  useEffect(() => {
    if (
      isOpen &&
      isSessionPending &&
      !previousSessionPending.current &&
      hasFetchedBalances.current
    ) {
      // Session just became pending, show actual inputs without re-fetching
      setShowActualInputs(true);
      previousSessionPending.current = true;
    }
  }, [isSessionPending, isOpen]);

  const fetchClosingBalances = async () => {
    // Prevent multiple simultaneous fetches
    if (hasFetchedBalances.current && balances.length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('/admin/get-session-closing-balances');
      if (response.data.status || response.data.success) {
        const balancesData =
          response.data.data?.balances || response.data.balances || [];
        const lastSessionData = response.data.data?.last_session || null;

        setBalances(balancesData);
        setLastSession(lastSessionData);

        // Initialize actual amounts with system balances
        const initialAmounts: Record<number, string> = {};
        balancesData.forEach((balance: CurrencyBalance) => {
          initialAmounts[balance.currency_id] =
            balance.system_closing_balance.toString();
        });
        setActualAmounts(initialAmounts);
        hasFetchedBalances.current = true;
      }
    } catch (error) {
      console.error('Error fetching closing balances:', error);
      toast.error('فشل في جلب أرصدة الإغلاق');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualAmountChange = (currencyId: number, value: string) => {
    setActualAmounts(prev => ({
      ...prev,
      [currencyId]: value,
    }));
  };

  // Convert amount to USD using exchange rate
  const convertToUSD = (
    amount: number,
    currency: CurrencyBalance['currency'],
  ) => {
    const rate = parseFloat(currency.rate_to_usd?.toString() || '1');
    if (rate === 0 || !rate) return 0;

    // If currency is already USD, return amount as is
    if (currency.code === 'USD') return amount;

    // Convert to USD: amount / rate_to_usd
    return amount / rate;
  };

  const calculateDifference = (currencyId: number, systemAmount: number) => {
    if (!showActualInputs) return 0;
    const actualAmount = parseFloat(actualAmounts[currencyId] || '0');
    return actualAmount - systemAmount;
  };

  const getTotalSystemBalance = () => {
    return balances.reduce((total, balance) => {
      const usdAmount = convertToUSD(
        balance.system_closing_balance,
        balance.currency,
      );
      return total + usdAmount;
    }, 0);
  };

  const getTotalActualBalance = () => {
    if (!showActualInputs) return getTotalSystemBalance();

    return balances.reduce((total, balance) => {
      const actual = parseFloat(actualAmounts[balance.currency_id] || '0');
      const usdAmount = convertToUSD(actual, balance.currency);
      return total + usdAmount;
    }, 0);
  };

  const getTotalDifference = () => {
    if (!showActualInputs) return 0;
    return getTotalActualBalance() - getTotalSystemBalance();
  };

  // Helper function to format amount for display
  const formatDisplayAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  // Helper function to get opening balance from last session
  const getOpeningBalance = (currencyId: number): number => {
    if (!lastSession?.cash_balances) return 0;

    const lastSessionBalance = lastSession.cash_balances.find(
      balance => balance.currency_id === currencyId,
    );

    return lastSessionBalance
      ? parseFloat(lastSessionBalance.actual_closing_balance)
      : 0;
  };

  const handleContinueToClose = async () => {
    // Prevent multiple clicks during loading
    if (isLoading || isSubmitting) {
      return;
    }

    // If session is already pending, just show the actual inputs
    if (isSessionPending) {
      setShowActualInputs(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/admin/cash-sessions/pending');
      if (response.data.status || response.data.success) {
        setShowActualInputs(true);
        toast.success('تم تحويل الجلسة إلى وضع الإغلاق');
        // Notify parent component about session status change
        if (onSessionPending) {
          onSessionPending();
        }
      }
    } catch (error) {
      console.error('Error setting session to pending:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء تحضير الجلسة للإغلاق');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Prevent submission if not ready or already submitting
    if (!showActualInputs || isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      const actualClosingBalances = balances.map(balance => ({
        currency_id: balance.currency_id,
        amount: parseFloat(actualAmounts[balance.currency_id] || '0'),
      }));

      const response = await axios.post('/admin/cash-sessions/close', {
        actual_closing_balances: actualClosingBalances,
      });

      if (response.data.status || response.data.success) {
        toast.success('تم إغلاق الجلسة النقدية بنجاح');

        // Clear assignment rules from localStorage when session is closed
        localStorage.setItem('transactionAssignmentRules', JSON.stringify([]));
        console.log(
          '[Session Close] Assignment rules cleared from localStorage',
        );
        toast.success('تم مسح قواعد التعيين التلقائي مع إغلاق الجلسة');

        // Clean up modal state first
        setBalances([]);
        setActualAmounts({});

        // Close modal immediately
        onClose();

        // Then trigger success callback
        onSuccess();
      }
    } catch (error) {
      console.error('Error closing cash session:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('حدث خطأ أثناء إغلاق الجلسة');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Prevent closing during critical operations
    if (isSubmitting) {
      return;
    }

    // Reset all state
    setBalances([]);
    setActualAmounts({});
    setIsLoading(false);
    setIsSubmitting(false);
    setShowActualInputs(false);
    hasFetchedBalances.current = false;
    previousSessionPending.current = false;
    onClose();
  };

  return (
    <DialogModal isOpen={isOpen} onClose={handleClose} maxWidth="6xl">
      <DialogModal.Content title="إغلاق الجلسة النقدية">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
          </div>
        ) : (
          <div className="space-y-6" dir="rtl">
            <div className="text-sm text-gray-600 mb-4 text-right">
              {!showActualInputs
                ? isSessionPending
                  ? 'الجلسة في وضع الإغلاق - مراجعة الأرصدة النهائية لكل عملة'
                  : 'مراجعة الأرصدة النهائية لكل عملة قبل الإغلاق'
                : 'يرجى إدخال المبالغ الفعلية المعدودة لكل عملة'}
            </div>

            <div className="overflow-x-auto">
              <Table aria-label="جدول أرصدة الإغلاق" className="min-w-full">
                <TableHeader>
                  <TableColumn>العملة</TableColumn>
                  <TableColumn>الرصيد الافتتاحي</TableColumn>
                  <TableColumn>الرصيد المحسوب</TableColumn>
                  <TableColumn>الفرق (محسوب - افتتاحي)</TableColumn>
                  <TableColumn>القيمة بالدولار</TableColumn>
                  <TableColumn className={showActualInputs ? '' : 'hidden'}>
                    الرصيد الفعلي
                  </TableColumn>
                  <TableColumn className={showActualInputs ? '' : 'hidden'}>
                    الفرق (فعلي - محسوب)
                  </TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={
                    !balances || balances.length === 0
                      ? 'لا توجد أرصدة متاحة'
                      : undefined
                  }
                >
                  {(balances || []).map(balance => {
                    const difference = calculateDifference(
                      balance.currency_id,
                      balance.system_closing_balance,
                    );
                    const usdValue = convertToUSD(
                      balance.system_closing_balance,
                      balance.currency,
                    );

                    return (
                      <TableRow key={balance.currency_id}>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">
                            {balance.currency.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {balance.currency.code}
                            {balance.currency.code !== 'USD' &&
                              balance.currency.rate_to_usd && (
                                <div className="text-xs text-gray-400">
                                  1 USD ={' '}
                                  {formatDisplayAmount(
                                    parseFloat(
                                      balance.currency.rate_to_usd.toString(),
                                    ),
                                  )}{' '}
                                  {balance.currency.code}
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {formatDisplayAmount(
                              getOpeningBalance(balance.currency_id),
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {formatDisplayAmount(
                              balance.system_closing_balance,
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {(() => {
                              const openingBalance = getOpeningBalance(
                                balance.currency_id,
                              );
                              const calculatedDiff =
                                balance.system_closing_balance - openingBalance;
                              return (
                                <span
                                  className={`font-medium ${
                                    calculatedDiff > 0
                                      ? 'text-green-600'
                                      : calculatedDiff < 0
                                        ? 'text-red-600'
                                        : 'text-gray-900'
                                  }`}
                                >
                                  {calculatedDiff > 0 ? '+' : ''}
                                  {formatDisplayAmount(calculatedDiff)}
                                </span>
                              );
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            ${formatDisplayAmount(usdValue)}
                          </div>
                        </TableCell>
                        <TableCell className={showActualInputs ? '' : 'hidden'}>
                          <NumberInput
                            value={actualAmounts[balance.currency_id] || ''}
                            onValueChange={value =>
                              handleActualAmountChange(
                                balance.currency_id,
                                value.value,
                              )
                            }
                            placeholder="0.00"
                            min={0}
                            // className="w-full"
                            aria-label={`الرصيد الفعلي لعملة ${balance.currency.name}`}
                          />
                        </TableCell>
                        <TableCell className={showActualInputs ? '' : 'hidden'}>
                          <span
                            className={`text-sm font-medium ${
                              difference > 0
                                ? 'text-green-600'
                                : difference < 0
                                  ? 'text-red'
                                  : 'text-gray-900'
                            }`}
                          >
                            {difference > 0 && '+'}
                            {formatDisplayAmount(difference)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-gray-900 text-right text-lg">
                {!showActualInputs ? 'ملخص الأرصدة' : 'ملخص الإغلاق'}
              </h4>
              <div
                className={`grid grid-cols-1 ${!showActualInputs ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6 text-sm`}
              >
                <div className="text-right">
                  <span className="text-gray-600 block mb-1">
                    إجمالي الرصيد المحسوب (بالدولار):
                  </span>
                  <div className="font-medium text-gray-900 text-lg">
                    ${formatDisplayAmount(getTotalSystemBalance())}
                  </div>
                </div>
                {showActualInputs && (
                  <>
                    <div className="text-right">
                      <span className="text-gray-600 block mb-1">
                        إجمالي الرصيد الفعلي (بالدولار):
                      </span>
                      <div className="font-medium text-gray-900 text-lg">
                        ${formatDisplayAmount(getTotalActualBalance())}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600 block mb-1">
                        إجمالي الفرق (بالدولار):
                      </span>
                      <div
                        className={`font-medium text-lg ${
                          getTotalDifference() > 0
                            ? 'text-green-600'
                            : getTotalDifference() < 0
                              ? 'text-red'
                              : 'text-gray-900'
                        }`}
                      >
                        {getTotalDifference() > 0 ? '+' : ''}$
                        {formatDisplayAmount(Math.abs(getTotalDifference()))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogModal.Content>

      <DialogModal.Footer>
        <div className="flex justify-end space-x-3 space-x-reverse">
          <SecondaryButton
            onClick={handleClose}
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isSubmitting ? 'جاري المعالجة...' : 'إلغاء'}
          </SecondaryButton>

          {!showActualInputs ? (
            <PrimaryButton
              onClick={handleContinueToClose}
              disabled={isLoading || isSubmitting}
            >
              {isLoading
                ? 'جاري التحميل...'
                : isSessionPending
                  ? 'إدخال الأرصدة الفعلية'
                  : 'المتابعة للإغلاق'}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={handleSubmit}
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? 'جاري الإغلاق...' : 'تأكيد الإغلاق'}
            </PrimaryButton>
          )}
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
}
