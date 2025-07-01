import React, { PropsWithChildren } from 'react';

interface Props {
  value?: string;
  htmlFor?: string;
  className?: string;
}

export default function InputLabel({
  value,
  htmlFor,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <label
      className={className || 'block font-medium text-med-x14 text-text-grey'}
      htmlFor={htmlFor}
    >
      {value || children}
    </label>
  );
}