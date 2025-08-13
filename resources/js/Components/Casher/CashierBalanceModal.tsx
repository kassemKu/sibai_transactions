import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DialogModal from '@/Components/DialogModal';
import { Currency } from '@/types';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import PrimaryButton from '../PrimaryButton';

interface CashierBalance {
  currency_id: number;
  name: string;
  code: string;
  opening_balance: number;
  total_in: number;
  total_out: number;
  system_balance: number;
}

interface CashierBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
}

const CashierBalanceModal: React.FC<CashierBalanceModalProps> = ({
  isOpen,
  onClose,
  currencies,
}) => {
  const [balances, setBalances] = useState<CashierBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/casher/my_balances');
      if (response.data.status) {
        setBalances(response.data.data.balances.system_closing_balances || []);
      } else {
        setError(response.data.message || 'حدث خطأ أثناء جلب الأرصدة');
      }
    } catch (error: any) {
      console.error('Error fetching balances:', error);
      let message = 'حدث خطأ أثناء جلب الأرصدة';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          message = 'لا توجد جلسة نقدية نشطة';
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBalances();
    }
  }, [isOpen]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red';
    return 'text-gray-600';
  };

  const handleRefresh = () => {
    fetchBalances();
  };

  return (
    <DialogModal isOpen={isOpen} onClose={onClose} maxWidth="6xl">
      <DialogModal.Content title="رصيدي الحالي">
        <div className="space-y-6" dir="rtl">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              عرض الأرصدة الحالية لكل عملة في جلستك النقدية
            </div>
            <PrimaryButton
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              تحديث
            </PrimaryButton>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-3 text-gray-600">جاري تحميل الأرصدة...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">خطأ</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Balances Table */}
          {!isLoading && !error && balances.length > 0 && (
            <div className="overflow-x-auto">
              <Table aria-label="جدول أرصدة الصراف" className="min-w-full">
                <TableHeader>
                  <TableColumn>العملة</TableColumn>
                  <TableColumn>رصيد الأفتتاحى</TableColumn>
                  <TableColumn>إجمالي الداخل</TableColumn>
                  <TableColumn>إجمالي الخارج</TableColumn>
                  <TableColumn>الرصيد الحالي</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent={
                    balances.length === 0 ? 'لا توجد أرصدة متاحة' : undefined
                  }
                >
                  {balances.map(balance => (
                    <TableRow key={balance.currency_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {balance.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {balance.code}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(balance.opening_balance)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FiTrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            {formatAmount(balance.total_in)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FiTrendingDown className="w-3 h-3 text-red-500" />
                          <span className="text-sm font-medium text-red">
                            {formatAmount(balance.total_out)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm font-bold ${getBalanceColor(balance.system_balance)}`}
                        >
                          {formatAmount(balance.system_balance)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && balances.length === 0 && (
            <div className="text-center py-8">
              <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">لا توجد أرصدة متاحة</div>
              <div className="text-sm text-gray-400 mt-1">
                تأكد من وجود جلسة نقدية نشطة
              </div>
            </div>
          )}
        </div>
      </DialogModal.Content>

      <DialogModal.Footer>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
};

export default CashierBalanceModal;
