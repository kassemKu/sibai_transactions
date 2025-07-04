import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/Components/UI/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';
import { CurrenciesResponse } from '@/types';

interface TransactionFormProps {
  currencies: CurrenciesResponse;
  isSessionOpen?: boolean;
  onStartSession?: () => void;
}

export default function TransactionForm({
  currencies,
  isSessionOpen = true,
  onStartSession,
}: TransactionFormProps) {
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate currency conversion
  const calculateCurrency = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setCalculatedAmount('');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await axios.get('/transactions/calc', {
        params: {
          from_currency_id: fromCurrency,
          to_currency_id: toCurrency,
          original_amount: amount,
        },
      });

      setCalculatedAmount(response.data.calculated_amount || '0');
    } catch (error) {
      console.error('Error calculating currency:', error);
      setCalculatedAmount('خطأ في الحساب');
      if (axios.isAxiosError(error)) {
        toast.error('فشل في حساب التحويل - تحقق من الاتصال بالإنترنت');
      } else {
        toast.error('حدث خطأ أثناء حساب التحويل');
      }
    } finally {
      setIsCalculating(false);
    }
  }, [fromCurrency, toCurrency, amount]);

  // Debounced calculation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateCurrency();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [calculateCurrency]);

  // Reset form
  const resetForm = useCallback((showToast = false) => {
    setFromCurrency('');
    setToCurrency('');
    setAmount('');
    setCalculatedAmount('');
    if (showToast) {
      toast.success('تم إعادة تعيين النموذج');
    }
  }, []);

  // Handle transaction execution
  const handleExecuteTransaction = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || !calculatedAmount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!isSessionOpen) {
      toast.error('يجب فتح جلسة نقدية أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/admin/transactions', {
        from_currency_id: parseInt(fromCurrency),
        to_currency_id: parseInt(toCurrency),
        original_amount: parseFloat(amount),
        customer_name: '', // You can add a customer name field later
      });

      if (response.data) {
        toast.success('تم تنفيذ العملية بنجاح');
        resetForm(false);
      }
    } catch (error) {
      console.error('Error executing transaction:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('حدث خطأ أثناء تنفيذ العملية');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    fromCurrency,
    toCurrency,
    amount,
    calculatedAmount,
    isSessionOpen,
    resetForm,
  ]);

  return (
    <div className="w-full mb-8 relative">
      <Card>
        <CardContent className="p-2">
          <div
            className={`flex flex-col gap-6 ${!isSessionOpen ? 'blur-sm opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-2">
              <div className="text-bold-x18 text-text-black">عملية جديدة</div>
              <div className="text-med-x14 text-text-grey-light">
                إنشاء عملية تحويل جديدة
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">من</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="from_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="from_currency"
                      aria-label="اختر العملة المصدر"
                      placeholder="اختر العملة"
                      value={fromCurrency}
                      onChange={e => setFromCurrency(e.target.value)}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <InputLabel htmlFor="from_amount" className="mb-2">
                      المبلغ
                    </InputLabel>
                    <TextInput
                      id="from_amount"
                      type="number"
                      placeholder="أدخل المبلغ"
                      className="w-full"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">إلى</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="to_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="to_currency"
                      aria-label="اختر العملة الهدف"
                      placeholder="اختر العملة"
                      value={toCurrency}
                      onChange={e => setToCurrency(e.target.value)}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <InputLabel htmlFor="to_amount" className="mb-2">
                      المبلغ المحسوب
                    </InputLabel>
                    <div className="relative">
                      <TextInput
                        id="to_amount"
                        type="text"
                        placeholder={
                          isCalculating
                            ? 'جاري الحساب...'
                            : 'سيتم الحساب تلقائياً'
                        }
                        className="w-full bg-gray-50"
                        value={
                          isCalculating ? 'جاري الحساب...' : calculatedAmount
                        }
                        readOnly
                      />
                      {isCalculating && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
              <div className="text-med-x14 flex flex-col items-start gap-2">
                <span className="text-[#6B7280] text-med-x14">
                  يتم تسليم العميل مبلغ
                </span>
                <span className="text-bold-x20 text-[#10B981] font-bold">
                  {calculatedAmount
                    ? `${calculatedAmount} ${currencies.find(c => c.id.toString() === toCurrency)?.code || ''}`
                    : '0.00'}
                </span>
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => resetForm(true)}>
                  اعاده التعيين
                </SecondaryButton>
                <PrimaryButton
                  disabled={!calculatedAmount || isCalculating || isSubmitting}
                  onClick={handleExecuteTransaction}
                >
                  {isSubmitting ? 'جاري التنفيذ...' : 'تنفيذ العملية'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overlay when session is closed */}
      {!isSessionOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-xl shadow-lg p-6 mx-4 max-w-md text-center border border-gray-200">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              الجلسة النقدية مغلقة
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              يجب فتح جلسة نقدية جديدة قبل تنفيذ أي عمليات تحويل
            </p>
            {onStartSession ? (
              <button
                onClick={onStartSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                بدء جلسة جديدة
              </button>
            ) : (
              <div className="text-xs text-gray-500">
                اضغط على "بدء جلسة جديدة" في أعلى الصفحة للمتابعة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
