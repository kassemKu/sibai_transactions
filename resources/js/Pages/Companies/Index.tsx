import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';
import CompanyCreateModal from '@/Components/Companies/CompanyCreateModal';
import CompanyEditModal from '@/Components/Companies/CompanyEditModal';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CompaniesIndexProps {
  companies: Company[];
}

export default function CompaniesIndex({ companies }: CompaniesIndexProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenCreate = () => setShowCreateModal(true);
  const handleCloseCreate = () => setShowCreateModal(false);
  const handleOpenEdit = (company: Company) => {
    setEditCompany(company);
    setShowEditModal(true);
  };
  const handleCloseEdit = () => {
    setEditCompany(null);
    setShowEditModal(false);
  };

  return (
    <RootLayout
      title="الشركات"
      breadcrumbs={[{ label: 'الشركات' }]}
      headerActions={
        <PrimaryButton className="text-sm" onClick={handleOpenCreate}>
          <FiPlus className="w-4 h-4 ml-2" />
          إضافة شركة جديدة
        </PrimaryButton>
      }
    >
      <Head title="الشركات" />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الشركات</h1>
        <p className="text-gray-600">إدارة الشركات والشركاء التجاريين</p>
      </div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في الشركات..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* Companies Table */}
      <div className="overflow-x-auto">
        <Table aria-label="جدول الشركات" className="min-w-full">
          <TableHeader>
            <TableColumn>#</TableColumn>
            <TableColumn>اسم الشركة</TableColumn>
            <TableColumn>تاريخ الإنشاء</TableColumn>
            <TableColumn>إجراء</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              filteredCompanies.length === 0
                ? searchTerm
                  ? 'لا توجد نتائج للبحث المحدد'
                  : 'لا توجد شركات'
                : undefined
            }
          >
            {filteredCompanies.map((company, idx) => (
              <TableRow key={company.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-bold">{company.name}</div>
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <div>
                        <span className="font-medium">العنوان:</span>{' '}
                        {company.address || '—'}
                      </div>
                      <div>
                        <span className="font-medium">الهاتف:</span>{' '}
                        {company.phone || '—'}
                      </div>
                      <div>
                        <span className="font-medium">البريد الإلكتروني:</span>{' '}
                        {company.email || '—'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(company.created_at).toLocaleDateString('ar-EG')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <a
                      href={route('companies.show', company.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <FiEye className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="تعديل"
                      onClick={() => handleOpenEdit(company)}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد شركات'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'جرب البحث بكلمات مختلفة'
              : 'ابدأ بإضافة شركة جديدة للتعامل معها'}
          </p>
          {!searchTerm && (
            <PrimaryButton onClick={handleOpenCreate}>
              <FiPlus className="w-4 h-4 ml-2" />
              إضافة شركة جديدة
            </PrimaryButton>
          )}
        </div>
      )}
      <CompanyCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreate}
        onSuccess={() => window.location.reload()}
      />
      {editCompany && (
        <CompanyEditModal
          isOpen={showEditModal}
          onClose={handleCloseEdit}
          company={editCompany}
          onSuccess={() => window.location.reload()}
        />
      )}
    </RootLayout>
  );
}
