import { Link, useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
import AuthenticationCard from '@/Components/AuthenticationCard';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

interface Props {
  canResetPassword: boolean;
  status: string;
}

export default function Login({ canResetPassword, status }: Props) {
  const route = useRoute();
  const form = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('login'), {
      onFinish: () => form.reset('password'),
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setData('email', e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setData('password', e.target.value);
  };

  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setData('remember', e.target.checked);
  };

  return (
    <AuthenticationCard>
      <Head title="Sign In" />

      {status && (
        <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          {status}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-600">Please sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <InputLabel
            htmlFor="email"
            className="text-sm font-medium text-gray-700"
          >
            Email Address
          </InputLabel>
          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={form.data.email}
            onChange={handleEmailChange}
            required
            autoFocus
            autoComplete="email"
            placeholder="Enter your email"
            aria-describedby={form.errors.email ? 'email-error' : undefined}
          />
          <InputError
            id="email-error"
            className="mt-2"
            message={form.errors.email}
          />
        </div>

        <div>
          <InputLabel
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </InputLabel>
          <TextInput
            id="password"
            type="password"
            className="mt-1 block w-full"
            value={form.data.password}
            onChange={handlePasswordChange}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-describedby={
              form.errors.password ? 'password-error' : undefined
            }
          />
          <InputError
            id="password-error"
            className="mt-2"
            message={form.errors.password}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={form.data.remember}
              onChange={handleRememberChange}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>

          {canResetPassword && (
              <Link
                href={route('password.request')}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
              >
              Forgot password?
              </Link>
          )}
        </div>

        <div>
            <PrimaryButton
            type="submit"
            className={classNames(
              'w-full justify-center py-2.5 px-4 text-sm font-medium transition-all duration-200',
              {
                'opacity-75 cursor-not-allowed': form.processing,
                'hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500':
                  !form.processing,
              },
            )}
              disabled={form.processing}
            >
            {form.processing ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
            </PrimaryButton>
        </div>
      </form>
    </AuthenticationCard>
  );
}
