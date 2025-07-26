import React, { useState } from 'react';
import { Card } from '@heroui/react';
import TransactionForm from './TransactionForm';
import TransferForm from './TransferForm';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UnifiedFormComponentProps {
  formType: 'transaction' | 'transfer';
  setFormType: (type: 'transaction' | 'transfer') => void;
  currencies: any;
  companies: any;
  isSessionOpen: boolean;
  isSessionPending: boolean;
  onStartSession?: () => void;
  availableCashers?: User[];
  sessionKey?: string;
}

export default function UnifiedFormComponent({
  formType,
  setFormType,
  currencies,
  companies,
  isSessionOpen,
  isSessionPending,
  onStartSession,
  availableCashers = [],
  sessionKey,
}: UnifiedFormComponentProps) {
  // Add local state for formData and onChange handler
  const [formData, setFormData] = useState({
    fromCurrency: '',
    toCurrency: '',
    amount: '',
    calculatedAmount: '',
    notes: '',
    assignedTo: '',
  });
  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div className="w-full mb-8 relative">
      <Card className="p-0">
        {/* Header with Toggle */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-1">
              <div className="text-bold-x18 text-text-black">
                {formType === 'transaction' ? 'عملية جديدة' : 'تحويل جديد'}
              </div>
              <div className="text-med-x14 text-text-grey-light">
                {formType === 'transaction'
                  ? 'إنشاء عملية تحويل جديدة'
                  : 'إنشاء تحويل جديد للشركات'}
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFormType('transaction')}
                className={`flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  formType === 'transaction'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-colors ${
                    formType === 'transaction'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span>عملية جديدة</span>
              </button>
              <button
                type="button"
                onClick={() => setFormType('transfer')}
                className={`flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  formType === 'transfer'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-colors ${
                    formType === 'transfer' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span>تحويل جديد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {formType === 'transaction' ? (
            <TransactionForm
              currencies={currencies}
              isSessionOpen={isSessionOpen}
              isSessionPending={isSessionPending}
              onStartSession={onStartSession}
              availableCashers={availableCashers}
              formData={formData}
              onChange={handleFormDataChange}
              sessionKey={sessionKey}
            />
          ) : (
            <TransferForm
              currencies={currencies}
              companies={companies}
              isSessionOpen={isSessionOpen}
              isSessionPending={isSessionPending}
              onStartSession={onStartSession}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
