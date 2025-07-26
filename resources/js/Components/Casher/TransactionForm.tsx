import React, { useState, useEffect, useCallback } from 'react';
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
import { FiSettings, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AssignmentRule {
  id: string;
  currency_id: number;
  direction: 'receive' | 'spend';
  user_id: number;
  user_name: string;
}

interface TransactionFormProps {
  currencies: CurrenciesResponse;
  isSessionOpen?: boolean;
  isSessionPending?: boolean;
  availableCashers?: User[];
  isUnavailable?: boolean;
  sessionKey?: string;
}

export default function TransactionForm({
  currencies,
  isSessionOpen = true,
  isSessionPending = false,
  availableCashers = [],
  isUnavailable = false,
  sessionKey,
}: TransactionFormProps) {
  const { roles } = usePage().props as any;
  const isAdmin = roles && (roles as string[]).includes('admin');

  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState(
    availableCashers.length > 0 ? availableCashers[0].id.toString() : '',
  );

  // Assignment settings state
  const [showSettings, setShowSettings] = useState(false);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);
  const [newRule, setNewRule] = useState<{
    currency_id: string;
    direction: 'receive' | 'spend';
    user_id: string;
  }>({
    currency_id: '',
    direction: 'receive',
    user_id: '',
  });

  // Load assignment rules from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('transactionAssignmentRules');
    if (savedRules) {
      try {
        setAssignmentRules(JSON.parse(savedRules));
      } catch (error) {
        console.error('Error loading assignment rules:', error);
      }
    }
  }, []);

  // Set default currency for assignment rules form
  useEffect(() => {
    if (currencies && currencies.length > 0 && !newRule.currency_id) {
      // Find USD currency for default
      const usdCurrency = currencies.find(c => c.code === 'USD');
      if (usdCurrency) {
        setNewRule(prev => ({
          ...prev,
          currency_id: usdCurrency.id.toString(),
        }));
      }
    }
  }, [currencies, newRule.currency_id]);

  // Save assignment rules to localStorage
  useEffect(() => {
    localStorage.setItem(
      'transactionAssignmentRules',
      JSON.stringify(assignmentRules),
    );
  }, [assignmentRules]);

  // Auto-cleanup assignment rules when cashiers become unavailable
  useEffect(() => {
    if (
      assignmentRules.length > 0 &&
      availableCashers &&
      availableCashers.length > 0
    ) {
      const availableCashierIds = new Set(
        availableCashers.map(cashier => cashier.id),
      );
      const validRules = assignmentRules.filter(rule =>
        availableCashierIds.has(rule.user_id),
      );

      // If any rules were filtered out, update the state
      if (validRules.length !== assignmentRules.length) {
        const removedRulesCount = assignmentRules.length - validRules.length;
        console.log(
          `[Assignment Cleanup] Removed ${removedRulesCount} assignment rule(s) for unavailable cashiers`,
        );
        setAssignmentRules(validRules);

        // Show a toast notification if rules were removed
        if (removedRulesCount > 0) {
          toast.success(
            `تم إزالة ${removedRulesCount} قاعدة تعيين للصرافين غير المتاحين`,
          );
        }
      }
    }
  }, [availableCashers]); // Remove assignmentRules from dependencies to prevent infinite loop

  // Update assignedTo when availableCashers changes
  useEffect(() => {
    // Check if currently assigned cashier is still available
    if (assignedTo && availableCashers.length > 0) {
      const currentAssignedCashier = availableCashers.find(
        cashier => cashier.id.toString() === assignedTo,
      );

      // If currently assigned cashier is no longer available, reset assignment
      if (!currentAssignedCashier) {
        console.log(
          '[Assignment Reset] Currently assigned cashier is no longer available, resetting assignment',
        );
        setAssignedTo('');
        toast.success('تم إعادة تعيين الصراف المختار لأنه لم يعد متاحاً');
        return; // Return early to let the next condition handle the default assignment
      }
    }

    // Set default assignment if none is set
    if (availableCashers.length > 0 && !assignedTo) {
      setAssignedTo(availableCashers[0].id.toString());
    }
  }, [availableCashers, assignedTo]);

  // Reset assignment rules when sessionKey changes
  useEffect(() => {
    if (sessionKey) {
      const savedRules = localStorage.getItem('transactionAssignmentRules');
      if (savedRules) {
        try {
          const parsedRules = JSON.parse(savedRules);
          setAssignmentRules(parsedRules);
        } catch (error) {
          console.error('Error loading assignment rules:', error);
          setAssignmentRules([]);
        }
      } else {
        setAssignmentRules([]);
      }
    }
  }, [sessionKey]);

  // Check if current transaction matches any assignment rule
  const getMatchingAssignment = useCallback(() => {
    if (!fromCurrency || !toCurrency) return null;

    // Determine direction based on currency flow
    const fromCurrencyObj = currencies.find(
      c => c.id.toString() === fromCurrency,
    );
    const toCurrencyObj = currencies.find(c => c.id.toString() === toCurrency);

    if (!fromCurrencyObj || !toCurrencyObj) return null;

    // Find matching rule
    const matchingRule = assignmentRules.find(rule => {
      // For spend: match when the currency is in "to" field (we're spending this currency)
      // For receive: match when the currency is in "from" field (we're receiving this currency)
      if (rule.direction === 'spend') {
        return rule.currency_id.toString() === toCurrency;
      } else {
        return rule.currency_id.toString() === fromCurrency;
      }
    });

    return matchingRule;
  }, [fromCurrency, toCurrency, assignmentRules, currencies]);

  // Auto-assign user based on rules
  useEffect(() => {
    if (isAdmin && fromCurrency && toCurrency) {
      const matchingRule = getMatchingAssignment();
      if (matchingRule) {
        setAssignedTo(matchingRule.user_id.toString());
      }
    }
  }, [
    fromCurrency,
    toCurrency,
    assignmentRules,
    isAdmin,
    getMatchingAssignment,
  ]);

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

  // Assignment settings handlers
  const handleAddRule = () => {
    if (!newRule.currency_id) {
      toast.error('يرجى اختيار العملة');
      return;
    }
    if (!newRule.user_id) {
      toast.error('يرجى اختيار المستخدم');
      return;
    }

    const selectedUser = availableCashers.find(
      u => u.id.toString() === newRule.user_id,
    );
    if (!selectedUser) {
      toast.error('المستخدم المحدد غير موجود');
      return;
    }

    const selectedCurrency = currencies.find(
      c => c.id.toString() === newRule.currency_id,
    );
    if (!selectedCurrency) {
      toast.error('العملة المحددة غير موجودة');
      return;
    }

    // Check if rule already exists
    const existingRule = assignmentRules.find(
      rule =>
        rule.currency_id.toString() === newRule.currency_id &&
        rule.direction === newRule.direction,
    );

    if (existingRule) {
      toast.error('قاعدة التعيين موجودة بالفعل لهذه العملة والاتجاه');
      return;
    }

    const newAssignmentRule: AssignmentRule = {
      id: Date.now().toString(),
      currency_id: parseInt(newRule.currency_id),
      direction: newRule.direction,
      user_id: parseInt(newRule.user_id),
      user_name: selectedUser.name,
    };

    setAssignmentRules(prev => [...prev, newAssignmentRule]);
    setNewRule({ currency_id: '', direction: 'receive', user_id: '' });
    toast.success('تم إضافة قاعدة التعيين بنجاح');
  };

  const handleRemoveRule = (ruleId: string) => {
    setAssignmentRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success('تم حذف قاعدة التعيين');
  };

  const handleClearAllSettings = () => {
    setAssignmentRules([]);
    localStorage.setItem('transactionAssignmentRules', JSON.stringify([]));
    toast.success('تم مسح جميع إعدادات التعيين');
  };

  // Set default currency based on user role
  useEffect(() => {
    if (currencies && currencies.length > 0) {
      if (isAdmin) {
        // Admin users can choose any currency for "From"
        // Don't set a default, let them choose
      } else {
        // Regular cashiers are restricted to SYP as "From" currency
        const sypCurrency = currencies.find(c => c.code === 'SYP');
        if (sypCurrency && !fromCurrency) {
          setFromCurrency(sypCurrency.id.toString());
        }
      }
    }
  }, [currencies, fromCurrency, isAdmin]);

  // Reset "To" currency if it becomes invalid when "From" currency changes
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency === toCurrency) {
      setToCurrency('');
      setCalculatedAmount('');
    }
  }, [fromCurrency, toCurrency]);

  // Get available currencies based on user role and current selection
  const sypCurrency = currencies.find(c => c.code === 'SYP');
  const availableToCurrencies = isAdmin
    ? currencies.filter(c => c.id.toString() !== fromCurrency) // Admin can choose any currency except the selected "From" currency
    : currencies.filter(
        c => c.code !== 'SYP' && c.id.toString() !== fromCurrency,
      ); // Regular cashiers exclude SYP and selected "From" currency

  // Reset form
  const resetForm = useCallback(
    (showToast = false, preserveHandler = true) => {
      setFromCurrency('');
      setToCurrency('');
      setAmount('');
      setCalculatedAmount('');
      setNotes('');

      // Only reset assignedTo if preserveHandler is false
      if (!preserveHandler) {
        setAssignedTo(
          availableCashers.length > 0 ? availableCashers[0].id.toString() : '',
        );
      }

      if (showToast) {
        toast.success('تم إعادة تعيين النموذج');
      }
    },
    [availableCashers],
  );

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

      setCalculatedAmount(
        response.data.data.calculation_result.converted_amount || '0',
      );
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
  }, [fromCurrency, toCurrency, amount]);

  // Debounced calculation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateCurrency();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [calculateCurrency]);

  // Handle transaction execution
  const handleExecuteTransaction = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || !calculatedAmount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Check if same currency is selected in both fields
    if (fromCurrency === toCurrency) {
      toast.error('لا يمكن اختيار نفس العملة في الحقلين');
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
        converted_amount: parseFloat(calculatedAmount),
        customer_name: '', // You can add a customer name field later
        ...(isAdmin && assignedTo ? { assigned_to: parseInt(assignedTo) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      const response = await axios.post(
        '/casher/transactions',
        transactionData,
      );

      if (response.data) {
        const selectedUser = availableCashers.find(
          u => u.id.toString() === assignedTo,
        );
        const handlerName = selectedUser
          ? selectedUser.name
          : 'المستخدم المحدد';
        toast.success(
          `تم تنفيذ العملية بنجاح${isAdmin && assignedTo ? ` - سيتم الاحتفاظ بـ ${handlerName} للعملية التالية` : ''}`,
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
    calculatedAmount,
    isSessionOpen,
    isSessionPending,
    resetForm,
    currencies,
    notes,
    isAdmin,
    assignedTo,
    availableCashers,
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

  const isLoadingAvailableCashers = availableCashers == null;

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

            {/* Admin User Assignment Section - Only for Admin Users */}
            {isAdmin && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-bold-x16 text-blue-900">
                      تعيين المسؤول
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      إعدادات التعيين
                    </button>
                  </div>

                  {/* Assignment Settings Panel */}
                  {showSettings && (
                    <div className="bg-white border border-blue-200 rounded-lg p-4 mt-3">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            قواعد التعيين التلقائي
                          </h4>
                          <button
                            type="button"
                            onClick={handleClearAllSettings}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            مسح الكل
                          </button>
                        </div>

                        {/* Add New Rule */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                          <Select
                            value={newRule.currency_id}
                            onChange={e =>
                              setNewRule(prev => ({
                                ...prev,
                                currency_id: e.target.value,
                              }))
                            }
                            className="text-sm"
                          >
                            <option value="">اختر العملة</option>
                            {currencies.map(currency => (
                              <option key={currency.id} value={currency.id}>
                                {currency.name} ({currency.code})
                              </option>
                            ))}
                          </Select>

                          <Select
                            value={newRule.direction}
                            onChange={e =>
                              setNewRule(prev => ({
                                ...prev,
                                direction: e.target.value as
                                  | 'receive'
                                  | 'spend',
                              }))
                            }
                            className="text-sm"
                          >
                            <option value="receive">استلام</option>
                            <option value="spend">صرف</option>
                          </Select>

                          <div className="flex gap-2">
                            <Select
                              value={newRule.user_id}
                              onChange={e =>
                                setNewRule(prev => ({
                                  ...prev,
                                  user_id: e.target.value,
                                }))
                              }
                              className="text-sm flex-1"
                            >
                              <option value="">اختر المستخدم</option>
                              {availableCashers.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </Select>
                            <button
                              type="button"
                              onClick={handleAddRule}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              title="إضافة قاعدة تعيين"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Existing Rules */}
                        {assignmentRules.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600">
                              القواعد المحددة:
                            </div>
                            {assignmentRules.map(rule => {
                              const currency = currencies.find(
                                c => c.id === rule.currency_id,
                              );
                              return (
                                <div
                                  key={rule.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {currency?.name}
                                    </span>
                                    <span className="text-gray-500">
                                      (
                                      {rule.direction === 'receive'
                                        ? 'استلام'
                                        : 'صرف'}
                                      )
                                    </span>
                                    <span className="text-blue-600">
                                      → {rule.user_name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRule(rule.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="حذف القاعدة"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                        disabled={
                          isLoadingAvailableCashers ||
                          availableCashers.length === 0
                        }
                      >
                        {isLoadingAvailableCashers ? (
                          <option value="">جاري التحميل...</option>
                        ) : availableCashers.length === 0 ? (
                          <option value="">لا يوجد صرافون متاحون</option>
                        ) : (
                          <>
                            <option value="">اختر المستخدم</option>
                            {availableCashers.map(user => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </>
                        )}
                      </Select>
                      {availableCashers.length === 0 && (
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
                      {isAdmin ? 'اختر العملة المصدر' : 'العملة المصدر'}
                    </InputLabel>
                    <div className="relative">
                      <Select
                        id="from_currency"
                        aria-label="اختر العملة"
                        value={fromCurrency}
                        disabled={!isAdmin} // Only disable for regular cashiers
                        className={
                          !isAdmin
                            ? 'bg-gray-100 text-gray-700 cursor-not-allowed'
                            : ''
                        }
                        onChange={e => setFromCurrency(e.target.value)}
                      >
                        {isAdmin ? (
                          // Admin can choose any currency
                          <>
                            {currencies.map(currency => (
                              <option key={currency.id} value={currency.id}>
                                {currency.name} ({currency.code})
                              </option>
                            ))}
                          </>
                        ) : (
                          // Regular cashiers are locked to SYP
                          sypCurrency && (
                            <option value={sypCurrency.id}>
                              {sypCurrency.name} ({sypCurrency.code})
                            </option>
                          )
                        )}
                      </Select>
                      {!isAdmin && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
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
                      aria-label="اختر العملة"
                      placeholder="اختر العملة"
                      value={toCurrency}
                      onChange={e => setToCurrency(e.target.value)}
                    >
                      {availableToCurrencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <InputLabel htmlFor="to_amount" className="mb-2">
                      المبلغ المحسوب
                    </InputLabel>
                    <div className="relative">
                      <NumberInput
                        id="to_amount"
                        placeholder={
                          isCalculating
                            ? 'جاري الحساب...'
                            : 'سيتم الحساب تلقائياً'
                        }
                        className="w-full bg-gray-50 text-right"
                        value={isCalculating ? '' : calculatedAmount}
                        readOnly
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="text-bold-x16 text-text-black">ملاحظات</div>
              <div className="space-y-2">
                <InputLabel htmlFor="notes" className="mb-2">
                  ملاحظة (اختيارية)
                </InputLabel>
                <textarea
                  id="notes"
                  placeholder="أضف ملاحظة للعملية (اختياري)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={255}
                  dir="rtl"
                />
                <div className="text-xs text-gray-500 text-left">
                  {notes.length}/255 حرف
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
              <div className="text-med-x14 flex flex-col items-start gap-2">
                {fromCurrency === toCurrency && fromCurrency && toCurrency ? (
                  <div className="text-red-600 text-sm font-medium">
                    ⚠️ لا يمكن اختيار نفس العملة في الحقلين
                  </div>
                ) : (
                  <>
                    <span className="text-[#6B7280] text-med-x14">
                      يتم تسليم العميل مبلغ
                    </span>
                    <span className="text-bold-x20 text-[#10B981] font-bold">
                      {calculatedAmount
                        ? `${formatDisplayAmount(calculatedAmount)} ${currencies.find(c => c.id.toString() === toCurrency)?.code || ''}`
                        : '0.00'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={() => resetForm(true, false)}>
                  اعاده التعيين
                </SecondaryButton>
                <PrimaryButton
                  disabled={
                    !calculatedAmount ||
                    isCalculating ||
                    isSubmitting ||
                    fromCurrency === toCurrency
                  }
                  onClick={handleExecuteTransaction}
                >
                  {isSubmitting ? 'جاري التنفيذ...' : 'تنفيذ العملية'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overlay when session is closed or pending or cashier unavailable */}
      {(!isSessionOpen || isSessionPending || isUnavailable) && (
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-xl shadow-lg p-6 mx-4 max-w-md text-center border border-gray-200">
            {isUnavailable ? (
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
                  غير متاح
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  لا يمكنك تنفيذ معاملات حالياً لأن حالتك غير متاحة. يرجى تغيير
                  حالتك إلى "متواجد" للمتابعة.
                </p>
              </>
            ) : isSessionPending ? (
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
                <div className="text-xs text-gray-500">
                  يرجى الانتظار حتى يقوم المشرف بفتح جلسة جديدة
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
