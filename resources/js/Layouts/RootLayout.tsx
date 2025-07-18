import { Link, Head, useForm } from '@inertiajs/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import Banner from '@/Components/Banner';
import Dropdown from '@/Components/Dropdown';
import DropdownLink from '@/Components/DropdownLink';
import Logo from '@/Components/Logo';
import { FaChartLine, FaCoins, FaExchangeAlt, FaUsers } from 'react-icons/fa';
import { BsSafeFill } from 'react-icons/bs';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
interface Props {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  headerActions?: React.ReactNode;
  welcomeMessage?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  current?: boolean;
}

// Navigation Icons
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const TransactionsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CurrenciesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H18.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a.75.75 0 01-.75-.75V10.5a.75.75 0 00-.75-.75h-2.25A.75.75 0 0112 10.5v6.75a.75.75 0 01-.75.75h-2.25A.75.75 0 018.25 17v-3.75a.75.75 0 00-.75-.75h-.75m0 0h-.375c-.621 0-1.125-.504-1.125-1.125V4.5m2.25 0c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v4.125c0 .621-.504 1.125-1.125 1.125H6.375c-.621 0-1.125-.504-1.125-1.125V4.5z"
    />
  </svg>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

export default function RootLayout({
  title,
  breadcrumbs = [],
  headerActions,
  welcomeMessage,
  children,
}: PropsWithChildren<Props>) {
  const page = useTypedPage();
  const route = useRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage, default to false if not found
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });
  const logoutForm = useForm({});

  // Get user roles from page props
  const { roles } = page.props;
  const isCasher =
    roles && Array.isArray(roles) && (roles as string[]).includes('casher');
  const isAdmin =
    (roles &&
      Array.isArray(roles) &&
      (roles as string[]).includes('super_admin')) ||
    (roles as string[]).includes('superadministrator') ||
    (roles as string[]).includes('administrator');

  // All navigation items
  const allNavigation: NavItem[] = [
    {
      name: 'الرئيسية',
      href: route('home'),
      icon: <FaChartLine className="h-5 w-5" />,
      current: route().current('admin.*') || route().current('casher.*'),
    },
    {
      name: 'الجلسات',
      href: route('cash_sessions.index'),
      icon: <FaExchangeAlt className="h-5 w-5" />,
      current: route().current('cash_sessions.*'),
    },
    {
      name: 'الصندوق',
      href: route('cash_balances.index'),
      icon: <BsSafeFill className="h-5 w-5" />,
      current: route().current('cash_balances.*'),
    },
    {
      name: 'الموظفين',
      href: route('users.index'), // Point to Users module
      icon: <FaUsers className="h-5 w-5" />,
      current: route().current('users.*'), // Highlight when on users pages
    },
    {
      name: 'العملات',
      href: route('currencies.index'),
      icon: <FaCoins className="h-5 w-5" />,
      current: route().current('currencies.*'),
    },
    {
      name: 'الشركات',
      href: route('companies.index'), // Point to Companies module
      icon: <FaUsers className="h-5 w-5" />,
      current: route().current('companies.*'), // Highlight when on companies pages
    },
  ];

  // Filter navigation based on user role
  const navigation = isCasher
    ? allNavigation.filter(item => item.name === 'الرئيسية') // Cashers only see الرئيسية
    : allNavigation; // Admins see all navigation items

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    logoutForm.post(route('logout'));
  };

  // Function to toggle sidebar and persist state
  const toggleSidebar = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    }
  };

  // Sync localStorage state with React state on hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed !== null) {
        setSidebarCollapsed(savedCollapsed === 'true');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Head title={title} />
      <Banner />

      {/* Mobile sidebar */}
      <div
        className={classNames(
          'relative z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden',
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-0 flex">
          <div className="relative ml-16 flex w-full max-w-xs flex-1">
            <div className="absolute right-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">إغلاق الشريط الجانبي</span>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <Logo />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map(item => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                            )}
                          >
                            {typeof item.icon === 'function' ? (
                              <item.icon
                                className={classNames(
                                  item.current
                                    ? 'text-indigo-600'
                                    : 'text-gray-400 group-hover:text-indigo-600',
                                  'h-6 w-6 shrink-0',
                                )}
                              />
                            ) : (
                              item.icon
                            )}
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div
        className={classNames(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-72',
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-l border-gray-200 bg-white px-6 pb-4">
          <div
            className={classNames(
              'flex h-16 shrink-0 items-center',
              sidebarCollapsed ? 'justify-center' : 'justify-between',
            )}
          >
            <Logo showText={!sidebarCollapsed} />
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-500 hover:text-primaryBlue hover:bg-blue-50 transition-all duration-200 group"
              >
                <span className="sr-only">تقليص الشريط الجانبي</span>
                <FiChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-4">
                  {navigation.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-[#EFF6FF] text-primaryBlue'
                            : 'text-gray-700 hover:text-primaryBlue hover:bg-gray-50',
                          'group flex items-center rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200',
                          sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        {typeof item.icon === 'function' ? (
                          <item.icon
                            className={classNames(
                              item.current
                                ? 'text-primaryBlue'
                                : 'text-gray-400 group-hover:text-primaryBlue',
                              'h-6 w-6 shrink-0 flex items-center',
                            )}
                          />
                        ) : (
                          item.icon
                        )}
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div
        className={classNames(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:pr-16' : 'lg:pr-72',
        )}
      >
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">فتح الشريط الجانبي</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Desktop sidebar toggle - show in header when collapsed */}
          <button
            type="button"
            className={classNames(
              'hidden lg:flex -m-2.5 p-2.5 text-gray-700 hover:text-primaryBlue hover:bg-blue-50 rounded-lg transition-all duration-200',
              sidebarCollapsed ? 'lg:flex' : 'lg:hidden',
            )}
            onClick={toggleSidebar}
          >
            <span className="sr-only">
              {sidebarCollapsed
                ? 'توسيع الشريط الجانبي'
                : 'تقليص الشريط الجانبي'}
            </span>
            {sidebarCollapsed ? (
              <FiChevronRight className="h-5 w-5" />
            ) : (
              <FiChevronLeft className="h-5 w-5" />
            )}
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div className="flex flex-col">
                {breadcrumbs.length > 0 && (
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol
                      role="list"
                      className="flex items-center space-x-4 space-x-reverse"
                    >
                      {breadcrumbs.map((breadcrumb, index) => (
                        <li key={index}>
                          <div className="flex items-center">
                            {index > 0 && (
                              <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-400 ml-4 rotate-180"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {breadcrumb.href ? (
                              <Link
                                href={breadcrumb.href}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                              >
                                {breadcrumb.label}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                {breadcrumb.label}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
                {welcomeMessage && (
                  <div className="mt-1 hidden sm:block">
                    <p className="text-sm text-gray-600 truncate max-w-md">
                      {welcomeMessage}
                    </p>
                  </div>
                )}
                {/* Mobile-only welcome message - shorter version */}
                {welcomeMessage && (
                  <div className="mt-1 sm:hidden">
                    <p className="text-xs text-gray-500">أهلاً بك مرة أخرى!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {headerActions}

              {/* Profile dropdown */}
              <div className="relative">
                <Dropdown
                  align="left"
                  width="48"
                  renderTrigger={() => (
                    <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">فتح قائمة المستخدم</span>
                      {page.props.jetstream.managesProfilePhotos ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={page.props.auth.user?.profile_photo_url || ''}
                          alt={page.props.auth.user?.name}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {page.props.auth.user?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  )}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                      {page.props.auth.user?.email}
                    </div>
                    <DropdownLink href={route('profile.show')}>
                      إعدادات الملف الشخصي
                    </DropdownLink>
                    {page.props.jetstream.hasApiFeatures && (
                      <DropdownLink href={route('api-tokens.index')}>
                        رموز API
                      </DropdownLink>
                    )}
                    <div className="border-t border-gray-100" />
                    <form onSubmit={handleLogout}>
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-right text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                      >
                        تسجيل الخروج
                      </button>
                    </form>
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-left"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            fontFamily: 'inherit',
            fontSize: '14px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          },
          success: {
            style: {
              border: '1px solid #10b981',
              background: '#f0fdf4',
              color: '#065f46',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#f0fdf4',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              background: '#fef2f2',
              color: '#991b1b',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
        }}
      />
    </div>
  );
}
