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
 * Smart date formatting and strict validation on input
 */
function sanitizeAndFormatDateInput(
  rawVal: string,
  prevVal: string,
  maxIso?: string,
  minIso?: string
): { formatted: string; isoDate: string | null; error: string | null } {
  // Handle backspace / deletion
  if (rawVal.length < prevVal.length) {
    if (prevVal.endsWith('/') && !rawVal.endsWith('/')) {
      return { formatted: rawVal.slice(0, -1), isoDate: null, error: null };
    }
    return { formatted: rawVal, isoDate: null, error: null };
  }

  // Extract digits only (max 8)
  const digits = rawVal.replace(/\D/g, '').slice(0, 8);
  if (!digits) {
    return { formatted: '', isoDate: null, error: null };
  }

  // 1. Day validation (1-2 digits)
  let dayPart = '';
  if (digits.length === 1) {
    const d1 = parseInt(digits[0], 10);
    // If first digit is 4-9, auto-pad with 0 -> "04/", "05/", etc.
    if (d1 >= 4) {
      dayPart = `0${d1}/`;
      return { formatted: dayPart, isoDate: null, error: null };
    }
    return { formatted: digits[0], isoDate: null, error: null };
  }

  let dNum = parseInt(digits.slice(0, 2), 10);
  if (dNum === 0) dNum = 1;
  if (dNum > 31) dNum = 31;
  dayPart = String(dNum).padStart(2, '0');

  if (digits.length === 2) {
    return { formatted: `${dayPart}/`, isoDate: null, error: null };
  }

  // 2. Month validation (digits 3-4)
  const remainingAfterDay = digits.slice(2);
  let monthPart = '';

  if (remainingAfterDay.length === 1) {
    const m1 = parseInt(remainingAfterDay[0], 10);
    // If first digit of month is 2-9, auto-pad with 0 -> "02/", "03/", etc.
    if (m1 >= 2) {
      monthPart = `0${m1}/`;
      return { formatted: `${dayPart}/${monthPart}`, isoDate: null, error: null };
    }
    return { formatted: `${dayPart}/${remainingAfterDay[0]}`, isoDate: null, error: null };
  }

  let mNum = parseInt(remainingAfterDay.slice(0, 2), 10);
  if (mNum === 0) mNum = 1;
  if (mNum > 12) mNum = 12;
  monthPart = String(mNum).padStart(2, '0');

  // Clamp day against 30-day month limits
  const maxDaysThisMonth = getMaxDaysInMonth(mNum, 2024);
  if (dNum > maxDaysThisMonth) {
    dNum = maxDaysThisMonth;
    dayPart = String(dNum).padStart(2, '0');
  }

  if (remainingAfterDay.length === 2) {
    return { formatted: `${dayPart}/${monthPart}/`, isoDate: null, error: null };
  }

  // 3. Year validation (digits 5-8)
  const yearDigits = remainingAfterDay.slice(2, 6);
  const formatted = `${dayPart}/${monthPart}/${yearDigits}`;

  if (yearDigits.length === 4) {
    const yNum = parseInt(yearDigits, 10);
    if (yNum >= 1900 && yNum <= 2100) {
      // Re-verify leap year for February
      const maxDaysForYear = getMaxDaysInMonth(mNum, yNum);
      if (dNum > maxDaysForYear) {
        dNum = maxDaysForYear;
        dayPart = String(dNum).padStart(2, '0');
      }

      const isoStr = `${String(yNum).padStart(4, '0')}-${monthPart}-${dayPart}`;

      if (maxIso && isoStr > maxIso) {
        return {
          formatted: `${dayPart}/${monthPart}/${yearDigits}`,
          isoDate: null,
          error: `Date cannot be in the future (after ${isoToDisplay(maxIso)})`,
        };
      }

      if (minIso && isoStr < minIso) {
        return {
          formatted: `${dayPart}/${monthPart}/${yearDigits}`,
          isoDate: null,
          error: `Date cannot be before ${isoToDisplay(minIso)}`,
        };
      }

      return {
        formatted: `${dayPart}/${monthPart}/${yearDigits}`,
        isoDate: isoStr,
        error: null,
      };
    }
  }

  return { formatted, isoDate: null, error: null };
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
      setDisplayText(formatted);
      setInputError(null);
    } else {
      setDisplayText('');
      setInputError(null);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal.trim()) {
      setDisplayText('');
      setInputError(null);
      onChange('');
      return;
    }

    const { formatted, isoDate, error } = sanitizeAndFormatDateInput(rawVal, displayText, max, min);
    setDisplayText(formatted);
    setInputError(error);

    if (isoDate) {
      onChange(isoDate);
    }
  };

  const handleBlur = () => {
    // If left incomplete on blur, revert to current valid value or clear
    if (displayText.length > 0 && displayText.length < 10) {
      if (value) {
        setDisplayText(isoToDisplay(value));
      } else {
        setDisplayText('');
      }
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
              value={value || ''}
              max={max}
              min={min}
              onChange={(e) => {
                const newVal = e.target.value;
                if (newVal) {
                  onChange(newVal);
                  setDisplayText(isoToDisplay(newVal));
                  setInputError(null);
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
