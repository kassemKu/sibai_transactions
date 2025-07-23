import React, { useState } from 'react';
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
import { FiSave, FiRefreshCw } from 'react-icons/fi';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TransferFormProps {
  currencies: CurrenciesResponse;
  companies: Company[];
  isSessionOpen?: boolean;
  isSessionPending?: boolean;
  onStartSession?: () => void;
}

export default function TransferForm({
  currencies,
  companies,
  isSessionOpen = true,
  isSessionPending = false,
  onStartSession,
}: TransferFormProps) {
  const { auth, roles } = usePage().props as any;
  const isAdmin = roles && (roles as string[]).includes('super_admin');

  const [transferType, setTransferType] = useState<'in' | 'out'>('in');
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form
  const resetForm = (showToast = false) => {
    setTransferType('in');
    setCurrency('');
    setAmount('');
    setCompany('');

    if (showToast) {
      toast.success('تم إعادة تعيين النموذج');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currency || !amount || !company) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        company_id: parseInt(company),
        currency_id: parseInt(currency),
        amount: parseFloat(amount),
        type: transferType,
      };

      await axios.post('/admin/transfers', payload);
      toast.success('تم تنفيذ التحويل بنجاح');
      resetForm();
    } catch (error: any) {
      console.error('Error executing transfer:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('فشل في تنفيذ التحويل');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format amount for display
  const formatDisplayAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <div className="relative">
      <div
        className={`flex flex-col gap-6 ${!isSessionOpen || isSessionPending ? 'blur-sm opacity-60' : ''}`}
      >
        <div className="space-y-6">
          {/* Transfer Type */}
          <div className="space-y-3">
            <InputLabel className="mb-2">نوع التحويل</InputLabel>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="in"
                  checked={transferType === 'in'}
                  onChange={e =>
                    setTransferType(e.target.value as 'in' | 'out')
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">
صادر
                </span>
              </label>
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name="transferType"
                  value="out"
                  checked={transferType === 'out'}
                  onChange={e =>
                    setTransferType(e.target.value as 'in' | 'out')
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">
             وارد
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Currency and Amount */}
            <div className="space-y-4">
              <div className="text-bold-x16 text-text-black">
                تفاصيل التحويل
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InputLabel htmlFor="currency" className="mb-2">
                    اختر العملة
                  </InputLabel>
                  <Select
                    id="currency"
                    aria-label="اختر العملة"
                    placeholder="اختر العملة"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  >
                    <option value="">اختر العملة</option>
                    {currencies.map(currency => (
                      <option key={currency.id} value={currency.id}>
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <InputLabel htmlFor="amount" className="mb-2">
                    المبلغ
                  </InputLabel>
                  <NumberInput
                    id="amount"
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

            {/* Company Selection */}
            <div className="space-y-4">
              <div className="text-bold-x16 text-text-black">الشركة</div>
              <div className="space-y-2">
                <InputLabel htmlFor="company" className="mb-2">
                  اختر الشركة
                </InputLabel>
                <Select
                  id="company"
                  aria-label="اختر الشركة"
                  placeholder="اختر الشركة"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                >
                
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
            <div className="text-med-x14 flex flex-col items-start gap-2">
              <span className="text-[#6B7280] text-med-x14">
                {transferType === 'in' ? 'سيتم تحويل مبلغ' : 'سيتم سحب مبلغ'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-bold-x20 text-[#10B981] font-bold">
                  {amount
                    ? `${formatDisplayAmount(amount)} ${currencies.find(c => c.id.toString() === currency)?.code || ''}`
                    : '0.00'}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {transferType === 'in' ? 'تحويل إلى' : 'تحويل من'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => resetForm(true)}>
                <FiRefreshCw className="w-4 h-4 ml-2" />
                اعاده التعيين
              </SecondaryButton>
              <PrimaryButton
                disabled={!currency || !amount || !company || isSubmitting}
                onClick={handleSubmit}
              >
                <FiSave className="w-4 h-4 ml-2" />
                {isSubmitting ? 'جاري التنفيذ...' : 'تنفيذ التحويل'}
              </PrimaryButton>
            </div>
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
                  يجب فتح جلسة نقدية جديدة قبل تنفيذ أي تحويلات
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
