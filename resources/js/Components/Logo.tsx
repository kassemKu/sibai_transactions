import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

interface LogoProps {
  showText?: boolean;
  className?: string;
}

const Logo = ({ showText = true, className = '' }: LogoProps) => {
  return (
    <div
      className={`flex items-center ${showText ? 'gap-3' : 'justify-center'} ${className}`}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-primaryBlue rounded-xl">
        <FaExchangeAlt className="text-white text-xl" />
      </div>
      {showText && (
        <span className="text-bold-x18">
          <h1>السباعي للصرافة</h1>
        </span>
      )}
    </div>
  );
};

export default Logo;
