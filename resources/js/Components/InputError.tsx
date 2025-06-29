import React, { PropsWithChildren } from 'react';

interface Props {
  message?: string;
  className?: string;
  id?: string;
}

export default function InputError({
  message,
  className,
  id,
  children,
}: PropsWithChildren<Props>) {
  if (!message && !children) {
    return null;
  }
  return (
    <div className={className} id={id}>
      <p className="text-sm text-red">{message || children}</p>
    </div>
  );
}
