import React, { useState, useEffect, useMemo, useRef } from 'react';
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
 * Format raw digit string into DD/MM/YYYY with auto slashes
 */
function formatDigitsToDateString(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 2) {
    return clean;
  }
  if (clean.length <= 4) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
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

  // Sync internal display when external `value` prop changes
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
    const formatted = formatDigitsToDateString(rawVal);
    setDisplayText(formatted);

    // If full 8 digits entered (DD/MM/YYYY = 10 chars)
    if (formatted.length === 10) {
      const parts = formatted.split('/');
      if (parts.length === 3) {
        let dNum = parseInt(parts[0], 10);
        let mNum = parseInt(parts[1], 10);
        const yNum = parseInt(parts[2], 10);

        if (!isNaN(dNum) && !isNaN(mNum) && !isNaN(yNum) && yNum >= 1900 && yNum <= 2100) {
          // Month boundary
          if (mNum < 1) mNum = 1;
          if (mNum > 12) mNum = 12;

          // Day boundary
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
    // If incomplete on blur, revert to current valid value
    if (displayText.length < 10 && value) {
      setDisplayText(isoToDisplay(value));
      setInputError(null);
    }
  };

  // Human readable preview badge (e.g. May 15, 1998)
  const displayFormatted = useMemo(() => {
    if (!value) return '';
    try {
      const [y, m, d] = value.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  }, [value]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Optional Preview */}
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)] truncate">
          {label} {required && <span className="text-[#ee0000]">*</span>}
        </label>
        {displayFormatted && (
          <span className="text-xs font-mono text-[#0070f3] font-medium hidden sm:inline-block">
            {displayFormatted}
          </span>
        )}
      </div>

      {/* Single Unified Entry Box: DD/MM/YYYY Text Input + Calendar Button */}
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
          className="w-full h-11 pl-3.5 pr-28 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition tracking-wider"
          aria-label={`${label} in DD/MM/YYYY format`}
        />

        {/* Integrated Calendar Trigger Button overlay */}
        <div className="absolute right-1 top-1 bottom-1 flex items-center">
          <div className="relative h-full flex items-center">
            <div className="h-9 px-3 bg-[var(--canvas-inset)] border border-[var(--hairline)] hover:border-[var(--ink-primary)] text-[var(--ink-primary)] rounded-md flex items-center justify-center gap-1.5 transition cursor-pointer select-none pointer-events-none">
              <CalendarIcon className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs font-mono font-medium">Calendar</span>
            </div>

            {/* Invisible native HTML5 date input overlay: clicking the button directly opens OS date picker */}
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

      {/* Sub-label helper text / error message */}
      <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)] px-0.5">
        <span>Format: <strong className="text-[var(--ink-primary)] font-mono">DD/MM/YYYY</strong> or tap <strong className="text-[#0070f3] font-mono">📅 Calendar</strong></span>
        {displayFormatted && (
          <span className="font-mono text-[#0070f3] font-medium sm:hidden">{displayFormatted}</span>
        )}
      </div>

      {(inputError || helpText) && (
        <p className="text-[11px] text-amber-500 font-medium">{inputError || helpText}</p>
      )}
    </div>
  );
};
