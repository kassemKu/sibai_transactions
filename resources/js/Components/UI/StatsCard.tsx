import React from 'react';
import classNames from 'classnames';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className = '',
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div
      className={classNames(
        'bg-white overflow-hidden shadow rounded-lg border border-gray-200',
        className,
      )}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && <Icon className="h-8 w-8 text-gray-400" />}
          </div>
          <div className={classNames('w-0 flex-1', Icon && 'ml-5')}>
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <div className="flex items-center">
              <span
                className={classNames(
                  'text-sm font-medium',
                  changeColors[changeType],
                )}
              >
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                from last month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
