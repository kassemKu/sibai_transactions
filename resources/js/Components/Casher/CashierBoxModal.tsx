import React, { useEffect, useState, useRef } from 'react';
import DialogModal from '@/Components/DialogModal';
import NumberInput from '@/Components/NumberInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Currency, CasherCashSession } from '@/types';
import { FiUser, FiDollarSign } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface CashierBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashierSession: CasherCashSession | null;
  currencies: Currency[];
  fetchBalancesApi: (casherCashSessionId: number) => Promise<any[]>;
  stage?: 'view' | 'pending' | 'closing';
  onSubmitClose?: (
    actualClosingBalances: { currency_id: number; amount: number }[],
  ) => Promise<void>;
  onConfirmPending?: () => Promise<void>;
  isSubmitting?: boolean;
  isPendingSubmitting?: boolean;
}

// Add USD conversion utility
const convertToUSD = (amount: number, currency: any) => {
  const rate = parseFloat(currency?.rate_to_usd?.toString() || '1');
  if (rate === 0 || !rate) return 0;
  if (currency.code === 'USD') return amount;
  return amount / rate;
};

const formatDisplayAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
};

const CashierBoxModal: React.FC<CashierBoxModalProps> = ({
  isOpen,
  onClose,
  cashierSession,
  currencies,
  fetchBalancesApi,
  stage: initialStage = 'view',
  onSubmitClose,
  onConfirmPending,
  isSubmitting = false,
  isPendingSubmitting = false,
}) => {
  const [modalStage, setModalStage] = useState<'view' | 'pending' | 'closing'>(
    initialStage,
  );
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actualAmounts, setActualAmounts] = useState<Record<number, string>>(
    {},
  );

  // Cache for balances to prevent repeated fetches
  const balancesCache = useRef<Record<number, any[]>>({});
  const lastFetchedSessionId = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && cashierSession) {
      const sessionId = cashierSession.id;

      // Only fetch if:
      // 1. Modal just opened (isOpen changed from false to true)
      // 2. Cashier session changed (different session ID)
      // 3. No cached data for this session
      const shouldFetch =
        !balancesCache.current[sessionId] ||
        lastFetchedSessionId.current !== sessionId;

      if (shouldFetch) {
        setModalStage(initialStage);
        setBalances([]);
        setActualAmounts({});
        setLoading(true);

        fetchBalancesApi(sessionId)
          .then(balancesData => {
            // Cache the result
            balancesCache.current[sessionId] = balancesData;
            lastFetchedSessionId.current = sessionId;

            setBalances(balancesData);
            // Initialize actual amounts for closing stage
            const initialAmounts: Record<number, string> = {};
            balancesData.forEach((balance: any) => {
              initialAmounts[balance.currency_id] =
                balance.system_balance?.toString() || '0';
            });
            setActualAmounts(initialAmounts);
          })
          .catch(error => {
            console.error('Error fetching cashier box balances:', error);
            toast.error('حدث خطأ أثناء تحميل بيانات الصندوق');
          })
          .finally(() => setLoading(false));
      } else {
        // Use cached data
        const cachedBalances = balancesCache.current[sessionId];
        setBalances(cachedBalances);
        setModalStage(initialStage);

        // Initialize actual amounts for closing stage
        const initialAmounts: Record<number, string> = {};
        cachedBalances.forEach((balance: any) => {
          initialAmounts[balance.currency_id] =
            balance.system_balance?.toString() || '0';
        });
        setActualAmounts(initialAmounts);
      }
    }
  }, [isOpen, cashierSession?.id, initialStage]); // Removed fetchBalancesApi from dependencies

  // Clear cache when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Optionally clear cache after some time to free memory
      // For now, we'll keep the cache for better UX
    }
  }, [isOpen]);

  // Format amount with currency
  const formatAmount = (
    amount: string | number,
    currency: Currency | null | undefined,
  ) => {
    try {
      if (!currency || amount === undefined || amount === null) {
        return '0.00';
      }
      const numAmount = parseFloat(amount.toString());
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

  const handleActualAmountChange = (currencyId: number, value: string) => {
    setActualAmounts(prev => ({ ...prev, [currencyId]: value }));
  };

  const handleSubmit = async () => {
    if (!onSubmitClose) return;
    const actualClosingBalances = balances.map(balance => ({
      currency_id: balance.currency_id,
      amount: parseFloat(actualAmounts[balance.currency_id] || '0'),
    }));
    await onSubmitClose(actualClosingBalances);
  };

  return (
    <DialogModal isOpen={isOpen} onClose={onClose} maxWidth="6xl">
      <DialogModal.Content
        title={`صندوق الصراف - ${cashierSession?.casher.name || ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
          </div>
        ) : !cashierSession ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا يوجد صراف محدد
              </h3>
              <p className="text-gray-600">
                يرجى تحديد صراف لعرض تفاصيل الصندوق
              </p>
            </div>
          </div>
        ) : (
          cashierSession && (
            <div className="space-y-6" dir="rtl">
              {modalStage === 'view' && (
                <>
                  <div className="text-sm text-gray-600 mb-4 text-right">
                    ملخص الأرصدة النهائية
                  </div>
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="جدول أرصدة الصندوق"
                      className="min-w-full"
                    >
                      <TableHeader>
                        <TableColumn>العملة</TableColumn>
                        <TableColumn>الرصيد الافتتاحي</TableColumn>
                        <TableColumn>إجمالي الداخل</TableColumn>
                        <TableColumn>إجمالي الخارج</TableColumn>
                        <TableColumn>الرصيد النظامي</TableColumn>
                        <TableColumn>القيمة بالدولار</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {balances.map((balance: any) => {
                          const difference =
                            parseFloat(
                              actualAmounts[balance.currency_id] || '0',
                            ) - balance.system_balance;
                          const currency = currencies.find(
                            c => c.code === balance.code,
                          );
                          return (
                            <TableRow key={balance.currency_id}>
                              <TableCell>
                                <div className="text-sm font-medium text-gray-900">
                                  {balance.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {balance.code}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900">
                                  {formatAmount(
                                    balance.opening_balance,
                                    currency,
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-green-600">
                                  {formatAmount(balance.total_in, currency)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-red">
                                  {formatAmount(balance.total_out, currency)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-blue-600">
                                  {formatAmount(
                                    balance.system_balance,
                                    currency,
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  {formatAmount(
                                    balance.system_balance *
                                      (currency?.rate_to_usd || 1),
                                    { code: 'USD', rate_to_usd: 1 },
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}

              {modalStage === 'pending' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiDollarSign className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      تأكيد إغلاق صندوق الصراف
                    </h3>
                    <p className="text-gray-600 mb-6">
                      يرجى مراجعة الأرصدة النهائية قبل تأكيد إغلاق صندوق الصراف{' '}
                      <span className="font-medium">
                        {cashierSession?.casher.name}
                      </span>
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="جدول أرصدة الصندوق"
                      className="min-w-full"
                    >
                      <TableHeader>
                        <TableColumn>العملة</TableColumn>
                        <TableColumn>الرصيد الافتتاحي</TableColumn>
                        <TableColumn>إجمالي الداخل</TableColumn>
                        <TableColumn>إجمالي الخارج</TableColumn>
                        <TableColumn>الرصيد النظامي</TableColumn>
                        <TableColumn>القيمة بالدولار</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {balances.map((balance: any) => {
                          const currency = currencies.find(
                            c => c.code === balance.code,
                          );
                          const usdValue = convertToUSD(
                            balance.system_balance,
                            currency,
                          );
                          return (
                            <TableRow key={balance.currency_id}>
                              <TableCell>
                                <div className="text-sm font-medium text-gray-900">
                                  {balance.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {balance.code}
                                </div>
                                {currency &&
                                  currency.code !== 'USD' &&
                                  currency.rate_to_usd && (
                                    <div className="text-xs text-gray-400">
                                      1 USD ={' '}
                                      {formatDisplayAmount(
                                        parseFloat(
                                          currency.rate_to_usd.toString(),
                                        ),
                                      )}{' '}
                                      {currency.code}
                                    </div>
                                  )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900">
                                  {formatAmount(
                                    balance.opening_balance,
                                    currency,
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-green-600">
                                  {formatAmount(balance.total_in, currency)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-red-600">
                                  {formatAmount(balance.total_out, currency)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-blue-600">
                                  {formatAmount(
                                    balance.system_balance,
                                    currency,
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600">
                                  ${formatDisplayAmount(usdValue)}
                                </div>
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
                      ملخص الأرصدة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 text-sm">
                      <div className="text-right">
                        <span className="text-gray-600 block mb-1">
                          إجمالي الرصيد المحسوب (بالدولار):
                        </span>
                        <div className="font-medium text-gray-900 text-lg">
                          $
                          {formatDisplayAmount(
                            balances.reduce((total, balance) => {
                              const currency = currencies.find(
                                c => c.id === balance.currency_id,
                              );
                              return (
                                total +
                                convertToUSD(balance.system_balance, currency)
                              );
                            }, 0),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">ملاحظة مهمة:</p>
                        <p>
                          بعد التأكيد، سيتم تحويل الصندوق إلى وضع الإغلاق
                          وستحتاج إلى إدخال المبالغ الفعلية المعدودة لكل عملة.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalStage === 'closing' && (
                <>
                  <div className="text-sm text-gray-600 mb-4 text-right">
                    يرجى إدخال المبالغ الفعلية المعدودة لكل عملة
                  </div>
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="جدول أرصدة الصندوق"
                      className="min-w-full"
                    >
                      <TableHeader>
                        <TableColumn>العملة</TableColumn>
                        <TableColumn>الرصيد المحسوب</TableColumn>
                        <TableColumn>الرصيد الفعلي</TableColumn>
                        <TableColumn>الفرق</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {balances.map((balance: any) => {
                          const difference =
                            parseFloat(
                              actualAmounts[balance.currency_id] || '0',
                            ) - balance.system_balance;
                          const currency = currencies.find(
                            c => c.code === balance.code,
                          );
                          return (
                            <TableRow key={balance.currency_id}>
                              <TableCell>
                                <div className="text-sm font-medium text-gray-900">
                                  {balance.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {balance.code}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900">
                                  {formatAmount(
                                    balance.system_balance,
                                    currency,
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <NumberInput
                                  value={
                                    actualAmounts[balance.currency_id] || ''
                                  }
                                  onValueChange={values =>
                                    handleActualAmountChange(
                                      balance.currency_id,
                                      values.value,
                                    )
                                  }
                                  className="w-32 text-right"
                                  decimalScale={2}
                                  min={0}
                                  thousandSeparator={true}
                                  dir="rtl"
                                  aria-label={`الرصيد الفعلي لعملة ${balance.name}`}
                                />
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`text-sm font-medium ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red' : 'text-gray-900'}`}
                                >
                                  {difference > 0 ? '+' : ''}
                                  {formatAmount(
                                    Math.abs(difference).toString(),
                                    currency,
                                  )}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h4 className="font-medium text-gray-900 text-right text-lg">
                      ملخص الإغلاق
                    </h4>
                    <div className="text-sm text-gray-600 text-right">
                      تأكد من صحة المبالغ الفعلية المدخلة
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </DialogModal.Content>
      <DialogModal.Footer>
        <div className="flex justify-end space-x-3 space-x-reverse">
          {modalStage === 'pending' && onConfirmPending && (
            <PrimaryButton
              onClick={onConfirmPending}
              disabled={isPendingSubmitting}
            >
              {isPendingSubmitting
                ? 'جاري التحويل...'
                : 'تأكيد التحويل للإغلاق'}
            </PrimaryButton>
          )}
          {modalStage === 'closing' && (
            <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإغلاق...' : 'تأكيد الإغلاق'}
            </PrimaryButton>
          )}
          <SecondaryButton
            onClick={onClose}
            disabled={isSubmitting || isPendingSubmitting}
          >
            {isSubmitting || isPendingSubmitting ? 'جاري المعالجة...' : 'إغلاق'}
          </SecondaryButton>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
};

export default CashierBoxModal;
