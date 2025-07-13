import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import NumberInput from '@/Components/NumberInput';
import InputLabel from '@/Components/InputLabel';
import Select from '@/Components/Select';
import { CurrenciesResponse } from '@/types';
import { FiPlus, FiX, FiUser, FiDollarSign } from 'react-icons/fi';

interface User {
  id: number;
  name: string;
  email: string;
}

interface OpeningBalance {
  currency_id: string;
  amount: string;
}

interface AddCashboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currencies: CurrenciesResponse;
}

export default function AddCashboxModal({
  isOpen,
  onClose,
  onSuccess,
  currencies,
}: AddCashboxModalProps) {
  const [casherId, setCasherId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([
    { currency_id: '', amount: '' },
  ]);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const resetForm = () => {
    setCasherId('');
    setOpeningBalances([{ currency_id: '', amount: '' }]);
    setIsSubmitting(false);
  };

  const addCurrencyRow = () => {
    setOpeningBalances([...openingBalances, { currency_id: '', amount: '' }]);
  };

  const removeCurrencyRow = (index: number) => {
    if (openingBalances.length > 1) {
      setOpeningBalances(openingBalances.filter((_, i) => i !== index));
    }
  };

  const updateBalance = (
    index: number,
    field: 'currency_id' | 'amount',
    value: string,
  ) => {
    const newBalances = [...openingBalances];
    newBalances[index][field] = value;
    setOpeningBalances(newBalances);
  };

  const handleSubmit = async () => {
    // Validation
    if (!casherId) {
      toast.error('يرجى تحديد الصراف');
      return;
    }

    if (
      openingBalances.some(balance => !balance.currency_id || !balance.amount)
    ) {
      toast.error('يرجى ملء جميع حقول العملة والمبلغ');
      return;
    }

    if (openingBalances.some(balance => parseFloat(balance.amount) <= 0)) {
      toast.error('يجب أن يكون المبلغ أكبر من صفر');
      return;
    }

    // Check for duplicate currencies
    const currencyIds = openingBalances.map(balance => balance.currency_id);
    if (new Set(currencyIds).size !== currencyIds.length) {
      toast.error('لا يمكن تكرار العملة في نفس الجلسة');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        casher_id: parseInt(casherId),
        opening_balances: openingBalances.map(balance => ({
          currency_id: parseInt(balance.currency_id),
          amount: parseFloat(balance.amount),
        })),
      };

      const response = await axios.post('/admin/open-casher-session', payload);
      if (response.data) {
        toast.success('تم إضافة الصندوق للجلسة بنجاح');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error adding cashbox:', error);
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(`خطأ في البيانات: ${errorMessages.join(', ')}`);
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('حدث خطأ أثناء إضافة الصندوق');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  return (
    <DialogModal isOpen={isOpen} onClose={handleClose} maxWidth="4xl">
      <DialogModal.Content title="إضافة صندوق للجلسة">
        <div className="space-y-6" dir="rtl">
          <div className="text-sm text-gray-600 mb-4 text-right">
            إضافة صندوق جديد لصراف في الجلسة النقدية الحالية
          </div>

          {/* Casher Selection */}
          <div className="space-y-2">
            <InputLabel htmlFor="casher_id" className="mb-2">
              اختر الصراف
            </InputLabel>
            <Select
              id="casher_id"
              aria-label="اختر الصراف"
              value={casherId}
              onChange={e => setCasherId(e.target.value)}
              className="border-blue-200 focus:border-blue-500"
              disabled={isLoadingUsers}
            >
              <option value="">اختر الصراف</option>
              {isLoadingUsers ? (
                <option value="" disabled>
                  جاري التحميل...
                </option>
              ) : (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))
              )}
            </Select>
            {isLoadingUsers && (
              <div className="text-xs text-blue-600 mt-1">
                جاري تحميل قائمة المستخدمين...
              </div>
            )}
          </div>

          {/* Opening Balances */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <InputLabel className="mb-2">أرصدة البداية</InputLabel>
              <button
                type="button"
                onClick={addCurrencyRow}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <FiPlus className="w-3 h-3" />
                إضافة عملة
              </button>
            </div>

            <div className="space-y-3">
              {openingBalances.map((balance, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <InputLabel className="mb-2 text-sm">العملة</InputLabel>
                    <Select
                      value={balance.currency_id}
                      onChange={e =>
                        updateBalance(index, 'currency_id', e.target.value)
                      }
                      className="border-gray-300 focus:border-blue-500"
                    >
                      <option value="">اختر العملة</option>
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex-1">
                    <InputLabel className="mb-2 text-sm">المبلغ</InputLabel>
                    <NumberInput
                      placeholder="أدخل المبلغ"
                      className="w-full text-right"
                      value={balance.amount}
                      onValueChange={values =>
                        updateBalance(index, 'amount', values.value)
                      }
                      min={0}
                      decimalScale={2}
                      thousandSeparator={true}
                      dir="rtl"
                    />
                  </div>
                  {openingBalances.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCurrencyRow(index)}
                      className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="حذف العملة"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiUser className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                ملخص الصندوق
              </span>
            </div>
            <div className="text-sm text-blue-800">
              {casherId ? (
                <>
                  <div>
                    الصراف:{' '}
                    {users.find(u => u.id.toString() === casherId)?.name ||
                      'غير محدد'}
                  </div>
                  <div className="mt-1">
                    عدد العملات:{' '}
                    {
                      openingBalances.filter(b => b.currency_id && b.amount)
                        .length
                    }
                  </div>
                </>
              ) : (
                <div>يرجى تحديد الصراف أولاً</div>
              )}
            </div>
          </div>
        </div>
      </DialogModal.Content>

      <DialogModal.Footer>
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={handleClose} disabled={isSubmitting}>
            إلغاء
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !casherId ||
              openingBalances.some(b => !b.currency_id || !b.amount)
            }
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة الصندوق'}
          </PrimaryButton>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
}
