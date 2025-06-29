import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import rtl from 'tailwindcss-rtl';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './vendor/laravel/jetstream/**/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.tsx',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primaryBlue: '#2563EB', // Blue
        black: '#000000',
        price: '#10B981', // Green-500
        red: '#EF4444', // Red-500
        icons: '#9CA3AF', // Gray-400
        stroke: '#E5E7EB', // Gray-200
        grey: '#374151', // Gray-700
        'light-blue': '#DBEAFE', // Blue-100
        'light-grey': '#F3F4F6', // Gray-100
      },
      fontSize: {
        // Text styles from the design system
        'bold-x24': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'bold-x20': ['20px', { lineHeight: 'auto', fontWeight: '700' }],
        'bold-x18': ['18px', { lineHeight: 'auto', fontWeight: '700' }],
        'semi-bold-x18': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'bold-x16': ['16px', { lineHeight: 'auto', fontWeight: '700' }],
        'med-x16': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'reg-x16': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'med-x14': ['14px', { lineHeight: 'auto', fontWeight: '500' }],
        'reg-x14': ['14px', { lineHeight: '24px', fontWeight: '400' }],
      },
      textColor: {
        primaryBlue: '#2563EB',
        'text-grey': '#374151', // Gray-700
        'text-grey-light': '#ADAEBC',
        'text-black': '#111827',
        black: '#000000',
        price: '#10B981',
        red: '#EF4444',
        icons: '#9CA3AF',
      },
    },
  },

  plugins: [forms, typography, rtl],
};
