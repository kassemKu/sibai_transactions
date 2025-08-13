import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
  FiEdit2,
  FiArrowLeft,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import CompanyEditModal from '@/Components/Companies/CompanyEditModal';
import DialogModal from '@/Components/DialogModal';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface Currency {
  id: number;
  name: string;
  code: string;
  rate_to_usd: string;
  sell_rate_to_usd: string;
  buy_rate_to_usd: string;
  created_at: string;
  updated_at: string;
}

interface Transfer {
  id: number;
  company_id: number;
  currency_id: number;
  amount: string;
  type: string;
  created_at: string;
  updated_at: string;
  company: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  currency: Currency;
}

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  transfers?: Transfer[];
  address?: string;
  phone?: string;
  email?: string;
}

interface PaginatedTransfers {
  current_page: number;
  data: Transfer[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface CompaniesShowProps {
  company: Company;
  transfers: PaginatedTransfers;
  total_incoming: number;
  total_outgoing: number;
  admin_position: 'debtor' | 'creditor' | 'neutral';
  currency_balances: Array<{
    currency: { id: number; name: string; code: string };
    total_incoming: number;
    total_outgoing: number;
    net: number;
  }>;
}

export default function CompaniesShow({
  company,
  transfers,
  total_incoming,
  total_outgoing,
  admin_position,
  currency_balances,
}: CompaniesShowProps) {
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [currentCompany, setCurrentCompany] = React.useState(company);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Optionally, refresh company data after edit
  const handleEditSuccess = () => {
    router.visit(route('companies.show', company.id));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/admin/companies/${company.id}`);
      setDeleteModalOpen(false);
      router.visit('/admin/companies');
    } catch (e) {
      // Optionally show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  // console.log(company);
  // console.log(transfers);

  return (
    <RootLayout
      title={company.name}
      breadcrumbs={[
        { label: 'الشركات', href: route('companies.index') },
        { label: company.name },
      ]}
      headerActions={
        <div className="flex items-center space-x-3 space-x-reverse">
          <PrimaryButton
            className="text-sm"
            onClick={() => setEditModalOpen(true)}
          >
            <FiEdit2 className="w-4 h-4 ml-2" />
            تعديل
          </PrimaryButton>
          <SecondaryButton
            className="text-sm bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-900"
            onClick={() => setDeleteModalOpen(true)}
          >
            حذف الشركة
          </SecondaryButton>
          <Link href={route('companies.index')}>
            <SecondaryButton className="text-sm">
              <FiArrowLeft className="w-4 h-4 ml-2" />
              العودة للقائمة
            </SecondaryButton>
          </Link>
        </div>
      }
    >
      <Head title={company.name} />

      {/* Delete Confirmation Modal */}
      <DialogModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="sm"
      >
        <DialogModal.Content title="تأكيد حذف الشركة">
          <div className="text-center p-4">
            <p className="text-lg font-semibold text-red-700 mb-4">
              هل أنت متأكد أنك تريد حذف هذه الشركة؟
            </p>
            <p className="text-gray-600 mb-2">
              سيتم حذف جميع بيانات الشركة ولا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
        </DialogModal.Content>
        <DialogModal.Footer>
          <div className="flex justify-end gap-2">
            <SecondaryButton
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              إلغاء
            </SecondaryButton>
            <PrimaryButton
              className="bg-red-600 hover:bg-red-700 border-red-600"
              onClick={handleDelete}
              //   isLoading={isDeleting}
              disabled={isDeleting}
            >
              حذف نهائي
            </PrimaryButton>
          </div>
        </DialogModal.Footer>
      </DialogModal>

      {/* Edit Modal */}
      <CompanyEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        company={currentCompany}
        onSuccess={handleEditSuccess}
      />

      {/* Combined Info & Stats Card */}
      <div className="mb-8  mx-auto">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 flex flex-col md:grid-cols-3 md:space-x-12 md:space-x-reverse items-stretch">
          {/* Company Info */}
          <div className=" mb-8 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              معلومات الشركة
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    تاريخ الإنشاء
                  </p>
                  <p className="text-gray-900">
                    {new Date(company.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">آخر تحديث</p>
                  <p className="text-gray-900">
                    {new Date(company.updated_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">العنوان</p>
                <p className="text-gray-900">{company.address || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">الهاتف</p>
                <p className="text-gray-900">{company.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  البريد الإلكتروني
                </p>
                <p className="text-gray-900">{company.email || '—'}</p>
              </div>
            </div>
          </div>
          {/* Statistics */}
          <div className="md:col-span-2 md:pl-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إحصائيات</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">عدد التحويلات</span>
                <span className="text-sm font-medium text-gray-900">
                  {transfers.total}
                </span>
              </div>
              {/* Per-currency breakdown */}
              {currency_balances && currency_balances.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    تفصيل حسب العملة
                  </h4>
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="جدول تفصيل العملات"
                      className="min-w-full"
                    >
                      <TableHeader>
                        <TableColumn>العملة</TableColumn>
                        <TableColumn>الوارد</TableColumn>
                        <TableColumn>الصادر</TableColumn>
                        <TableColumn>الصافي</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {currency_balances.map((cb, idx) => (
                          <TableRow key={cb.currency.id}>
                            <TableCell>
                              <div className="font-bold">
                                {cb.currency.name} ({cb.currency.code})
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-green-700 font-medium">
                                {cb.total_incoming.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-red-700 font-medium">
                                {cb.total_outgoing.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div
                                className={`font-bold text-center px-2 py-1 rounded-full ${
                                  cb.net > 0
                                    ? 'bg-green-100 text-green-800'
                                    : cb.net < 0
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {cb.net > 0 && (
                                  <span title="دائن">
                                    {cb.net.toLocaleString()} دائن
                                  </span>
                                )}
                                {cb.net < 0 && (
                                  <span title="مدين">
                                    {Math.abs(cb.net).toLocaleString()} مدين
                                  </span>
                                )}
                                {cb.net === 0 && (
                                  <span title="متوازن">متوازن</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {/* End per-currency breakdown */}
              {/* Placeholder for future unified global total (using exchange rates) */}
              {/* <div className="mt-6">هنا يمكن عرض الإجمالي الموحد بعد التحويل للعملة الأساسية في المستقبل</div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Transfers Section */}
      {transfers.data && transfers.data.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              التحويلات
            </h2>

            <div className="overflow-x-auto">
              <Table aria-label="جدول التحويلات" className="min-w-full">
                <TableHeader>
                  <TableColumn>المبلغ</TableColumn>
                  <TableColumn>العملة</TableColumn>
                  <TableColumn>النوع</TableColumn>
                  <TableColumn>التاريخ</TableColumn>
                </TableHeader>
                <TableBody>
                  {transfers.data.map(transfer => (
                    <TableRow
                      key={transfer.id}
                      className={
                        transfer.type === 'in'
                          ? 'bg-green-50'
                          : transfer.type === 'out'
                            ? 'bg-red-50'
                            : ''
                      }
                    >
                      <TableCell>
                        <div
                          className={`text-sm font-medium ${transfer.type === 'in' ? 'text-green-800' : 'text-red-800'}`}
                        >
                          {transfer.type === 'in' ? (
                            <span
                              title="وارد"
                              className="inline-flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-1 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              {parseFloat(transfer.amount).toLocaleString()}
                            </span>
                          ) : (
                            <span
                              title="صادر"
                              className="inline-flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-1 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 20V4m8 8H4"
                                />
                              </svg>
                              {parseFloat(transfer.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {transfer.currency.name} ({transfer.currency.code})
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm font-bold ${transfer.type === 'in' ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {transfer.type === 'in' ? 'وارد' : 'صادر'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(transfer.created_at).toLocaleDateString(
                            'ar-EG',
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {transfers.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  عرض {transfers.from} إلى {transfers.to} من {transfers.total}{' '}
                  نتيجة
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {/* Previous Page */}
                  {transfers.prev_page_url && (
                    <button
                      onClick={() => {
                        const url = new URL(transfers.prev_page_url!);
                        router.get(url.pathname + url.search);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      title="الصفحة السابقة"
                    >
                      <FiChevronRight className="w-4 h-4 ml-1" />
                      السابق
                    </button>
                  )}

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    {transfers.links.map((link, index) => {
                      if (link.url === null && !link.active) {
                        return (
                          <span
                            key={index}
                            className="px-3 py-2 text-sm text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (link.url) {
                              const url = new URL(link.url);
                              router.get(url.pathname + url.search);
                            }
                          }}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            link.active
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                          title={`الصفحة ${link.label.replace(/[^0-9]/g, '')}`}
                        />
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  {transfers.next_page_url && (
                    <button
                      onClick={() => {
                        const url = new URL(transfers.next_page_url!);
                        router.get(url.pathname + url.search);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      title="الصفحة التالية"
                    >
                      التالي
                      <FiChevronLeft className="w-4 h-4 mr-1" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </RootLayout>
  );
}
