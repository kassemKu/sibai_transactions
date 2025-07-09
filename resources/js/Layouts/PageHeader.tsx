import React, { FC, ReactNode } from "react";
import classNames from "classnames";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <header className={classNames("flex items-center justify-between mb-6", className)}>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
        )}
      </div>
      {actions && (
        <div className="flex flex-grow items-center space-x-2 order-1">
          {actions}
        </div>
      )}
    </header>
  );
};