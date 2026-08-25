import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Edit3 } from 'lucide-react';

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
  { value: '01', label: '01 - Jan', days: 31 },
  { value: '02', label: '02 - Feb', days: 29 }, // Leap-year aware in calculation
  { value: '03', label: '03 - Mar', days: 31 },
  { value: '04', label: '04 - Apr', days: 30 },
  { value: '05', label: '05 - May', days: 31 },
  { value: '06', label: '06 - Jun', days: 30 },
  { value: '07', label: '07 - Jul', days: 31 },
  { value: '08', label: '08 - Aug', days: 31 },
  { value: '09', label: '09 - Sep', days: 30 },
  { value: '10', label: '10 - Oct', days: 31 },
  { value: '11', label: '11 - Nov', days: 30 },
  { value: '12', label: '12 - Dec', days: 31 },
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
  // Input mode: 'calendar' or 'type' (manual writing)
  const [mode, setMode] = useState<'type' | 'calendar'>('type');

  // Split state for manual typing
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
    // Only allow numbers, max 2 digits
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
      {/* Label and Mode Switcher Row */}
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)] truncate">
          {label} {required && <span className="text-[#ee0000]">*</span>}
        </label>

        {/* Segmented Mode Selector: Write Date vs Calendar Picker */}
        <div className="inline-flex items-center p-0.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer select-none ${
              mode === 'type'
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] font-semibold shadow-2xs'
                : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)]'
            }`}
            aria-label="Write date manually"
          >
            <Edit3 className="w-3 h-3" />
            <span>Write Date</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('calendar')}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer select-none ${
              mode === 'calendar'
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] font-semibold shadow-2xs'
                : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)]'
            }`}
            aria-label="Pick date from calendar"
          >
            <CalendarIcon className="w-3 h-3" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Write Date (Segmented Day, Month, Year Inputs) */}
      {mode === 'type' && (
        <div className="space-y-1.5 animate-fade-in-down">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
            {/* Day Input (3 cols) */}
            <div className="col-span-3">
              <div className="relative">
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
                  className="w-full h-11 px-2 sm:px-3 text-center bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition"
                  aria-label="Day (DD)"
                />
                <span className="absolute right-1.5 bottom-1 text-[8px] sm:text-[9px] font-mono text-[var(--ink-mute)] pointer-events-none uppercase">
                  Day
                </span>
              </div>
            </div>

            {/* Month Select (5 cols) */}
            <div className="col-span-5">
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full h-11 pl-2 pr-4 sm:px-3 text-xs sm:text-sm bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-[var(--ink-primary)] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer appearance-none"
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
            </div>

            {/* Year Input (4 cols) */}
            <div className="col-span-4">
              <div className="relative">
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
                  className="w-full h-11 px-2 sm:px-3 text-center bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition"
                  aria-label="Year (YYYY)"
                />
                <span className="absolute right-1.5 bottom-1 text-[8px] sm:text-[9px] font-mono text-[var(--ink-mute)] pointer-events-none uppercase">
                  Year
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)] px-1">
            <span>Format: <strong className="text-[var(--ink-primary)] font-mono">{day || 'DD'}/{month || 'MM'}/{year || 'YYYY'}</strong></span>
            {displayFormatted && (
              <span className="font-mono text-[#0070f3] font-medium">{displayFormatted}</span>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Native Calendar Picker */}
      {mode === 'calendar' && (
        <div className="space-y-1.5 animate-fade-in-down">
          <input
            type="date"
            value={value}
            max={max}
            min={min}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-11 px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer"
            aria-label={label}
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-mute)] px-1">
            <span>Tap input to open device calendar</span>
            {displayFormatted && (
              <span className="font-mono text-[#0070f3] font-medium">{displayFormatted}</span>
            )}
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-[var(--ink-mute)] mt-1">{helpText}</p>
      )}
    </div>
  );
};
