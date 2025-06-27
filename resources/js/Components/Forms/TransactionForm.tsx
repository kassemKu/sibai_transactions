import React from 'react';
import { useForm } from '@inertiajs/react';
import classNames from 'classnames';
import useRoute from '@/Hooks/useRoute';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface TransactionFormProps {
  currencies: Currency[];
  initialData?: {
    amount?: string;
    currency_id?: number;
    type?: 'credit' | 'debit';
    description?: string;
  };
  onCancel?: () => void;
  submitRoute: string;
  submitMethod?: 'post' | 'put' | 'patch';
  submitText?: string;
  isEditing?: boolean;
}

export default function TransactionForm({
  currencies,
  initialData = {},
  onCancel,
  submitRoute,
  submitMethod = 'post',
  submitText = 'Create Transaction',
  isEditing = false,
}: TransactionFormProps) {
  const route = useRoute();

  const form = useForm({
    amount: initialData.amount || '',
    currency_id: initialData.currency_id || currencies[0]?.id || '',
    type: initialData.type || 'credit',
    description: initialData.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitOptions = {
      onSuccess: () => {
        if (!isEditing) {
          form.reset();
        }
      },
      onError: () => {
        // Handle errors if needed
      },
    };

    if (submitMethod === 'post') {
      form.post(route(submitRoute), submitOptions);
    } else if (submitMethod === 'put') {
      form.put(route(submitRoute), submitOptions);
    } else if (submitMethod === 'patch') {
      form.patch(route(submitRoute), submitOptions);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    form.setData('amount', value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setData('currency_id', parseInt(e.target.value));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setData('type', e.target.value as 'credit' | 'debit');
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    form.setData('description', e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div>
        <InputLabel
          htmlFor="type"
          className="text-sm font-medium text-gray-700"
        >
          Transaction Type
        </InputLabel>
        <select
          id="type"
          value={form.data.type}
          onChange={handleTypeChange}
          className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
          required
          aria-label="Transaction Type"
        >
          <option value="credit">Credit (+)</option>
          <option value="debit">Debit (-)</option>
        </select>
        <InputError className="mt-2" message={form.errors.type} />
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <InputLabel
            htmlFor="amount"
            className="text-sm font-medium text-gray-700"
          >
            Amount
          </InputLabel>
          <TextInput
            id="amount"
            type="text"
            inputMode="decimal"
            className="mt-1 block w-full"
            value={form.data.amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            required
            aria-describedby={form.errors.amount ? 'amount-error' : undefined}
          />
          <InputError
            id="amount-error"
            className="mt-2"
            message={form.errors.amount}
          />
        </div>

        <div>
          <InputLabel
            htmlFor="currency_id"
            className="text-sm font-medium text-gray-700"
          >
            Currency
          </InputLabel>
          <select
            id="currency_id"
            value={form.data.currency_id}
            onChange={handleCurrencyChange}
            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            required
            aria-label="Currency"
          >
            {currencies.map(currency => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          <InputError className="mt-2" message={form.errors.currency_id} />
        </div>
      </div>

      {/* Description */}
      <div>
        <InputLabel
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </InputLabel>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
          value={form.data.description}
          onChange={handleDescriptionChange}
          placeholder="Enter transaction description..."
          aria-describedby={
            form.errors.description ? 'description-error' : undefined
          }
        />
        <InputError
          id="description-error"
          className="mt-2"
          message={form.errors.description}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={form.processing}
          >
            Cancel
          </SecondaryButton>
        )}
        <PrimaryButton
          type="submit"
          className={classNames('min-w-[120px] justify-center', {
            'opacity-75 cursor-not-allowed': form.processing,
          })}
          disabled={form.processing}
        >
          {form.processing ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            submitText
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}
