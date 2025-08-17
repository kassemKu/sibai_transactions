import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FiDollarSign, FiDownload, FiExternalLink } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import { route } from 'ziggy-js';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface CurrencyBalance {
  currency_id: number;
  currency: {
    id: number;
    name: string;
    code: string;
    rate_to_usd?: string | number;
  };
  opening_balance: number;
  total_in: number;
  total_out: number;
  actual_closing_balance: number;
}

interface CashSession {
  id: number;
  opened_at: string;
  closed_at: string;
  opened_by: {
    id: number;
    name: string;
  };
  closed_by: {
    id: number;
    name: string;
  };
  status: string;
  cash_balances: CurrencyBalance[];
}

export default function CashBalancesIndex() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch latest closed session data on component mount
  useEffect(() => {
    fetchLatestSession();
  }, []);

  const fetchLatestSession = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/admin/cash-sessions/latest');
      if (response.data.status || response.data.success) {
        const sessionData = response.data.data?.report || response.data.report;
        setSession(sessionData);
      }
    } catch (error) {
      console.error('Error fetching latest session:', error);
      toast.error('فشل في جلب بيانات آخر جلسة مغلقة');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert amount to USD using exchange rate
  const convertToUSD = (
    amount: number | string,
    currency: CurrencyBalance['currency'],
  ) => {
    // Handle null/undefined rates
    if (!currency.rate_to_usd) return 0;

    const rate = parseFloat(currency.rate_to_usd.toString());
    const numericAmount = parseFloat(amount.toString());

    // Handle invalid rates or amounts
    if (isNaN(rate) || rate <= 0 || isNaN(numericAmount)) return 0;

    // If currency is already USD, return amount as is
    if (currency.code === 'USD') return numericAmount;

    // Convert to USD: amount / rate_to_usd
    return numericAmount / rate;
  };

  // Calculate total balance in USD
  const getTotalBalanceUSD = () => {
    if (!session?.cash_balances) return 0;

    return session.cash_balances.reduce((total, balance) => {
      const usdAmount = convertToUSD(
        balance.actual_closing_balance,
        balance.currency,
      );
      return total + usdAmount;
    }, 0);
  };

  // Helper function to format amount for display
  const formatDisplayAmount = (amount: number) => {
    // Handle NaN values
    if (isNaN(amount)) return '0.00';

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('ar-EG'),
        time: date.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
    } catch (error) {
      return { date: 'غير متاح', time: 'غير متاح' };
    }
  };

  // Navigate to session details
  const handleViewSession = () => {
    if (session) {
      router.get(`/admin/cash-sessions/${session.id}`);
    }
  };

  // Format date and time for PDF (English format)
  const formatDateTimeForPDF = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${dateStr} ${timeStr}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Export to PDF - simple table-based approach
  const handleExportPDF = async () => {
    if (!session) return;

    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add title
      pdf.setFontSize(16);
      pdf.text('Cash Balances Report', 105, 20, { align: 'center' });

      // Add session info
      pdf.setFontSize(12);
      pdf.text(`Session #${session.id}`, 20, 35);
      pdf.text(`Closed: ${formatDateTimeForPDF(session.closed_at)}`, 20, 45);
      pdf.text(`Closed by: ${session.closed_by?.name || 'N/A'}`, 20, 55);

      // Table headers
      const startY = 70;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Currency', 20, startY);
      pdf.text('Code', 80, startY);
      pdf.text('Balance', 110, startY);
      pdf.text('USD Value', 150, startY);
      pdf.text('Rate', 185, startY);

      // Draw header line
      pdf.line(20, startY + 2, 200, startY + 2);

      // Table data
      pdf.setFont('helvetica', 'normal');
      let currentY = startY + 10;
      session.cash_balances.forEach(balance => {
        const usdValue = convertToUSD(
          balance.actual_closing_balance,
          balance.currency,
        );
        const rate = parseFloat(
          balance.currency.rate_to_usd?.toString() || '1',
        );

        // Use English currency names to avoid Arabic rendering issues
        const currencyNames: { [key: string]: string } = {
          USD: 'US Dollar',
          SYP: 'Syrian Pound',
          TRY: 'Turkish Lira',
          EUR: 'Euro',
          JOD: 'Jordanian Dinar',
          SAR: 'Saudi Riyal',
          AED: 'UAE Dirham',
          GBP: 'British Pound',
        };

        const currencyName =
          currencyNames[balance.currency.code] || balance.currency.code;

        pdf.text(currencyName, 20, currentY);
        pdf.text(balance.currency.code, 80, currentY);
        pdf.text(
          formatDisplayAmount(balance.actual_closing_balance),
          110,
          currentY,
        );
        pdf.text(`$${formatDisplayAmount(usdValue)}`, 150, currentY);
        pdf.text(
          balance.currency.code === 'USD' ? '1.00' : formatDisplayAmount(rate),
          185,
          currentY,
        );

        currentY += 8;
      });

      // Total
      pdf.line(20, currentY + 2, 200, currentY + 2);
      currentY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(
        `Total USD Value: $${formatDisplayAmount(getTotalBalanceUSD())}`,
        20,
        currentY,
      );

      // Save the PDF
      const fileName = `cash-balances-session-${session.id}.pdf`;
      pdf.save(fileName);

      toast.success('تم تصدير PDF بنجاح');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('فشل في تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <RootLayout
      title="أرصدة الصندوق"
      breadcrumbs={[
        { label: 'الرئيسية', href: route('dashboard') },
        { label: 'أرصدة الصندوق' },
      ]}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">أرصدة الصندوق</h1>
        <p className="text-gray-600">
          عرض الأرصدة الحالية لجميع العملات بناءً على آخر جلسة مغلقة
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white shadow rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
          </div>
        </div>
      ) : session ? (
        <div className="space-y-6">
          {/* Session Info Header */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="bg-blue-50 rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 text-lg">
                    البيانات من جلسة #{session.id}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    أغلقت في: {formatDateTime(session.closed_at).date} -{' '}
                    {formatDateTime(session.closed_at).time}
                  </p>
                  {session.closed_by && (
                    <p className="text-sm text-blue-600 mt-1">
                      بواسطة: {session.closed_by.name}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <SecondaryButton
                    onClick={handleViewSession}
                    className="flex items-center"
                  >
                    <FiExternalLink className="w-4 h-4 ml-1" />
                    عرض الجلسة
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center"
                  >
                    <FiDownload className="w-4 h-4 ml-1" />
                    {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* Balances Table */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <Table aria-label="جدول الأرصدة النقدية" className="min-w-full">
                  <TableHeader>
                    <TableColumn>العملة</TableColumn>
                    <TableColumn>الرصيد الحالي</TableColumn>
                    <TableColumn>القيمة بالدولار</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {session.cash_balances.map(balance => {
                      const usdValue = convertToUSD(
                        balance.actual_closing_balance,
                        balance.currency,
                      );

                      return (
                        <TableRow key={balance.currency_id}>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              {balance.currency.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {balance.currency.code}
                              {balance.currency.code !== 'USD' &&
                                balance.currency.rate_to_usd && (
                                  <div className="text-xs text-gray-400">
                                    1 USD ={' '}
                                    {formatDisplayAmount(
                                      parseFloat(
                                        balance.currency.rate_to_usd.toString(),
                                      ),
                                    )}{' '}
                                    {balance.currency.code}
                                  </div>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDisplayAmount(
                                balance.actual_closing_balance,
                              )}{' '}
                              {balance.currency.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              ${formatDisplayAmount(usdValue)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="bg-gray-50 rounded-t-lg p-4">
              <h4 className="font-medium text-gray-900 text-right text-lg">
                ملخص الأرصدة
              </h4>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  إجمالي الرصيد (بالدولار):
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${formatDisplayAmount(getTotalBalanceUSD())}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <FiDollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد جلسات مغلقة متاحة
            </h3>
            <p className="text-sm text-gray-500">
              لا توجد جلسات نقدية مغلقة لعرض الأرصدة
            </p>
          </div>
        </div>
      )}
    </RootLayout>
  );
}
