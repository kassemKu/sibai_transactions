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
  Spinner,
} from '@heroui/react';
import TransactionForm from './Dashboard/TransactionForm';
import { CurrenciesResponse } from '@/types';

interface Transaction {
  id: number;
  from_currency_id: number;
  to_currency_id: number;
  original_amount: number;
  converted_amount: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  from_currency?: {
    id: number;
    name: string;
    code: string;
  };
  to_currency?: {
    id: number;
    name: string;
    code: string;
  };
  assigned_to?: {
    id: number;
    name: string;
    email: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface EditTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: number | string;
  currencies: CurrenciesResponse;
  availableCashers: User[];
  isSessionOpen?: boolean;
  isSessionPending?: boolean;
}

export default function EditTransactionModal({
  open,
  onClose,
  transactionId,
  currencies,
  availableCashers,
  isSessionOpen = true,
  isSessionPending = false,
}: EditTransactionModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromCurrency: '',
    toCurrency: '',
    amount: '',
    calculatedAmount: '',
    notes: '',
    assignedTo: '',
  });

  // Debug: Add a handler to log user input changes
  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Debug: Log when modal opens/closes and transactionId changes
  useEffect(() => {
   
    if (open && transactionId) {
      fetchTransactionData();
    }
    if (!open) {
   
      setTransaction(null);
      setFormData({
        fromCurrency: '',
        toCurrency: '',
        amount: '',
        calculatedAmount: '',
        notes: '',
        assignedTo: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionId]);




  const fetchTransactionData = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `/admin/transactions/${transactionId}/data`,
      );
      if (response.data.status && response.data.data) {
        const transactionData = response.data.data.data;
        setTransaction(transactionData);
      
        setFormData({
          fromCurrency: transactionData.from_currency_id?.toString() || '',
          toCurrency: transactionData.to_currency_id?.toString() || '',
          amount: transactionData.original_amount?.toString() || '',
          calculatedAmount: transactionData.converted_amount?.toString() || '',
          notes: transactionData.notes || '',
          assignedTo: transactionData.assigned_to?.id?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      let message = 'حدث خطأ أثناء تحميل بيانات المعاملة';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formValues: any) => {
    if (!transaction) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        from_currency_id: parseInt(formValues.fromCurrency),
        to_currency_id: parseInt(formValues.toCurrency),
        original_amount: parseFloat(formValues.amount),
        converted_amount: parseFloat(formValues.calculatedAmount),
        notes: formValues.notes?.trim() || '',
        ...(formValues.assignedTo
          ? { assigned_to: parseInt(formValues.assignedTo) }
          : {}),
      };

      const response = await axios.put(
        `/admin/transactions/${transactionId}`,
        updateData,
      );

      if (response.data.status) {
        const message = response.data.message || 'تم تحديث المعاملة بنجاح';
        toast.success(message);
        onClose();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      let message = 'حدث خطأ أثناء تحديث المعاملة';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTransaction(null);
    setFormData({
      fromCurrency: '',
      toCurrency: '',
      amount: '',
      calculatedAmount: '',
      notes: '',
      assignedTo: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      size="full"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">تعديل المعاملة</h3>
          <p className="text-sm text-gray-500">
            تعديل تفاصيل المعاملة رقم #{transactionId}
          </p>
        </ModalHeader>

        <ModalBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-gray-600">جاري تحميل بيانات المعاملة...</p>
              </div>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Transaction Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">الحالة:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status === 'completed'
                        ? 'مكتملة'
                        : transaction.status === 'pending'
                          ? 'معلقة'
                          : 'ملغية'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      تاريخ الإنشاء:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString(
                        'ar-SA',
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Form */}
              <TransactionForm
                currencies={currencies}
                isSessionOpen={isSessionOpen}
                isSessionPending={isSessionPending}
                availableCashers={availableCashers}
                formData={formData}
                onChange={handleFormDataChange}
                onSubmit={handleSubmit}
                isEditing={true}
                externalIsSubmitting={isSubmitting}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لم يتم العثور على بيانات المعاملة
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={handleClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
