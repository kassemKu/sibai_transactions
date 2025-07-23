import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import NumberInput from '@/Components/NumberInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Currency } from '@/types';
import { FiSave, FiArrowRight, FiLoader } from 'react-icons/fi';

interface CurrenciesEditProps {
  currency: Currency;
}

interface CurrencyFormData {
  name: string;
  rate_to_usd: string;
  buy_rate_to_usd: string;
  sell_rate_to_usd: string;
}

interface CurrencyFormErrors {
  name?: string;
  rate_to_usd?: string;
  buy_rate_to_usd?: string;
  sell_rate_to_usd?: string;
}

export default function CurrenciesEdit({ currency }: CurrenciesEditProps) {
  const [formData, setFormData] = useState<CurrencyFormData>({
    name: currency.name,
    rate_to_usd: currency.rate_to_usd.toString(),
    buy_rate_to_usd: currency.buy_rate_to_usd.toString(),
    sell_rate_to_usd: currency.sell_rate_to_usd.toString(),
  });
  const [errors, setErrors] = useState<CurrencyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (field: keyof CurrencyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: CurrencyFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم العملة مطلوب';
    }

    const referenceRateValue = formData.rate_to_usd?.trim();
    if (!referenceRateValue) {
      newErrors.rate_to_usd = 'السعر المرجعي مطلوب';
    } else {
      const parsedReferenceRate = parseFloat(referenceRateValue);
      if (isNaN(parsedReferenceRate) || parsedReferenceRate <= 0) {
        newErrors.rate_to_usd = 'السعر المرجعي يجب أن يكون رقم موجب';
      }
    }

    const buyRateValue = formData.buy_rate_to_usd?.trim();
    if (!buyRateValue) {
      newErrors.buy_rate_to_usd = 'سعر الشراء مطلوب';
    } else {
      const parsedBuyRate = parseFloat(buyRateValue);
      if (isNaN(parsedBuyRate) || parsedBuyRate <= 0) {
        newErrors.buy_rate_to_usd = 'سعر الشراء يجب أن يكون رقم موجب';
      }
    }

    const sellRateValue = formData.sell_rate_to_usd?.trim();
    if (!sellRateValue) {
      newErrors.sell_rate_to_usd = 'سعر البيع مطلوب';
    } else {
      const parsedSellRate = parseFloat(sellRateValue);
      if (isNaN(parsedSellRate) || parsedSellRate <= 0) {
        newErrors.sell_rate_to_usd = 'سعر البيع يجب أن يكون رقم موجب';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        rate_to_usd: parseFloat(formData.rate_to_usd),
        buy_rate_to_usd: parseFloat(formData.buy_rate_to_usd),
        sell_rate_to_usd: parseFloat(formData.sell_rate_to_usd),
      };

      await axios.put(`/admin/currencies/${currency.id}`, payload);
      toast.success('تم تحديث العملة بنجاح');
      router.visit('/admin/currencies');
    } catch (error: any) {
      console.error('Error updating currency:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'فشل في تحديث العملة');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.visit('/admin/currencies');
  };

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <SecondaryButton onClick={handleCancel} disabled={isSubmitting}>
        <FiArrowRight className="w-4 h-4 ml-2" />
        العودة للقائمة
      </SecondaryButton>
    </div>
  );

  return (
    <RootLayout
      title={`تعديل العملة: ${currency.name}`}
      breadcrumbs={[
        { label: 'لوحة التحكم', href: '/admin' },
        { label: 'إدارة العملات', href: '/admin/currencies' },
        { label: `تعديل ${currency.name}` },
      ]}
      headerActions={headerActions}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              تعديل العملة: {currency.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              تحديث تفاصيل العملة وسعر الصرف
            </p>
            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">
                الرمز:{' '}
                <span className="font-mono font-medium">{currency.code}</span>
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currency.is_crypto
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {currency.is_crypto ? 'رقمية' : 'تقليدية'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <InputLabel htmlFor="name">اسم العملة *</InputLabel>
              <TextInput
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="مثال: الدولار الأمريكي"
                className="mt-1 block w-full"
                autoFocus
              />
              {errors.name && (
                <InputError message={errors.name} className="mt-2" />
              )}
            </div>

            <div>
              <InputLabel htmlFor="rate_to_usd">
                السعر المرجعي مقابل الدولار *
              </InputLabel>
              <NumberInput
                id="rate_to_usd"
                value={formData.rate_to_usd}
                onChange={value => handleInputChange('rate_to_usd', value)}
                placeholder="مثال: 1.0"
                decimalScale={6}
                min={0}
                className="mt-1 block w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                السعر المرجعي للعملة مقابل الدولار الأمريكي
              </p>
              {errors.rate_to_usd && (
                <InputError message={errors.rate_to_usd} className="mt-2" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel htmlFor="buy_rate_to_usd">
                  سعر الشراء مقابل الدولار *
                </InputLabel>
                <NumberInput
                  id="buy_rate_to_usd"
                  value={formData.buy_rate_to_usd}
                  onChange={value =>
                    handleInputChange('buy_rate_to_usd', value)
                  }
                  placeholder="مثال: 1.0"
                  decimalScale={6}
                  min={0}
                  className="mt-1 block w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  سعر شراء العملة مقابل الدولار
                </p>
                {errors.buy_rate_to_usd && (
                  <InputError
                    message={errors.buy_rate_to_usd}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <InputLabel htmlFor="sell_rate_to_usd">
                  سعر البيع مقابل الدولار *
                </InputLabel>
                <NumberInput
                  id="sell_rate_to_usd"
                  value={formData.sell_rate_to_usd}
                  onChange={value =>
                    handleInputChange('sell_rate_to_usd', value)
                  }
                  placeholder="مثال: 1.0"
                  decimalScale={6}
                  min={0}
                  className="mt-1 block w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  سعر بيع العملة مقابل الدولار
                </p>
                {errors.sell_rate_to_usd && (
                  <InputError
                    message={errors.sell_rate_to_usd}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse pt-6 border-t border-gray-200">
              <SecondaryButton onClick={handleCancel} disabled={isSubmitting}>
                إلغاء
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </RootLayout>
  );
}
