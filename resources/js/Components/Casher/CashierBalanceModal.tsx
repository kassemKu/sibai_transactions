import React from 'react';
import DialogModal from '@/Components/DialogModal';
import { Currency } from '@/types';
import { FiDollarSign, FiUser } from 'react-icons/fi';

interface CashierBalance {
  currency_id: number;
  amount: number;
  currency?: Currency;
}

interface Cashier {
  id: number;
  name: string;
  email: string;
  system_balances?: CashierBalance[];
}

interface CashierBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: Cashier | null;
  currencies: Currency[];
}

const CashierBalanceModal: React.FC<CashierBalanceModalProps> = ({
  isOpen,
  onClose,
  cashier,
  currencies,
}) => {
  const formatAmount = (amount: number, currency?: Currency) => {
    if (!currency) return '0.00';

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  const getCurrencyName = (currencyId: number) => {
    const currency = currencies.find(c => c.id === currencyId);
    return currency
      ? `${currency.name} (${currency.code})`
      : `Currency ${currencyId}`;
  };

  if (!cashier) return null;

  return (
    <DialogModal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <DialogModal.Content title="رصيد الصراف النظامي">
        <div className="space-y-6" dir="rtl">
          {/* Cashier Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiUser className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                معلومات الصراف
              </span>
            </div>
            <div className="text-sm text-blue-800">
              <div>الاسم: {cashier.name}</div>
              <div>البريد الإلكتروني: {cashier.email}</div>
            </div>
          </div>

          {/* Balances Table */}
          {cashier.system_balances && cashier.system_balances.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  الأرصدة النظامية
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العملة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الرصيد الافتتاحي
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        إجمالي الدخل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        إجمالي الصرف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الرصيد الحالي
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cashier.system_balances.map((balance, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {getCurrencyName(balance.currency_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-500">
                            {balance.opening_balance ?? '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-green-600">
                            {balance.total_in ?? '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-red-600">
                            {balance.total_out ?? '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-bold ${Number(balance.system_balance ?? balance.amount ?? 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}> 
                            {balance.system_balance ?? balance.amount ?? '0.00'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد أرصدة نظامية
              </h3>
              <p className="text-gray-600">
                لم يتم تعيين أي أرصدة نظامية لهذا الصراف بعد
              </p>
            </div>
          )}

          {/* Session Status */}
          {!cashier.has_active_session && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">
                  لا توجد جلسة نشطة
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                لا توجد جلسة نشطة لهذا الصراف. يرجى التواصل مع المشرف لفتح جلسة
                جديدة.
              </p>
            </div>
          )}
        </div>
      </DialogModal.Content>

      <DialogModal.Footer>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
};

export default CashierBalanceModal;
