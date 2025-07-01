import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';
import { CurrenciesResponse } from '@/types';

interface TransactionFormProps {
  currencies: CurrenciesResponse;
}

export default function TransactionForm({ currencies }: TransactionFormProps) {
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate currency conversion
  const calculateCurrency = useCallback(async () => {
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      setCalculatedAmount('');
      return;
    }

    setIsCalculating(true);
    try {
      const query = new URLSearchParams({
        from_currency_id: fromCurrency,
        to_currency_id: toCurrency,
        amount_original: amount,
      }).toString();

      const response = await fetch(`/transactions/calc?${query}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN':
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCalculatedAmount(data.calculated_amount || '0');
      } else {
        console.error('Failed to calculate currency');
        setCalculatedAmount('خطأ في الحساب');
      }
    } catch (error) {
      console.error('Error calculating currency:', error);
      setCalculatedAmount('خطأ في الحساب');
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

  // Reset form
  const resetForm = useCallback(() => {
    setFromCurrency('');
    setToCurrency('');
    setAmount('');
    setCalculatedAmount('');
  }, []);

  return (
    <div className="w-full mb-8">
      <Card>
        <CardContent className="p-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-bold-x18 text-text-black">عملية جديدة</div>
              <div className="text-med-x14 text-text-grey-light">
                إنشاء عملية تحويل جديدة
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">من</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="from_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="from_currency"
                      aria-label="اختر العملة المصدر"
                      placeholder="اختر العملة"
                      value={fromCurrency}
                      onChange={e => setFromCurrency(e.target.value)}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <InputLabel htmlFor="from_amount" className="mb-2">
                      المبلغ
                    </InputLabel>
                    <TextInput
                      id="from_amount"
                      type="number"
                      placeholder="أدخل المبلغ"
                      className="w-full"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-bold-x16 text-text-black">إلى</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel htmlFor="to_currency" className="mb-2">
                      اختر العملة
                    </InputLabel>
                    <Select
                      id="to_currency"
                      aria-label="اختر العملة الهدف"
                      placeholder="اختر العملة"
                      value={toCurrency}
                      onChange={e => setToCurrency(e.target.value)}
                    >
                      {currencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <InputLabel htmlFor="to_amount" className="mb-2">
                      المبلغ المحسوب
                    </InputLabel>
                    <div className="relative">
                      <TextInput
                        id="to_amount"
                        type="text"
                        placeholder={
                          isCalculating
                            ? 'جاري الحساب...'
                            : 'سيتم الحساب تلقائياً'
                        }
                        className="w-full bg-gray-50"
                        value={
                          isCalculating ? 'جاري الحساب...' : calculatedAmount
                        }
                        readOnly
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

            <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
              <div className="text-med-x14 flex flex-col items-start gap-2">
                <span className="text-[#6B7280] text-med-x14">
                  يتم تسليم العميل مبلغ
                </span>
                <span className="text-bold-x20 text-[#10B981] font-bold">
                  {calculatedAmount
                    ? `${calculatedAmount} ${currencies.find(c => c.id.toString() === toCurrency)?.code || ''}`
                    : '0.00'}
                </span>
              </div>
              <div className="flex gap-3">
                <SecondaryButton onClick={resetForm}>
                  اعاده التعيين
                </SecondaryButton>
                <PrimaryButton disabled={!calculatedAmount || isCalculating}>
                  تنفيذ العملية
                </PrimaryButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
