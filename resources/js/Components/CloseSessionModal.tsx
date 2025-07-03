import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

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

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CloseSessionModal({
  isOpen,
  onClose,
  onSuccess,
}: CloseSessionModalProps) {
  const [balances, setBalances] = useState<CurrencyBalance[]>([]);
  const [actualAmounts, setActualAmounts] = useState<Record<number, string>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch closing balances when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchClosingBalances();
    }
  }, [isOpen]);

  const fetchClosingBalances = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/cash-sessions/closing-balances');
      if (response.data.success) {
        setBalances(response.data.balances);
        // Initialize actual amounts with system balances
        const initialAmounts: Record<number, string> = {};
        response.data.balances.forEach((balance: CurrencyBalance) => {
          initialAmounts[balance.currency_id] =
            balance.system_closing_balance.toString();
        });
        setActualAmounts(initialAmounts);
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

  const calculateDifference = (currencyId: number, systemAmount: number) => {
    const actualAmount = parseFloat(actualAmounts[currencyId] || '0');
    return actualAmount - systemAmount;
  };

  const getTotalSystemBalance = () => {
    return balances.reduce(
      (total, balance) => total + balance.system_closing_balance,
      0,
    );
  };

  const getTotalActualBalance = () => {
    return balances.reduce((total, balance) => {
      const actual = parseFloat(actualAmounts[balance.currency_id] || '0');
      return total + actual;
    }, 0);
  };

  const getTotalDifference = () => {
    return getTotalActualBalance() - getTotalSystemBalance();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const actualClosingBalances = balances.map(balance => ({
        currency_id: balance.currency_id,
        amount: parseFloat(actualAmounts[balance.currency_id] || '0'),
      }));

      const response = await axios.post('/cash-sessions/close', {
        actual_closing_balances: actualClosingBalances,
      });

      if (response.data.success) {
        toast.success('تم إغلاق الجلسة النقدية بنجاح');
        onSuccess();
        onClose();
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
    if (!isSubmitting) {
      setBalances([]);
      setActualAmounts({});
      onClose();
    }
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
              يرجى مراجعة الأرصدة النهائية لكل عملة وإدخال المبالغ الفعلية
              المعدودة
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" dir="rtl">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العملة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الرصيد المحسوب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الرصيد الفعلي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفرق
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {balances.map(balance => {
                    const difference = calculateDifference(
                      balance.currency_id,
                      balance.system_closing_balance,
                    );
                    return (
                      <tr key={balance.currency_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {balance.currency.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {balance.currency.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">
                            {balance.system_closing_balance.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <TextInput
                            type="number"
                            value={actualAmounts[balance.currency_id] || ''}
                            onChange={e =>
                              handleActualAmountChange(
                                balance.currency_id,
                                e.target.value,
                              )
                            }
                            className="w-32 text-right"
                            step="0.01"
                            min="0"
                            dir="rtl"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`text-sm font-medium ${
                              difference > 0
                                ? 'text-green-600'
                                : difference < 0
                                  ? 'text-red-600'
                                  : 'text-gray-900'
                            }`}
                          >
                            {difference > 0 ? '+' : ''}
                            {difference.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-gray-900 text-right text-lg">
                ملخص الإغلاق
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-right">
                  <span className="text-gray-600 block mb-1">
                    إجمالي الرصيد المحسوب:
                  </span>
                  <div className="font-medium text-gray-900 text-lg">
                    {getTotalSystemBalance().toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 block mb-1">
                    إجمالي الرصيد الفعلي:
                  </span>
                  <div className="font-medium text-gray-900 text-lg">
                    {getTotalActualBalance().toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 block mb-1">
                    إجمالي الفرق:
                  </span>
                  <div
                    className={`font-medium text-lg ${
                      getTotalDifference() > 0
                        ? 'text-green-600'
                        : getTotalDifference() < 0
                          ? 'text-red-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {getTotalDifference() > 0 ? '+' : ''}
                    {getTotalDifference().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogModal.Content>

      <DialogModal.Footer>
        <div className="flex justify-end space-x-3 space-x-reverse">
          <SecondaryButton onClick={handleClose} disabled={isSubmitting}>
            إلغاء
          </SecondaryButton>

          <PrimaryButton
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? 'جاري الإغلاق...' : 'تأكيد الإغلاق'}
          </PrimaryButton>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
}
