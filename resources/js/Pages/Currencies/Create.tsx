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
import { FiSave, FiArrowRight, FiLoader } from 'react-icons/fi';

interface CurrencyFormData {
  name: string;
  code: string;
  rate_to_usd: string;
}

interface CurrencyFormErrors {
  name?: string;
  code?: string;
  rate_to_usd?: string;
}

export default function CurrenciesCreate() {
  const [formData, setFormData] = useState<CurrencyFormData>({
    name: '',
    code: '',
    rate_to_usd: '',
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

    if (!formData.code.trim()) {
      newErrors.code = 'رمز العملة مطلوب';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'رمز العملة يجب أن يكون 3 أحرف بالضبط';
    } else if (!/^[A-Z]{3}$/.test(formData.code)) {
      newErrors.code = 'رمز العملة يجب أن يكون 3 أحرف كبيرة باللغة الإنجليزية';
    }

    const rateValue = formData.rate_to_usd?.trim();
    if (!rateValue) {
      newErrors.rate_to_usd = 'سعر الصرف مطلوب';
    } else {
      const parsedRate = parseFloat(rateValue);
      if (isNaN(parsedRate) || parsedRate <= 0) {
        newErrors.rate_to_usd = 'سعر الصرف يجب أن يكون رقم موجب';
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
      const rateValue = parseFloat(formData.rate_to_usd);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        rate_to_usd: rateValue,
      };

      await axios.post('/admin/currencies', payload);
      toast.success('تم إنشاء العملة بنجاح');
      router.visit('/admin/currencies');
    } catch (error: any) {
      console.error('Error creating currency:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'فشل في إنشاء العملة');
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
      title="إضافة عملة جديدة"
      breadcrumbs={[
        { label: 'لوحة التحكم', href: '/admin' },
        { label: 'إدارة العملات', href: '/admin/currencies' },
        { label: 'إضافة عملة جديدة' },
      ]}
      headerActions={headerActions}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              إضافة عملة جديدة
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              أدخل تفاصيل العملة الجديدة وسعر الصرف
            </p>
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
              <InputLabel htmlFor="code">رمز العملة *</InputLabel>
              <TextInput
                id="code"
                type="text"
                value={formData.code}
                onChange={e =>
                  handleInputChange('code', e.target.value.toUpperCase())
                }
                placeholder="مثال: USD"
                maxLength={3}
                className="mt-1 block w-full font-mono"
              />
              <p className="mt-1 text-sm text-gray-500">
                رمز العملة المكون من 3 أحرف (مثال: USD, EUR, GBP)
              </p>
              {errors.code && (
                <InputError message={errors.code} className="mt-2" />
              )}
            </div>

            <div>
              <InputLabel htmlFor="rate_to_usd">
                سعر الصرف مقابل الدولار *
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
                كم وحدة من هذه العملة تساوي 1 دولار أمريكي (مثال: 1.0 للدولار،
                0.85 لليورو)
              </p>
              {errors.rate_to_usd && (
                <InputError message={errors.rate_to_usd} className="mt-2" />
              )}
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
                    حفظ العملة
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
