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

  const handleOpenCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === 'function') {
        try {
          hiddenDateInputRef.current.showPicker();
          return;
        } catch {
          // Fallback if showPicker fails
        }
      }
      hiddenDateInputRef.current.focus();
    }
  };

  return (
    <div className={`space-y-1.5 sm:space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
          {label} {required && <span className="text-[#ee0000]">*</span>}
        </label>
        <span className="text-[10px] sm:text-xs font-mono text-[var(--ink-mute)]">DD/MM/YYYY</span>
      </div>

      {/* Date Entry Box with Integrated Calendar Picker */}
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
          className="w-full h-10 sm:h-13 md:h-14 pl-3 sm:pl-4 md:pl-5 pr-24 sm:pr-32 md:pr-36 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl md:rounded-2xl text-sm sm:text-lg md:text-xl text-[var(--ink-primary)] font-mono-num font-semibold sm:font-bold tracking-wider sm:tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 focus:border-[#0070f3] shadow-2xs transition-all placeholder:text-[var(--ink-mute)]/40 placeholder:font-normal"
          aria-label={`${label} in DD/MM/YYYY format`}
        />

        {/* Integrated Calendar Trigger Button */}
        <div className="absolute right-1 sm:right-1.5 md:right-2 top-1 bottom-1 flex items-center">
          <div className="relative h-full flex items-center">
            {/* Native HTML5 date input positioned to anchor the picker */}
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
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              tabIndex={-1}
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={handleOpenCalendar}
              className="h-8 sm:h-10 md:h-10.5 px-2.5 sm:px-3.5 md:px-4 bg-[var(--canvas-inset)] border border-[var(--hairline)] hover:border-[#0070f3] hover:bg-[var(--canvas-card)] text-[var(--ink-primary)] active:scale-[0.98] rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none shadow-2xs"
              title="Open calendar picker"
              aria-label="Open calendar picker"
            >
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0070f3] pointer-events-none" />
              <span className="text-xs sm:text-sm font-semibold pointer-events-none">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {(inputError || helpText) && (
        <p className="text-xs text-amber-500 font-medium pt-0.5">{inputError || helpText}</p>
      )}
    </div>
  );
};
