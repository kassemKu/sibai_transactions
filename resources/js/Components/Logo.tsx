import React from 'react';
import { Link } from '@inertiajs/react';
import { FaExchangeAlt } from 'react-icons/fa';
import useTypedPage from '@/Hooks/useTypedPage';
import useRoute from '@/Hooks/useRoute';

interface LogoProps {
  showText?: boolean;
  className?: string;
}

const Logo = ({ showText = true, className = '' }: LogoProps) => {
  const page = useTypedPage();
  const route = useRoute();

  // Get user roles from page props
  const { roles } = page.props;
  const isCasher =
    roles && Array.isArray(roles) && (roles as string[]).includes('casher');
  const isAdmin =
    roles && Array.isArray(roles) && (roles as string[]).includes('admin');
  const isSuperAdmin =
    roles &&
    Array.isArray(roles) &&
    (roles as string[]).includes('super_admin');

  // Determine home route based on user role
  const homeRoute = isSuperAdmin
    ? route('admin.dashboard') // Super Admin goes to admin dashboard
    : isCasher || isAdmin
      ? route('casher.dashboard') // Cashers and Admins go to casher dashboard
      : route('dashboard');

  return (
    <Link
      href={homeRoute}
      className={`flex items-center ${showText ? 'gap-3' : 'justify-center'} ${className} hover:opacity-80 transition-opacity duration-200`}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-primaryBlue rounded-xl">
        <FaExchangeAlt className="text-white text-xl" />
      </div>
      {showText && (
        <span className="text-bold-x18">
          <h1>السباعي للصرافة</h1>
        </span>
      )}
    </Link>
  );
};

export default Logo;
