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
  FiSettings,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import { IoCalculatorSharp } from 'react-icons/io5';

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
  onStartSession?: () => void;
  availableCashers?: User[];
  formData: any;
  onChange: (field: string, value: string) => void;
  onSubmit?: (formData: any) => void;
  isEditing?: boolean;
  externalIsSubmitting?: boolean;
}

export default function TransactionForm({
  currencies,
  isSessionOpen = true,
  isSessionPending = false,
  onStartSession,
  availableCashers = [],
  formData,
  onChange,
  onSubmit,
  isEditing,
  externalIsSubmitting,
}: TransactionFormProps) {
  // Defensive fallback for formData
  formData = formData || {};
  const { roles } = usePage().props as any;
  const isSuperAdmin = roles && (roles as string[]).includes('super_admin');
  const isAdmin =
    roles &&
    (roles as string[]).some(role => ['super_admin', 'admin'].includes(role));

  // For edit mode, always show admin features if availableCashers is provided
  const shouldShowAdminSection =
    isAdmin || (isEditing && availableCashers && availableCashers.length > 0);

  // Remove all useState for form fields
  // Keep only internal state for things like isCalculating, isManualAmountEnabled, etc.
  const [manualAmount, setManualAmount] = useState('');
  const [isManualAmountEnabled, setIsManualAmountEnabled] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  // Remove: const [assignedTo, setAssignedTo] = useState(
  //   formData?.assignedTo ||
  //     (availableCashers.length > 0 ? availableCashers[0].id.toString() : ''),
  // );

  // Use prop isSubmitting if provided, otherwise use internal state
  const isSubmitting =
    externalIsSubmitting !== undefined
      ? externalIsSubmitting
      : internalIsSubmitting;

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

  // Ref to track the last calculation parameters to prevent unnecessary API calls
  const lastCalculationRef = useRef<{
    fromCurrency: string;
    toCurrency: string;
    amount: string;
  } | null>(null);

  // 1. Add local isManualOverride state
  const [isManualOverride, setIsManualOverride] = useState(false);

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

  // Save assignment rules to localStorage
  useEffect(() => {
    localStorage.setItem(
      'transactionAssignmentRules',
      JSON.stringify(assignmentRules),
    );
  }, [assignmentRules]);

  // Memoize onChange to prevent unnecessary re-renders in useEffect dependencies
  const memoizedOnChange = useCallback(onChange, [onChange]);

  // Memoize getMatchingAssignment to avoid unnecessary re-renders
  const getMatchingAssignment = useCallback(() => {
    if (!formData?.fromCurrency || !formData?.toCurrency) return null;
    // Determine direction based on currency flow
    const fromCurrencyObj = currencies.find(
      c => c.id.toString() === formData?.fromCurrency,
    );
    const toCurrencyObj = currencies.find(
      c => c.id.toString() === formData?.toCurrency,
    );
    if (!fromCurrencyObj || !toCurrencyObj) return null;
    // Find matching rule
    const matchingRule = assignmentRules.find(rule => {
      if (rule.direction === 'spend') {
        return rule.currency_id.toString() === formData?.toCurrency;
      } else {
        return rule.currency_id.toString() === formData?.fromCurrency;
      }
    });
    return matchingRule;
  }, [
    formData?.fromCurrency,
    formData?.toCurrency,
    assignmentRules,
    currencies,
  ]);

  // Update assignedTo when availableCashers changes
  useEffect(() => {
    // console.log(
    //   '[useEffect: availableCashers/assignedTo] availableCashers:',
    //   availableCashers,
    //   'formData.assignedTo:',
    //   formData.assignedTo,
    //   'isManualOverride:',
    //   isManualOverride,
    // );
    if (
      availableCashers.length > 0 &&
      !formData.assignedTo &&
      !isManualOverride
    ) {
      const defaultId = availableCashers[0].id.toString();
      if (formData.assignedTo !== defaultId) {
            // console.log(
            // '[useEffect: availableCashers/assignedTo] Setting assignedTo to',
            // defaultId,
            // );
        memoizedOnChange('assignedTo', defaultId);
      }
    }
  }, [
    availableCashers,
    formData.assignedTo,
    memoizedOnChange,
    isManualOverride,
  ]);

  // Update manual amount when calculated amount changes in edit mode
  useEffect(() => {
    if (
      isEditing &&
      formData?.calculatedAmount &&
      formData?.calculatedAmount !== 'خطأ في الحساب' &&
      (!isManualAmountEnabled ||
        manualAmount === '' ||
        manualAmount === formData?.calculatedAmount)
    ) {
      setManualAmount(formData?.calculatedAmount);
    }
    // If manual mode is enabled and user has changed manualAmount, do not overwrite
  }, [
    formData?.calculatedAmount,
    isEditing,
    isManualAmountEnabled,
    manualAmount,
  ]);

  // Get the final amount to use (manual if enabled, otherwise calculated)
  const getFinalAmount = useCallback(() => {
    if (isAdmin && isManualAmountEnabled && manualAmount) {
      return manualAmount;
    }
    return formData?.calculatedAmount;
  }, [
    isAdmin,
    isManualAmountEnabled,
    manualAmount,
    formData?.calculatedAmount,
  ]);

  // Auto-assign user based on rules
  useEffect(() => {
    // console.log(
    //   '[useEffect: auto-assign] isAdmin:',
    //   isAdmin,
    //   'fromCurrency:',
    //   formData?.fromCurrency,
    //   'toCurrency:',
    //   formData?.toCurrency,
    //   'assignmentRules:',
    //   assignmentRules,
    //   'formData.assignedTo:',
    //   formData.assignedTo,
    //   'isManualOverride:',
    //   isManualOverride,
    // );
    if (
      isAdmin &&
      formData?.fromCurrency &&
      formData?.toCurrency &&
      !isManualOverride
    ) {
      const matchingRule = getMatchingAssignment();
      if (
        matchingRule &&
        formData.assignedTo !== matchingRule.user_id.toString()
      ) {
        // console.log(
        //   '[useEffect: auto-assign] Auto-assigning assignedTo to',
        //   matchingRule.user_id.toString(),
        // );
        memoizedOnChange('assignedTo', matchingRule.user_id.toString());
      }
    }
  }, [
    formData?.fromCurrency,
    formData?.toCurrency,
    assignmentRules,
    isAdmin,
    getMatchingAssignment,
    formData.assignedTo,
    memoizedOnChange,
    isManualOverride,
  ]);

  // 1. When currency changes, clear override and assign default
  useEffect(() => {
    setIsManualOverride(false);
    const matchingRule = getMatchingAssignment();
    if (
      formData?.fromCurrency &&
      formData?.toCurrency &&
      matchingRule &&
      formData.assignedTo !== matchingRule.user_id.toString()
    ) {
      memoizedOnChange('assignedTo', matchingRule.user_id.toString());
    } else if (
      formData?.fromCurrency &&
      formData?.toCurrency &&
      !matchingRule &&
      formData.assignedTo
    ) {
      memoizedOnChange('assignedTo', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.fromCurrency, formData?.toCurrency]);

  // 2. When user selects a cashier, set manual override
  const handleAssignedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsManualOverride(true);
    memoizedOnChange('assignedTo', e.target.value);
    // console.log(
    //   '[Manual Override] assignedTo set to',
    //   e.target.value,
    //   'isManualOverride set to true',
    // );
  };

  // 3. On submit or reset, clear override and assignedTo
  const resetForm = useCallback(
    (showToast = false, preserveHandler = true) => {
      memoizedOnChange('fromCurrency', '');
      memoizedOnChange('toCurrency', '');
      memoizedOnChange('amount', '');
      memoizedOnChange('calculatedAmount', '');
      setManualAmount('');
      setIsManualAmountEnabled(false);
      lastCalculationRef.current = null;
      setIsManualOverride(false);
      memoizedOnChange('assignedTo', '');
    //   console.log('[Reset] assignedTo cleared, isManualOverride set to false');
    //   if (showToast) {
    //     toast.success('تم إعادة تعيين النموذج');
    //   }
    },
    [memoizedOnChange, availableCashers],
  );

  // Set default currency values for admin
  useEffect(() => {
    if (isAdmin && currencies && currencies.length > 0) {
      // Only set defaults if no currencies are currently selected
      if (!formData?.fromCurrency && !formData?.toCurrency) {
        // Find USD currency for "From" default
        const usdCurrency = currencies.find(c => c.code === 'USD');
        if (usdCurrency) {
          memoizedOnChange('fromCurrency', usdCurrency.id.toString());
        }

        // Find SYP currency for "To" default
        const sypCurrency = currencies.find(c => c.code === 'SYP');
        if (sypCurrency) {
          memoizedOnChange('toCurrency', sypCurrency.id.toString());
        }
      }
    }
  }, [
    isAdmin,
    currencies,
    formData?.fromCurrency,
    formData?.toCurrency,
    memoizedOnChange,
  ]);

  // Reset "To" currency if it becomes invalid when "From" currency changes
  useEffect(() => {
    if (
      formData?.fromCurrency &&
      formData?.toCurrency &&
      formData?.fromCurrency === formData?.toCurrency
    ) {
      memoizedOnChange('toCurrency', '');
      memoizedOnChange('calculatedAmount', '');
      setManualAmount('');
    }
  }, [formData?.fromCurrency, formData?.toCurrency, memoizedOnChange]);

  // Assignment settings handlers
  const handleAddRule = () => {
    if (!newRule.currency_id || !newRule.user_id || !newRule.direction) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
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
    localStorage.removeItem('transactionAssignmentRules');
    toast.success('تم مسح جميع إعدادات التعيين');
  };

  // Calculate currency conversion
  const calculateCurrency = useCallback(async () => {
    if (
      !formData?.fromCurrency ||
      !formData?.toCurrency ||
      !formData?.amount ||
      parseFloat(formData?.amount) <= 0
    ) {
      memoizedOnChange('calculatedAmount', '');
      return;
    }

    // Check if we're making the same calculation as before
    const currentParams = {
      fromCurrency: formData?.fromCurrency,
      toCurrency: formData?.toCurrency,
      amount: formData?.amount,
    };
    if (
      lastCalculationRef.current &&
      lastCalculationRef.current.fromCurrency === formData?.fromCurrency &&
      lastCalculationRef.current.toCurrency === formData?.toCurrency &&
      lastCalculationRef.current.amount === formData?.amount
    ) {
      return; // Skip duplicate calculation
    }

    lastCalculationRef.current = currentParams;
    setIsCalculating(true);
    try {
      const response = await axios.get('/transactions/calc', {
        params: {
          from_currency_id: formData?.fromCurrency,
          to_currency_id: formData?.toCurrency,
          original_amount: formData?.amount,
        },
      });

      const newCalculatedAmount =
        response.data.data.calculation_result.converted_amount || '0';

      memoizedOnChange('calculatedAmount', newCalculatedAmount);
    } catch (error) {
      console.error('Error calculating currency:', error);
      memoizedOnChange('calculatedAmount', 'خطأ في الحساب');

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
  }, [
    formData?.fromCurrency,
    formData?.toCurrency,
    formData?.amount,
    memoizedOnChange,
  ]);

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
      setManualAmount(formData?.calculatedAmount);
      setIsManualAmountEnabled(false);
      toast.success('تم التبديل إلى الحساب التلقائي');
    } else {
      // Enabling manual mode - preserve current calculated amount as starting point
      if (
        formData?.calculatedAmount &&
        formData?.calculatedAmount !== 'خطأ في الحساب'
      ) {
        // Always set the manual amount to the calculated amount when enabling manual mode
        // This ensures the input shows the current calculated value
        setManualAmount(formData?.calculatedAmount);
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
    // console.log('[Submit] assignedTo being sent:', formData.assignedTo);
    if (
      !formData?.fromCurrency ||
      !formData?.toCurrency ||
      !formData?.amount ||
      !finalAmount
    ) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Check if same currency is selected in both fields
    if (formData?.fromCurrency === formData?.toCurrency) {
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

    // If editing mode and onSubmit is provided, use it
    if (isEditing && onSubmit) {
      const formDataToSubmit = {
        fromCurrency: formData?.fromCurrency,
        toCurrency: formData?.toCurrency,
        amount: formData?.amount,
        calculatedAmount: finalAmount,
        notes: formData.notes,
        assignedTo: formData.assignedTo,
      };
      onSubmit(formDataToSubmit);
      setIsManualOverride(false);
      memoizedOnChange('assignedTo', '');
      return;
    }

    // Otherwise, handle create mode
    setInternalIsSubmitting(true);
    try {
      const transactionData = {
        from_currency_id: parseInt(formData?.fromCurrency),
        to_currency_id: parseInt(formData?.toCurrency),
        original_amount: parseFloat(formData?.amount),
        converted_amount: parseFloat(finalAmount), // Use the correct value (manual or calculated)
        customer_name: '', // You can add a customer name field later
        assigned_to: formData.assignedTo ? parseInt(formData.assignedTo) : '',
        notes: formData.notes ?? '',
      };

      // Determine endpoint based on role
      const endpoint = isSuperAdmin
        ? '/admin/transactions'
        : 'casher/transactions';
      const response = await axios.post(endpoint, transactionData);

      if (response.data) {
        const selectedUser = availableCashers.find(
          u => u.id.toString() === formData.assignedTo,
        );
        const handlerName = selectedUser
          ? selectedUser.name
          : 'المستخدم المحدد';
        toast.success(
          `تم تنفيذ العملية بنجاح - سيتم الاحتفاظ بـ ${handlerName} للعملية التالية`,
        );
        setIsManualOverride(false);
        memoizedOnChange('assignedTo', '');
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
            currencies.find(c => c.id.toString() === formData?.fromCurrency)
              ?.name || 'العملة المحددة';
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
      setInternalIsSubmitting(false);
    }
  }, [
    formData?.fromCurrency,
    formData?.toCurrency,
    formData?.amount,
    getFinalAmount,
    isAdmin,
    isSuperAdmin,
    isSessionOpen,
    isSessionPending,
    resetForm,
    currencies,
    availableCashers,
    formData.notes,
    isEditing,
    onSubmit,
    memoizedOnChange,
    setIsManualOverride,
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
    <div className="w-full relative">
      <div
        className={`flex flex-col gap-6 ${!isSessionOpen || isSessionPending ? 'blur-sm opacity-60' : ''}`}
      >
        {/* Admin User Assignment Section */}
        {shouldShowAdminSection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-bold-x16 text-blue-900">تعيين المسؤول</div>
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
                            direction: e.target.value as 'receive' | 'spend',
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
                    value={formData.assignedTo || ''}
                    onChange={handleAssignedToChange}
                    className="border-blue-300 focus:border-blue-500"
                    disabled={
                      isLoadingAvailableCashers || availableCashers.length === 0
                    }
                  >
                    {isLoadingAvailableCashers ? (
                      <option value="">جاري التحميل...</option>
                    ) : availableCashers.length === 0 ? (
                      <option value="">لا يوجد صرافون متاحون</option>
                    ) : (
                      // Remove the 'اختر المستخدم' option
                      <>
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

        {/* Currency Exchange Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* From Currency */}
          <div className="space-y-4">
            <div className="text-bold-x16 text-text-black">من</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <InputLabel htmlFor="from_currency" className="mb-2">
                  أختر العمله
                </InputLabel>
                <Select
                  id="from_currency"
                  aria-label="اختر العملة المصدر"
                  placeholder="اختر العملة"
                  value={formData?.fromCurrency}
                  onChange={e =>
                    memoizedOnChange('fromCurrency', e.target.value)
                  }
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
                  value={formData?.amount}
                  onValueChange={values =>
                    memoizedOnChange('amount', values.value)
                  }
                  min={0}
                  decimalScale={2}
                  thousandSeparator={true}
                  dir="rtl"
                  aria-label="مبلغ العملية"
                />
              </div>
            </div>
          </div>

          {/* To Currency */}
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
                  value={formData?.toCurrency}
                  onChange={e => memoizedOnChange('toCurrency', e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                >
                  <option value="">اختر العملة</option>
                  {currencies
                    .filter(
                      currency =>
                        currency.id.toString() !== formData?.fromCurrency,
                    )
                    .map(currency => (
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
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <NumberInput
                      id="to_amount"
                      placeholder="سيتم الحساب تلقائياً"
                      className="w-full text-right bg-gray-50"
                      value={
                        isManualAmountEnabled
                          ? manualAmount
                          : formData?.calculatedAmount
                      }
                      onValueChange={values => setManualAmount(values.value)}
                      min={0}
                      decimalScale={2}
                      thousandSeparator={true}
                      dir="rtl"
                      disabled={!isManualAmountEnabled}
                      aria-label="المبلغ المحسوب"
                    />
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleManualAmountToggle}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        isManualAmountEnabled
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      disabled={isCalculating || !formData?.calculatedAmount}
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
                {isCalculating && (
                  <div className="text-xs text-blue-600 mt-1">
                    جاري حساب المبلغ...
                  </div>
                )}
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
              value={formData.notes || ''}
              onChange={e => memoizedOnChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={255}
              dir="rtl"
            />
            <div className="text-xs text-gray-500 text-left">
              {(formData.notes || '').length}/255 حرف
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
          <div className="text-med-x14 flex flex-col items-start gap-2">
            {formData?.fromCurrency === formData?.toCurrency &&
            formData?.fromCurrency &&
            formData?.toCurrency ? (
              <div className="text-red-600 text-sm font-medium">
                ⚠️ لا يمكن اختيار نفس العملة في الحقلين
              </div>
            ) : (
              <>
                <span className="text-[#6B7280] text-med-x14">
                  يتم تسليم العميل مبلغ
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-bold-x20 text-[#10B981] font-bold">
                    {getFinalAmount()
                      ? `${formatDisplayAmount(getFinalAmount())} ${currencies.find(c => c.id.toString() === formData?.toCurrency)?.code || ''}`
                      : '0.00'}
                  </span>
                  {isAdmin && isManualAmountEnabled && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      يدوي
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <SecondaryButton onClick={() => resetForm(true, false)}>
              اعاده التعيين
            </SecondaryButton>
            <PrimaryButton
              disabled={
                !getFinalAmount() ||
                isCalculating ||
                isSubmitting ||
                formData?.fromCurrency === formData?.toCurrency
              }
              onClick={handleExecuteTransaction}
            >
              {isSubmitting
                ? isEditing
                  ? 'جاري الحفظ...'
                  : 'جاري التنفيذ...'
                : isEditing
                  ? 'حفظ التغييرات'
                  : 'تنفيذ العملية'}
            </PrimaryButton>
          </div>
        </div>
      </div>

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
                  يرجى الانتظار حتى يتم تأكيد الجلسة من قبل المشرف
                </p>
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
