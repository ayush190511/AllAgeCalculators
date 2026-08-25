import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateInputFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  max?: string; // YYYY-MM-DD
  min?: string; // YYYY-MM-DD
  required?: boolean;
  helpText?: string;
  className?: string;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMaxDaysInMonth(month: number, year: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * Converts ISO date (YYYY-MM-DD) to DD/MM/YYYY
 */
function isoToDisplay(isoStr: string): string {
  if (!isoStr || !isoStr.includes('-')) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y && m && d) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return '';
}

/**
 * Smart date formatting with auto-inserted forward slashes
 */
function formatWithAutoSlash(currentVal: string, previousVal: string): string {
  // Handle smooth deletion on backspace
  if (currentVal.length < previousVal.length) {
    if (previousVal.endsWith('/') && !currentVal.endsWith('/')) {
      return currentVal.slice(0, -1);
    }
    return currentVal;
  }

  // If user manually pressed slash after 1 digit (e.g. "5/"), pad with leading zero -> "05/"
  if (currentVal.endsWith('/') && !previousVal.endsWith('/')) {
    const digitsOnly = currentVal.replace(/\D/g, '');
    if (digitsOnly.length === 1) {
      return `0${digitsOnly}/`;
    }
    if (digitsOnly.length === 3) {
      return `${digitsOnly.slice(0, 2)}/0${digitsOnly.slice(2)}/`;
    }
  }

  // Extract raw digits (max 8)
  const digits = currentVal.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';

  if (digits.length === 1) {
    return digits;
  }
  if (digits.length === 2) {
    return `${digits}/`;
  }
  if (digits.length === 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  if (digits.length === 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}/`;
  }
  // 5 to 8 digits (year)
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export const DateInputField: React.FC<DateInputFieldProps> = ({
  label,
  value,
  onChange,
  max,
  min,
  required = true,
  helpText,
  className = '',
}) => {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);
  const [displayText, setDisplayText] = useState<string>(() => isoToDisplay(value));
  const [inputError, setInputError] = useState<string | null>(null);

  // Sync internal text state when external `value` prop changes
  useEffect(() => {
    if (value) {
      const formatted = isoToDisplay(value);
      if (formatted) {
        setDisplayText(formatted);
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatWithAutoSlash(rawVal, displayText);
    setDisplayText(formatted);

    // When full 8 digits (DD/MM/YYYY = 10 characters) are completed
    if (formatted.length === 10) {
      const parts = formatted.split('/');
      if (parts.length === 3) {
        let dNum = parseInt(parts[0], 10);
        let mNum = parseInt(parts[1], 10);
        const yNum = parseInt(parts[2], 10);

        if (!isNaN(dNum) && !isNaN(mNum) && !isNaN(yNum) && yNum >= 1900 && yNum <= 2100) {
          // Month boundary validation
          if (mNum < 1) mNum = 1;
          if (mNum > 12) mNum = 12;

          // Day boundary validation
          const maxDays = getMaxDaysInMonth(mNum, yNum);
          if (dNum < 1) dNum = 1;
          if (dNum > maxDays) dNum = maxDays;

          const isoStr = `${String(yNum).padStart(4, '0')}-${String(mNum).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;

          if (max && isoStr > max) {
            setInputError(`Date cannot be after ${isoToDisplay(max)}`);
            onChange(max);
          } else if (min && isoStr < min) {
            setInputError(`Date cannot be before ${isoToDisplay(min)}`);
            onChange(min);
          } else {
            setInputError(null);
            onChange(isoStr);
          }
        }
      }
    } else {
      setInputError(null);
    }
  };

  const handleBlur = () => {
    // If left incomplete on blur, revert cleanly to current valid value
    if (displayText.length < 10 && value) {
      setDisplayText(isoToDisplay(value));
      setInputError(null);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)] truncate">
        {label} {required && <span className="text-[#ee0000]">*</span>}
      </label>

      {/* Clean Single Entry Box with Placeholder and Integrated Calendar Picker */}
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={displayText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="DD/MM/YYYY"
          className="w-full h-11 pl-3.5 pr-28 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition tracking-wider placeholder:text-[var(--ink-mute)]/60 placeholder:font-normal"
          aria-label={`${label} in DD/MM/YYYY format`}
        />

        {/* Integrated Calendar Trigger Button */}
        <div className="absolute right-1 top-1 bottom-1 flex items-center">
          <div className="relative h-full flex items-center">
            <div className="h-9 px-3 bg-[var(--canvas-inset)] border border-[var(--hairline)] hover:border-[var(--ink-primary)] text-[var(--ink-primary)] rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer select-none pointer-events-none">
              <CalendarIcon className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs font-mono font-medium">Calendar</span>
            </div>

            {/* Invisible native HTML5 date input overlay for native calendar picker */}
            <input
              ref={hiddenDateInputRef}
              type="date"
              value={value}
              max={max}
              min={min}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  setDisplayText(isoToDisplay(e.target.value));
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              tabIndex={0}
              aria-label="Choose date from calendar"
            />
          </div>
        </div>
      </div>

      {(inputError || helpText) && (
        <p className="text-[11px] text-amber-500 font-medium">{inputError || helpText}</p>
      )}
    </div>
  );
};
