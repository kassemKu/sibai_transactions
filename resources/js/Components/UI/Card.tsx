import React, { PropsWithChildren } from 'react';
import classNames from 'classnames';

interface CardProps {
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  className?: string;
}

export function Card({
  children,
  className = '',
  padding = 'md'
}: PropsWithChildren<CardProps>) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={classNames(
        'bg-white shadow rounded-lg border border-gray-200',
        padding !== 'none' && paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className = ''
}: CardHeaderProps) {
  return (
    <div className={classNames('border-b border-gray-200 pb-4 mb-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function CardContent({
  children,
  className = ''
}: PropsWithChildren<CardContentProps>) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
