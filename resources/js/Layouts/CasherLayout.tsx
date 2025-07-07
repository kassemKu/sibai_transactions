import React from 'react';
import { Head } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

interface CasherLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export default function CasherLayout({ title = 'لوحة الصراف', children }: CasherLayoutProps) {
  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
        {children}
      </div>
    </>
  );
}
