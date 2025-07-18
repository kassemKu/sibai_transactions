import React, { useEffect, useState } from 'react';
import DialogModal from '@/Components/DialogModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Select from '@/Components/Select';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role_id: number | '';
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: number | null; // If present, edit mode
}

const initialState: User = {
  name: '',
  email: '',
  password: '',
  role_id: '',
};

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: UserModalProps) {
  const [data, setData] = useState<User>(initialState);
  const [roles, setRoles] = useState<Role[]>([]);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch roles on open
  useEffect(() => {
    if (isOpen) {
      axios.get('/admin/users-roles').then(res => {
        setRoles(res.data.data.roles || []);
      });
    }
  }, [isOpen]);

  // Fetch user data if editing
  useEffect(() => {
    if (isOpen && userId) {
      setLoadingUser(true);
      axios
        .get(`/admin/users/${userId}`)
        .then(res => {
          const user = res.data.data.user;
          setData({
            name: user.name,
            email: user.email,
            password: '', // Don't prefill password
            role_id: user.roles[0]?.id || '',
          });
        })
        .finally(() => setLoadingUser(false));
    } else if (isOpen && !userId) {
      setData(initialState);
      setErrors({});
    }
  }, [isOpen, userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      // Prepare data - only include password if it's not empty for edit mode
      const submitData = { ...data };
      if (userId && !submitData.password) {
        delete submitData.password; // Don't send empty password for edit
      }

      if (userId) {
        // Edit
        await axios.put(`/admin/users/${userId}`, submitData);
      } else {
        // Create
        await axios.post('/admin/users', submitData);
      }
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
    setData(initialState);
    setErrors({});
    onClose();
  };

  return (
    <DialogModal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <DialogModal.Content
        title={userId ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
      >
        {loadingUser ? (
          <div className="py-8 text-center text-gray-500">
            جاري تحميل بيانات المستخدم...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputLabel htmlFor="name" value="اسم المستخدم" />
              <TextInput
                id="name"
                name="name"
                type="text"
                className="mt-1 block w-full"
                value={data.name}
                onChange={handleChange}
                required
                autoFocus
              />
              <InputError message={errors.name} className="mt-2" />
            </div>
            <div>
              <InputLabel htmlFor="email" value="البريد الإلكتروني" />
              <TextInput
                id="email"
                name="email"
                type="email"
                className="mt-1 block w-full"
                value={data.email}
                onChange={handleChange}
                required
              />
              <InputError message={errors.email} className="mt-2" />
            </div>
            <div>
              <InputLabel htmlFor="role_id" value="الدور" />
              <Select
                id="role_id"
                name="role_id"
                className="mt-1 block w-full"
                value={data.role_id}
                onChange={handleChange}
                required
              >
                <option value="">اختر الدور</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </Select>
              <InputError message={errors.role_id} className="mt-2" />
            </div>
            <div>
              <InputLabel htmlFor="password" value="كلمة المرور" />
              <TextInput
                id="password"
                name="password"
                type="password"
                className="mt-1 block w-full"
                value={data.password || ''}
                onChange={handleChange}
                required={!userId} // Only required for create mode
                placeholder={
                  userId ? 'اتركه فارغًا للإبقاء على كلمة المرور الحالية' : ''
                }
              />
              <InputError message={errors.password} className="mt-2" />
            </div>
          </form>
        )}
      </DialogModal.Content>
      <DialogModal.Footer>
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
          disabled={processing || loadingUser}
          className="ml-2"
        >
          {processing
            ? 'جاري الحفظ...'
            : userId
              ? 'حفظ التعديلات'
              : 'إضافة المستخدم'}
        </PrimaryButton>
      </DialogModal.Footer>
    </DialogModal>
  );
}
