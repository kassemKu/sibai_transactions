import React from 'react';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { FiSave } from 'react-icons/fi';

interface CompanyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CompanyCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: CompanyCreateModalProps) {
  const [data, setData] = React.useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [processing, setProcessing] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  }>({});

  const reset = () => {
    setData({ name: '', address: '', phone: '', email: '' });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await axios.post('/admin/companies', data);
      reset();
      onSuccess && onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <DialogModal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <DialogModal.Content title="إضافة شركة جديدة">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <InputLabel htmlFor="name" value="اسم الشركة" />
            <TextInput
              id="name"
              type="text"
              className="mt-1 block w-full"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              required
              autoFocus
            />
            <InputError message={errors.name} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="address" value="العنوان" />
            <TextInput
              id="address"
              type="text"
              className="mt-1 block w-full"
              value={data.address}
              onChange={e => setData({ ...data, address: e.target.value })}
            />
            <InputError message={errors.address} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="phone" value="الهاتف" />
            <TextInput
              id="phone"
              type="text"
              className="mt-1 block w-full"
              value={data.phone}
              onChange={e => setData({ ...data, phone: e.target.value })}
            />
            <InputError message={errors.phone} className="mt-2" />
          </div>
          <div>
            <InputLabel htmlFor="email" value="البريد الإلكتروني" />
            <TextInput
              id="email"
              type="email"
              className="mt-1 block w-full"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
            />
            <InputError message={errors.email} className="mt-2" />
          </div>
        </form>
      </DialogModal.Content>
      <DialogModal.Footer>
        <div className="flex items-center space-x-3 space-x-reverse">
          <SecondaryButton
            type="button"
            onClick={handleClose}
            disabled={processing}
          >
            إلغاء
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            onClick={handleSubmit}
            disabled={processing}
            className="ml-2"
          >
            <FiSave className="w-4 h-4 ml-2" />
            {processing ? 'جاري الحفظ...' : 'حفظ الشركة'}
          </PrimaryButton>
        </div>
      </DialogModal.Footer>
    </DialogModal>
  );
}
