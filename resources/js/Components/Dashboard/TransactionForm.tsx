import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/Components/UI/Card';
import InputLabel from '@/Components/InputLabel';
import NumberInput from '@/Components/NumberInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';
import { CurrenciesResponse } from '@/types';
import { usePage } from '@inertiajs/react';
import {
  FiEdit3,
  FiCheck,
  FiX,
  FiInfo,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';
import { IoCalculatorSharp } from 'react-icons/io5';
interface User {
  id: number;
  name: string;
  email: string;
}

interface TransactionFormProps {
  currencies: CurrenciesResponse;
  isSessionOpen?: boolean;
  isSessionPending?: boolean;
  onStartSession?: () => void;
}

export default function TransactionForm({
  currencies,
  isSessionOpen = true,
  isSessionPending = false,
  onStartSession,
}: TransactionFormProps) {
  const { auth, roles } = usePage().props as any;
  const isAdmin = roles && (roles as string[]).includes('super_admin');

  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [isManualAmountEnabled, setIsManualAmountEnabled] = useState(false);
  const [assignedTo, setAssignedTo] = useState(
    auth?.user?.id?.toString() || '',
  );
  const [users, setUsers] = useState<User[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Ref to track the last calculation parameters to prevent unnecessary API calls
  const lastCalculationRef = useRef<{
    fromCurrency: string;
    toCurrency: string;
    amount: string;
  } | null>(null);

  // Get the final amount to use (manual if enabled, otherwise calculated)
  const getFinalAmount = useCallback(() => {
    if (isAdmin && isManualAmountEnabled && manualAmount) {
      return manualAmount;
    }
    return calculatedAmount;
  }, [isAdmin, isManualAmountEnabled, manualAmount, calculatedAmount]);

  // Reset form
  const resetForm = useCallback(
    (showToast = false, preserveHandler = true) => {
      setFromCurrency('');
      setToCurrency('');
      setAmount('');
      setCalculatedAmount('');
      setManualAmount('');
      setIsManualAmountEnabled(false);
      
      // Clear the last calculation reference
      lastCalculationRef.current = null;

      // Only reset assignedTo if preserveHandler is false
      if (!preserveHandler) {
        setAssignedTo(auth?.user?.id?.toString() || '');
      }

      if (showToast) {
        toast.success('تم إعادة تعيين النموذج');
      }
    },
    [auth?.user?.id],
  );

  // Fetch users for admin dropdown
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const response = await axios.get('/admin/users');
          setUsers(response.data.data.users || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('فشل في تحميل قائمة المستخدمين');
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdmin]);

  // Set default currency values for admin
  useEffect(() => {
    if (isAdmin && currencies && currencies.length > 0) {
      // Only set defaults if no currencies are currently selected
      if (!fromCurrency && !toCurrency) {
        // Find USD currency for "From" default
        const usdCurrency = currencies.find(c => c.code === 'USD');
        if (usdCurrency) {
          setFromCurrency(usdCurrency.id.toString());
        }

        // Find SYP currency for "To" default
        const sypCurrency = currencies.find(c => c.code === 'SYP');
        if (sypCurrency) {
          setToCurrency(sypCurrency.id.toString());
        }
      }
    }
  }, [isAdmin, currencies, fromCurrency, toCurrency]);

  // Calculate currency conversion
  const calculateCurrency = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setCalculatedAmount('');
      return;
    }

    // Check if we're making the same calculation as before
    const currentParams = { fromCurrency, toCurrency, amount };
    if (
      lastCalculationRef.current &&
      lastCalculationRef.current.fromCurrency === fromCurrency &&
      lastCalculationRef.current.toCurrency === toCurrency &&
      lastCalculationRef.current.amount === amount
    ) {
      return; // Skip duplicate calculation
    }

    lastCalculationRef.current = currentParams;
    setIsCalculating(true);
    try {
      const response = await axios.get('/transactions/calc', {
        params: {
          from_currency_id: fromCurrency,
          to_currency_id: toCurrency,
          original_amount: amount,
        },
      });

      const newCalculatedAmount =
        response.data.data.calculation_result.converted_amount || '0';

      setCalculatedAmount(prevCalculated => {
        // Update manual amount only if conditions are met
        setManualAmount(prevManual => {
          // Only update manual amount if:
          // 1. Manual mode is not enabled, OR
          // 2. Manual amount is empty (first time calculation), OR
          // 3. Manual amount equals the previous calculated amount (not manually edited)
          if (
            !isManualAmountEnabled ||
            !prevManual ||
            prevManual === prevCalculated
          ) {
            return newCalculatedAmount;
          }
          // Keep the existing manual amount if it was manually edited
          return prevManual;
        });

        return newCalculatedAmount;
      });
    } catch (error) {
      console.error('Error calculating currency:', error);
      setCalculatedAmount('خطأ في الحساب');

      // Handle validation errors from backend
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const errors = error.response.data.errors;

        // Check for insufficient balance error specifically
        if (errors.original_amount) {
          const errorMessages = Array.isArray(errors.original_amount)
            ? errors.original_amount
            : [errors.original_amount];
          toast.error(errorMessages[0]);
        } else {
          // Handle other validation errors
          const errorMessages = Object.values(errors).flat();
          toast.error(`خطأ في البيانات: ${errorMessages.join(', ')}`);
        }
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (axios.isAxiosError(error)) {
        toast.error('فشل في حساب التحويل - تحقق من الاتصال بالإنترنت');
      } else {
        toast.error('حدث خطأ أثناء حساب التحويل');
      }
    } finally {
      setIsCalculating(false);
    }
  }, [fromCurrency, toCurrency, amount, isManualAmountEnabled]);

  // Debounced calculation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateCurrency();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [calculateCurrency]);

  // Handle manual amount toggle
  const handleManualAmountToggle = () => {
    if (isManualAmountEnabled) {
      // Disabling manual mode - reset to calculated amount
      setManualAmount(calculatedAmount);
      setIsManualAmountEnabled(false);
      toast.success('تم التبديل إلى الحساب التلقائي');
    } else {
      // Enabling manual mode - preserve current calculated amount as starting point
      if (calculatedAmount && calculatedAmount !== 'خطأ في الحساب') {
        // Always set the manual amount to the calculated amount when enabling manual mode
        // This ensures the input shows the current calculated value
        setManualAmount(calculatedAmount);
        setIsManualAmountEnabled(true);
        toast.success('تم تفعيل التعديل اليدوي - يمكنك الآن تعديل المبلغ');
      } else {
        toast.error('يجب حساب المبلغ أولاً قبل التعديل اليدوي');
      }
    }
  };

  // Handle transaction execution
  const handleExecuteTransaction = useCallback(async () => {
    const finalAmount = getFinalAmount();

    if (!fromCurrency || !toCurrency || !amount || !finalAmount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!isSessionOpen) {
      if (isSessionPending) {
        toast.error('لا يمكن تنفيذ عمليات جديدة أثناء جرد الأرصدة');
      } else {
        toast.error('يجب فتح جلسة نقدية أولاً');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        from_currency_id: parseInt(fromCurrency),
        to_currency_id: parseInt(toCurrency),
        original_amount: parseFloat(amount),
        converted_amount: parseFloat(finalAmount), // Send the final amount (manual or calculated)
        customer_name: '', // You can add a customer name field later
        converted_amount: calculatedAmount, // to be fixed, the collection is wrong number
        ...(isAdmin && assignedTo ? { assigned_to: parseInt(assignedTo) } : {}),
      };

      const response = await axios.post('/admin/transactions', transactionData);

      if (response.data) {
        const selectedUser = users.find(u => u.id.toString() === assignedTo);
        const handlerName = selectedUser
          ? selectedUser.name
          : 'المستخدم المحدد';
        toast.success(
          `تم تنفيذ العملية بنجاح - سيتم الاحتفاظ بـ ${handlerName} للعملية التالية`,
        );
        resetForm(false, true); // Preserve the handler
      }
    } catch (error) {
      console.error('Error executing transaction:', error);

      // Handle validation errors (like insufficient balance)
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const errors = error.response.data.errors;

        // Check for insufficient balance error specifically
        if (
          errors.original_amount &&
          errors.original_amount.includes(
            'Insufficient balance for the transaction.',
          )
        ) {
          const fromCurrencyName =
            currencies.find(c => c.id.toString() === fromCurrency)?.name ||
            'العملة المحددة';
          toast.error(`رصيد ${fromCurrencyName} غير كافي لتنفيذ هذه العملية`);
        } else {
          // Handle other validation errors
          const errorMessages = Object.values(errors).flat();
          toast.error(`خطأ في البيانات: ${errorMessages.join(', ')}`);
        }
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
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
    getFinalAmount,
    assignedTo,
    isAdmin,
    isSessionOpen,
    isSessionPending,
    resetForm,
    currencies,
    users,
  ]);

  // Helper function to format amount for display
  const formatDisplayAmount = (amount: string | number) => {
    if (!amount) return '0.00';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0.00';

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(numAmount);
  };

  return (
    <div className="w-full mb-8 relative">
      <Card>
        <CardContent className="p-2">
          <div
            className={`flex flex-col gap-6 ${!isSessionOpen || isSessionPending ? 'blur-sm opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-2">
              <div className="text-bold-x18 text-text-black">عملية جديدة</div>
              <div className="text-med-x14 text-text-grey-light">
                إنشاء عملية تحويل جديدة
              </div>
            </div>

            {/* Admin User Assignment Section */}
            {isAdmin && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="text-bold-x16 text-blue-900">
                    تعيين المسؤول
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <InputLabel
                        htmlFor="assigned_to"
                        className="mb-2 text-blue-800"
                      >
                        تعيين العملية إلى
                      </InputLabel>
                      <Select
                        id="assigned_to"
                        aria-label="تعيين العملية إلى"
                        value={assignedTo}
                        onChange={e => setAssignedTo(e.target.value)}
                        className="border-blue-300 focus:border-blue-500"
                        disabled={isLoadingUsers}
                      >
                        {isLoadingUsers ? (
                          <option value="">جاري التحميل...</option>
                        ) : (
                          <>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </>
                        )}
                      </Select>
                      {isLoadingUsers && (
                        <div className="text-xs text-blue-600 mt-1">
                          جاري تحميل قائمة المستخدمين...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">من</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InputLabel htmlFor="from_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="from_currency"
                      aria-label="اختر العملة المصدر"
                      placeholder="اختر العملة"
                      value={fromCurrency}
                      onChange={e => setFromCurrency(e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <InputLabel htmlFor="from_amount" className="mb-2">
                      المبلغ
                    </InputLabel>
                    <NumberInput
                      id="from_amount"
                      placeholder="أدخل المبلغ"
                      className="w-full text-right"
                      value={amount}
                      onValueChange={values => setAmount(values.value)}
                      min={0}
                      decimalScale={2}
                      thousandSeparator={true}
                      dir="rtl"
                      aria-label="مبلغ التحويل"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">إلى</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InputLabel htmlFor="to_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="to_currency"
                      aria-label="اختر العملة الهدف"
                      placeholder="اختر العملة"
                      value={toCurrency}
                      onChange={e => setToCurrency(e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <InputLabel htmlFor="to_amount">
                        المبلغ المحسوب
                      </InputLabel>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={handleManualAmountToggle}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            isManualAmountEnabled
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          disabled={isCalculating || !calculatedAmount}
                        >
                          {isManualAmountEnabled ? (
                            <>
                              <FiUnlock className="w-3 h-3" />
                              تعديل يدوي
                            </>
                          ) : (
                            <>
                              <FiLock className="w-3 h-3" />
                              حساب تلقائي
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <NumberInput
                        id="to_amount"
                        placeholder={
                          isCalculating
                            ? 'جاري الحساب...'
                            : isManualAmountEnabled
                              ? 'أدخل المبلغ يدوياً'
                              : 'سيتم الحساب تلقائياً'
                        }
                        className={`w-full text-right ${
                          isManualAmountEnabled
                            ? 'bg-orange-50 border-orange-300 focus:border-orange-500 focus:ring-orange-500 ring-2 ring-orange-200 pr-12'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        value={
                          isCalculating
                            ? ''
                            : isManualAmountEnabled
                              ? manualAmount
                              : calculatedAmount
                        }
                        onValueChange={
                          isManualAmountEnabled
                            ? values => setManualAmount(values.value)
                            : undefined
                        }
                        readOnly={!isManualAmountEnabled}
                        thousandSeparator={true}
                        decimalScale={2}
                        dir="rtl"
                        aria-label="المبلغ المحسوب"
                      />
                      {isCalculating && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue"></div>
                        </div>
                      )}
                      {isAdmin && isManualAmountEnabled && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                          <FiEdit3 className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                    {isAdmin && calculatedAmount && (
                      <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <IoCalculatorSharp className="w-3 h-3" />
                        <span>
                          المبلغ المحسوب تلقائياً:{' '}
                          {formatDisplayAmount(calculatedAmount)}{' '}
                          {currencies.find(c => c.id.toString() === toCurrency)
                            ?.code || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Manual Override Info */}
            {isAdmin && isManualAmountEnabled && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-orange-900 mb-1">
                      تم تفعيل التعديل اليدوي
                    </div>
                    <div className="text-xs text-orange-700">
                      يمكنك الآن تعديل المبلغ المحسوب يدوياً. سيتم استخدام
                      المبلغ المدخل بدلاً من المبلغ المحسوب تلقائياً.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
              <div className="text-med-x14 flex flex-col items-start gap-2">
                <span className="text-[#6B7280] text-med-x14">
                  يتم تسليم العميل مبلغ
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-bold-x20 text-[#10B981] font-bold">
                    {getFinalAmount()
                      ? `${formatDisplayAmount(getFinalAmount())} ${currencies.find(c => c.id.toString() === toCurrency)?.code || ''}`
                      : '0.00'}
                  </span>
                  {isAdmin && isManualAmountEnabled && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      يدوي
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => resetForm(true, false)}>
                  اعاده التعيين
                </SecondaryButton>
                <PrimaryButton
                  disabled={!getFinalAmount() || isCalculating || isSubmitting}
                  onClick={handleExecuteTransaction}
                >
                  {isSubmitting ? 'جاري التنفيذ...' : 'تنفيذ العملية'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overlay when session is closed or pending */}
      {(!isSessionOpen || isSessionPending) && (
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-xl shadow-lg p-6 mx-4 max-w-md text-center border border-gray-200">
            {isSessionPending ? (
              // Pending session message
              <>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  الجلسة النقدية معلقة
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  الجلسة الحالية معلقة، يتم الآن جرد الأرصدة ولا يمكن تنفيذ
                  عمليات جديدة.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-xs text-orange-800">
                      يرجى انتظار انتهاء عملية جرد الأرصدة لإكمال إغلاق الجلسة
                    </span>
                  </div>
                </div>
              </>
            ) : (
              // Closed session message
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
