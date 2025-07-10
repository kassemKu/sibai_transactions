import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import TextInput from '@/Components/TextInput';
import NumberInput from '@/Components/NumberInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Currency } from '@/types';
import { FiSave, FiLoader } from 'react-icons/fi';

interface CurrencyEditModalProps {
  currency: Currency | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CurrencyFormData {
  name: string;
  rate_to_usd: string;
}

interface CurrencyFormErrors {
  name?: string;
  rate_to_usd?: string;
}

export default function CurrencyEditModal({
  currency,
  isOpen,
  onClose,
  onSuccess,
}: CurrencyEditModalProps) {
  const [formData, setFormData] = useState<CurrencyFormData>({
    name: '',
    rate_to_usd: '',
  });
  const [errors, setErrors] = useState<CurrencyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when currency changes or modal opens
  useEffect(() => {
    if (currency && isOpen) {
      setFormData({
        name: currency.name,
        rate_to_usd: currency.rate_to_usd.toString(),
      });
      setErrors({});
    }
  }, [currency, isOpen]);

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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!currency || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        rate_to_usd: parseFloat(formData.rate_to_usd),
      };

      await axios.put(`/admin/currencies/${currency.id}`, payload);
      toast.success('تم تحديث العملة بنجاح');
      onSuccess();
      onClose();
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

  // Handle button press for Hero UI Button
  const handleButtonSubmit = () => {
    handleSubmit();
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', rate_to_usd: '' });
      setErrors({});
      onClose();
    }
  };

  if (!currency) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'bg-white',
        body: 'p-0',
        header: 'border-b border-gray-200 px-6 py-4',
        footer: 'border-t border-gray-200 px-6 py-4',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">
            تعديل العملة: {currency.name}
          </h2>
          <p className="text-sm text-gray-600">
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
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputLabel htmlFor="modal-name">اسم العملة *</InputLabel>
              <TextInput
                id="modal-name"
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="مثال: الدولار الأمريكي"
                className="mt-1 block w-full"
                autoFocus
                disabled={isSubmitting}
              />
              {errors.name && (
                <InputError message={errors.name} className="mt-2" />
              )}
            </div>

            <div>
              <InputLabel htmlFor="modal-rate">
                سعر الصرف مقابل الدولار *
              </InputLabel>
              <NumberInput
                id="modal-rate"
                value={formData.rate_to_usd}
                onChange={value => handleInputChange('rate_to_usd', value)}
                placeholder="مثال: 1.0"
                decimalScale={6}
                min={0}
                className="mt-1 block w-full"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                كم وحدة من هذه العملة تساوي 1 دولار أمريكي (مثال: 1.0 للدولار،
                0.85 لليورو)
              </p>
              {errors.rate_to_usd && (
                <InputError message={errors.rate_to_usd} className="mt-2" />
              )}
            </div>
          </form>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end space-x-3 space-x-reverse">
          <Button
            variant="light"
            onPress={handleClose}
            isDisabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            color="primary"
            onPress={handleButtonSubmit}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            startContent={
              isSubmitting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
