import classNames from 'classnames';
import React, { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';

interface NumberInputProps {
  value?: string | number;
  onChange?: (value: string) => void;
  onValueChange?: (values: { value: string; floatValue?: number }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  decimalScale?: number;
  allowNegative?: boolean;
  thousandSeparator?: boolean | string;
  prefix?: string;
  suffix?: string;
  dir?: 'ltr' | 'rtl';
  id?: string;
  name?: string;
  autoComplete?: string;
  'aria-label'?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      placeholder,
      className,
      disabled = false,
      readOnly = false,
      min,
      max,
      decimalScale = 2,
      allowNegative = false,
      thousandSeparator = true,
      prefix,
      suffix,
      dir = 'ltr',
      id,
      name,
      autoComplete,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const handleValueChange = (values: {
      value: string;
      floatValue?: number;
    }) => {
      // Call the onValueChange callback if provided
      if (onValueChange) {
        onValueChange(values);
      }

      // Call the onChange callback if provided (for compatibility)
      if (onChange) {
        onChange(values.value);
      }
    };

    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        value={value}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        id={id}
        name={name}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        dir={dir}
        // Number formatting options
        thousandSeparator={thousandSeparator}
        decimalScale={decimalScale}
        fixedDecimalScale={false}
        allowNegative={allowNegative}
        prefix={prefix}
        suffix={suffix}
        // Validation
        isAllowed={values => {
          const { floatValue } = values;

          // Allow empty values
          if (floatValue === undefined) return true;

          // Check min/max constraints
          if (min !== undefined && floatValue < min) return false;
          if (max !== undefined && floatValue > max) return false;

          return true;
        }}
        className={classNames(
          'border-gray-300 focus:border-primaryBlue focus:ring-primaryBlue rounded-md shadow-sm text-reg-x14t',
          'transition-colors duration-200',
          {
            'bg-gray-50 cursor-not-allowed': disabled,
            'text-right': dir === 'rtl',
            'text-left': dir === 'ltr',
          },
          className,
        )}
        // Prevent scientific notation display
        format={numStr => {
          if (!numStr) return '';

          // Handle very large numbers to prevent scientific notation
          const num = parseFloat(numStr);
          if (num >= 1e6) {
            // For numbers >= 1 million, use custom formatting
            return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: decimalScale,
              useGrouping: !!thousandSeparator,
            }).format(num);
          }

          return numStr;
        }}
      />
    );
  },
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
