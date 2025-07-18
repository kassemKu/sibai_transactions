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

export default function CompaniesCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('companies.store'));
  };

  return (
    <RootLayout
      title="إضافة شركة جديدة"
      breadcrumbs={[
        { label: 'الشركات', href: route('companies.index') },
        { label: 'إضافة شركة جديدة' },
      ]}
      headerActions={
        <Link href={route('companies.index')}>
          <SecondaryButton className="text-sm">
            <FiArrowLeft className="w-4 h-4 ml-2" />
            العودة للقائمة
          </SecondaryButton>
        </Link>
      }
    >
      <Head title="إضافة شركة جديدة" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          إضافة شركة جديدة
        </h1>
        <p className="text-gray-600">أدخل بيانات الشركة الجديدة</p>
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
            <Link href={route('companies.index')}>
              <SecondaryButton type="button">إلغاء</SecondaryButton>
            </Link>
            <PrimaryButton type="submit" disabled={processing}>
              <FiSave className="w-4 h-4 ml-2" />
              {processing ? 'جاري الحفظ...' : 'حفظ الشركة'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </RootLayout>
  );
}
