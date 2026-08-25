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

const MONTHS = [
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' },
];

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

  // Split state for Day, Month, Year
  const [day, setDay] = useState<string>('15');
  const [month, setMonth] = useState<string>('05');
  const [year, setYear] = useState<string>('1998');

  // Sync internal state when external `value` prop changes
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setYear(y);
        setMonth(m.padStart(2, '0'));
        setDay(String(parseInt(d, 10)).padStart(2, '0'));
      }
    }
  }, [value]);

  // Helper to construct and emit updated ISO date
  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    const yNum = parseInt(newYear, 10);
    const mNum = parseInt(newMonth, 10);
    let dNum = parseInt(newDay, 10);

    if (isNaN(yNum) || isNaN(mNum) || isNaN(dNum)) return;

    // Validate max days in month
    const maxDays = getMaxDaysInMonth(mNum, yNum || 2024);
    if (dNum > maxDays) {
      dNum = maxDays;
      newDay = String(dNum).padStart(2, '0');
    }
    if (dNum < 1) {
      dNum = 1;
      newDay = '01';
    }

    const formattedDate = `${String(yNum).padStart(4, '0')}-${String(mNum).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;

    // Clamp against max if given
    if (max && formattedDate > max) {
      onChange(max);
    } else if (min && formattedDate < min) {
      onChange(min);
    } else {
      onChange(formattedDate);
    }
  };

  const handleDayChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 2);
    setDay(cleaned);
    if (cleaned.length >= 1) {
      const num = parseInt(cleaned, 10);
      if (num >= 1 && num <= 31) {
        updateDate(cleaned, month, year);
      }
    }
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    updateDate(day, val, year);
  };

  const handleYearChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setYear(cleaned);
    if (cleaned.length === 4) {
      const num = parseInt(cleaned, 10);
      if (num >= 1900 && num <= 2100) {
        updateDate(day, month, cleaned);
      }
    }
  };

  // Open the native calendar picker when user clicks calendar trigger
  const handleCalendarClick = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === 'function') {
        try {
          hiddenDateInputRef.current.showPicker();
          return;
        } catch {
          // Fallback to click
        }
      }
      hiddenDateInputRef.current.focus();
      hiddenDateInputRef.current.click();
    }
  };

  // Quick formatted human readable date
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
    <div className={`space-y-2 ${className}`}>
      {/* Label and Formatted Date Header */}
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

      {/* Combined Unified Input Row: Day + Month + Year + Calendar Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Day (DD) */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={day}
            onChange={(e) => handleDayChange(e.target.value)}
            onBlur={() => {
              if (day) {
                const formatted = String(Math.max(1, Math.min(31, parseInt(day, 10) || 1))).padStart(2, '0');
                setDay(formatted);
                updateDate(formatted, month, year);
              }
            }}
            placeholder="DD"
            className="w-full h-11 px-2 text-center bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition"
            aria-label="Day (DD)"
          />
          <span className="absolute right-1.5 bottom-1 text-[8px] sm:text-[9px] font-mono text-[var(--ink-mute)] pointer-events-none uppercase">
            Day
          </span>
        </div>

        {/* Month Selector */}
        <div className="relative flex-1.5 sm:flex-2 min-w-0">
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full h-11 pl-2 pr-5 text-xs sm:text-sm bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-[var(--ink-primary)] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer appearance-none"
            aria-label="Month (MM)"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink-mute)] text-xs">
            ▾
          </div>
        </div>

        {/* Year (YYYY) */}
        <div className="relative flex-1.5 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            onBlur={() => {
              if (year && year.length === 4) {
                updateDate(day, month, year);
              }
            }}
            placeholder="YYYY"
            className="w-full h-11 px-2 text-center bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition"
            aria-label="Year (YYYY)"
          />
          <span className="absolute right-1.5 bottom-1 text-[8px] sm:text-[9px] font-mono text-[var(--ink-mute)] pointer-events-none uppercase">
            Year
          </span>
        </div>

        {/* Integrated Calendar Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleCalendarClick}
            title="Open Calendar Picker"
            aria-label="Open Calendar Picker"
            className="h-11 px-3 sm:px-3.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] hover:border-[var(--ink-primary)] text-[var(--ink-primary)] rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer select-none"
          >
            <CalendarIcon className="w-4 h-4 text-[#0070f3]" />
            <span className="hidden sm:inline text-xs font-mono font-medium">Calendar</span>
          </button>

          {/* Hidden native HTML5 date input with invisible overlay for 100% native picker support */}
          <input
            ref={hiddenDateInputRef}
            type="date"
            value={value}
            max={max}
            min={min}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Sub-label info row */}
      <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)] px-0.5">
        <span>Type <strong className="text-[var(--ink-primary)] font-mono">Day/Month/Year</strong> or tap <strong className="text-[#0070f3] font-mono">📅 Calendar</strong></span>
        {displayFormatted && (
          <span className="font-mono text-[#0070f3] font-medium sm:hidden">{displayFormatted}</span>
        )}
      </div>

      {helpText && (
        <p className="text-[11px] text-amber-500 font-medium mt-1">{helpText}</p>
      )}
    </div>
  );
};
