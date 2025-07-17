import React from 'react';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { FiSave } from 'react-icons/fi';

interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onSuccess?: () => void;
}

export default function CompanyEditModal({ isOpen, onClose, company, onSuccess }: CompanyEditModalProps) {
  const [data, setData] = React.useState({ name: company.name });
  const [processing, setProcessing] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string }>({});

  React.useEffect(() => {
    setData({ name: company.name });
    setErrors({});
  }, [company.id, isOpen]);

  const reset = () => {
    setData({ name: company.name });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await axios.put(`/admin/companies/${company.id}`, data);
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
      <DialogModal.Content title="تعديل الشركة">
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
        </form>
      </DialogModal.Content>
      <DialogModal.Footer>
        <SecondaryButton type="button" onClick={handleClose} disabled={processing}>
          إلغاء
        </SecondaryButton>
        <PrimaryButton type="submit" onClick={handleSubmit} disabled={processing} className="ml-2">
          <FiSave className="w-4 h-4 ml-2" />
          {processing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </PrimaryButton>
      </DialogModal.Footer>
    </DialogModal>
  );
} 