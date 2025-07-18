import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CompaniesEditProps {
  company: Company;
}

export default function CompaniesEdit({ company }: CompaniesEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: company.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('companies.update', company.id));
  };

  return (
    <RootLayout
      title="تعديل الشركة"
      breadcrumbs={[
        { label: 'الشركات', href: route('companies.index') },
        { label: company.name, href: route('companies.show', company.id) },
        { label: 'تعديل' },
      ]}
      headerActions={
        <Link href={route('companies.show', company.id)}>
          <SecondaryButton className="text-sm">
            <FiArrowLeft className="w-4 h-4 ml-2" />
            العودة للتفاصيل
          </SecondaryButton>
        </Link>
      }
    >
      <Head title={`تعديل ${company.name}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تعديل الشركة</h1>
        <p className="text-gray-600">تعديل بيانات الشركة: {company.name}</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <InputLabel htmlFor="name" value="اسم الشركة" />
            <TextInput
              id="name"
              type="text"
              className="mt-1 block w-full"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              required
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 space-x-reverse">
            <Link href={route('companies.show', company.id)}>
              <SecondaryButton type="button">إلغاء</SecondaryButton>
            </Link>
            <PrimaryButton type="submit" disabled={processing}>
              <FiSave className="w-4 h-4 ml-2" />
              {processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </RootLayout>
  );
}

import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CompaniesEditProps {
  company: Company;
}

export default function CompaniesEdit({ company }: CompaniesEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: company.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('companies.update', company.id));
  };

  return (
    <RootLayout
      title="تعديل الشركة"
      breadcrumbs={[
        { label: 'الشركات', href: route('companies.index') },
        { label: company.name, href: route('companies.show', company.id) },
        { label: 'تعديل' },
      ]}
      headerActions={
        <Link href={route('companies.show', company.id)}>
          <SecondaryButton className="text-sm">
            <FiArrowLeft className="w-4 h-4 ml-2" />
            العودة للتفاصيل
          </SecondaryButton>
        </Link>
      }
    >
      <Head title={`تعديل ${company.name}`} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تعديل الشركة</h1>
        <p className="text-gray-600">تعديل بيانات الشركة: {company.name}</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <InputLabel htmlFor="name" value="اسم الشركة" />
            <TextInput
              id="name"
              type="text"
              className="mt-1 block w-full"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              required
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 space-x-reverse">
            <Link href={route('companies.show', company.id)}>
              <SecondaryButton type="button">إلغاء</SecondaryButton>
            </Link>
            <PrimaryButton type="submit" disabled={processing}>
              <FiSave className="w-4 h-4 ml-2" />
              {processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </RootLayout>
  );
}
