import React, { useState, useMemo } from 'react';
import { calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { ArrowRightLeft, Calendar, Copy, Check } from 'lucide-react';

interface DateDiffModeProps {
  title?: string;
  subtitle?: string;
}

export const DateDiffMode: React.FC<DateDiffModeProps> = ({ title, subtitle }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('00:00');
  const [toDate, setToDate] = useState<string>(() => formatDateForInput(new Date()));
  const [toTime, setToTime] = useState<string>('12:00');
  const [includeTime, setIncludeTime] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const parsedFrom = useMemo(() => {
    if (!fromDate) return null;
    const [y, m, d] = fromDate.split('-').map(Number);
    const [h, min] = fromTime.split(':').map(Number);
    return new Date(y, m - 1, d, includeTime ? h || 0 : 0, includeTime ? min || 0 : 0);
  }, [fromDate, fromTime, includeTime]);

  const parsedTo = useMemo(() => {
    if (!toDate) return null;
    const [y, m, d] = toDate.split('-').map(Number);
    const [h, min] = toTime.split(':').map(Number);
    return new Date(y, m - 1, d, includeTime ? h || 0 : 0, includeTime ? min || 0 : 0);
  }, [toDate, toTime, includeTime]);

  const diff = useMemo(() => {
    if (!parsedFrom || !parsedTo) return null;
    return calculateDateDifference(parsedFrom, parsedTo);
  }, [parsedFrom, parsedTo]);

  const handleCopySummary = () => {
    if (!diff) return;
    const text = `⏳ Date Difference Result
📅 From: ${fromDate} ${includeTime ? fromTime : ''}
📅 To: ${toDate} ${includeTime ? toTime : ''}
⏱️ Difference: ${diff.years} Years, ${diff.months} Months, ${diff.days} Days
🔢 Total Days: ${diff.totalDays.toLocaleString()} days (${diff.totalHours.toLocaleString()} hours)
📍 Calculated via allagecalculators.com/date-difference-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors space-y-3.5">
        {/* Card Header Title */}
        <div className="border-b border-[var(--hairline)] pb-3 sm:pb-3.5 text-center relative">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[var(--ink-primary)]">
            {title || "Date Difference Calculator"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-body)] mt-1 max-w-xl mx-auto leading-relaxed">
            {subtitle || "Calculate exact duration between two dates and times with total days, hours, and unit conversions."}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIncludeTime(!includeTime)}
            className={`text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono font-semibold rounded-lg border transition-all cursor-pointer select-none shadow-2xs ${
              includeTime
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
            }`}
          >
            {includeTime ? 'Time Precision ✓' : '+ Add Time Precision'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">
          {/* From Date */}
          <div className="space-y-1.5">
            <DateInputField
              label="Start Date (From)"
              value={fromDate}
              onChange={(val) => setFromDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2 pt-0.5 animate-fade-in-down">
                <span className="text-xs font-mono font-semibold text-[var(--ink-mute)]">Start Time:</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-8.5 sm:h-9 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#7928ca]/40"
                />
              </div>
            )}
          </div>

          {/* To Date */}
          <div className="space-y-1.5">
            <DateInputField
              label="End Date (To)"
              value={toDate}
              onChange={(val) => setToDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2 pt-0.5 animate-fade-in-down">
                <span className="text-xs font-mono font-semibold text-[var(--ink-mute)]">End Time:</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-8.5 sm:h-9 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#7928ca]/40"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {diff ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-5.5 shadow-xs relative transition-colors animate-fade-in-down space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7928ca]" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--ink-mute)]">
                Duration: <strong className="text-[var(--ink-primary)] font-mono">{fromDate}</strong> &rarr; <strong className="text-[var(--ink-primary)] font-mono">{toDate}</strong>
              </span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md sm:rounded-lg hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)] transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Y/M/D Display */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.years}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Years
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.months}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Months
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.days}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                Days
              </span>
            </div>
          </div>

          {/* Secondary Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2.5 border-t border-[var(--hairline)]">
            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Days</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Hours</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Minutes</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalMinutes.toLocaleString()}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Seconds</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalSeconds.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 md:p-7 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl text-center space-y-1.5 shadow-xs">
          <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-[#7928ca]" />
          <h3 className="text-sm sm:text-base font-bold text-[var(--ink-primary)]">Ready to Calculate Duration</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Choose both Start and End dates in the box above to compute the exact duration between them.
          </p>
        </div>
      )}
    </div>
  );
};
