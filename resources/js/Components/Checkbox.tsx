import classNames from 'classnames';
import React from 'react';

export default function Checkbox(
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
) {
  return (
    <input
      type="checkbox"
      {...props}
      className={classNames(
        'rounded border-gray-300 text-primaryBlue  shadow-sm focus:ring-primaryBlue',
        props.className,
      )}
    />
  );
}
