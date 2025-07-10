import { Link, useForm, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React from 'react';
import useRoute from '@/Hooks/useRoute';
// import AuthenticationCard from '@/Components/AuthenticationCard';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Logo from '@/Components/Logo';

interface Props {
  canResetPassword: boolean;
  status: string;
  loginImage: string;
}

export default function Login({ canResetPassword, status, loginImage }: Props) {
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
    <>
      <Head title="Sign In" />
      <section className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-20">
          {/* Logo - responsive positioning */}
          <div className="flex justify-center lg:justify-start mb-8 lg:mb-0">
            <Logo />
          </div>

          {/* Form container with responsive spacing */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 flex flex-col h-full justify-center max-w-md mx-auto lg:mx-0 w-full">
            {status && (
              <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                {status}
              </div>
            )}

            {/* Header - responsive text sizes */}
            <div className="mb-4 sm:mb-6 flex flex-col justify-center items-center lg:items-start w-full text-center lg:text-right">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                تسجيل الدخول
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                مرحبا مجددا ، ادخل بياناتك للمواصلة
              </p>
            </div>

            {/* Form with responsive spacing */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <InputLabel htmlFor="email" className="text-sm sm:text-base">
                  البريد الألكتروني
                </InputLabel>
                <TextInput
                  id="email"
                  type="email"
                  className="mt-1 block w-full text-sm sm:text-base"
                  value={form.data.email}
                  onChange={handleEmailChange}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="أدخل البريد الألكتروني"
                  aria-describedby={
                    form.errors.email ? 'email-error' : undefined
                  }
                />
                <InputError
                  id="email-error"
                  className="mt-2"
                  message={form.errors.email}
                />
              </div>

              <div>
                <InputLabel htmlFor="password" className="text-sm sm:text-base">
                  كلمة المرور
                </InputLabel>
                <TextInput
                  id="password"
                  type="password"
                  className="mt-1 block w-full text-sm sm:text-base"
                  value={form.data.password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="current-password"
                  placeholder="أدخل كلمة المرور"
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

              {/* Responsive remember me and forgot password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <label className="flex items-center">
                  <Checkbox
                    name="remember"
                    checked={form.data.remember}
                    onChange={handleRememberChange}
                  />
                  <span className="ms-2 text-xs sm:text-sm text-gray-600">
                    تذكرني
                  </span>
                </label>

                {canResetPassword && (
                  <Link
                    href={route('password.request')}
                    className="text-xs sm:text-sm text-primaryBlue hover:text-primaryBlue font-medium transition-colors duration-200"
                  >
                    هل نسيت كلمة المرور؟
                  </Link>
                )}
              </div>

              <div>
                <PrimaryButton
                  type="submit"
                  className={classNames(
                    'w-full justify-center py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium transition-all duration-200',
                    {
                      'opacity-75 cursor-not-allowed': form.processing,
                      'hover:bg-primaryBlue focus:ring-2 focus:ring-offset-2 focus:ring-primaryBlue':
                        !form.processing,
                    },
                  )}
                  disabled={form.processing}
                >
                  {form.processing ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ms-1 me-3 h-4 w-4 text-white"
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
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Image (hidden on mobile, visible on large screens) */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src={loginImage}
            alt="login"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </>
  );
}
