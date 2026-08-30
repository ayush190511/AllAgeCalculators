import React, { useState, useMemo } from 'react';
import { calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { ArrowRightLeft, Calendar, Copy, Check } from 'lucide-react';

export const DateDiffMode: React.FC = () => {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#7928ca] shadow-[0_0_8px_rgba(121,40,202,0.6)]" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[var(--ink-primary)]">
              Date & Time Difference Engine
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIncludeTime(!includeTime)}
            className={`text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 font-mono font-semibold rounded-lg sm:rounded-xl border transition-all cursor-pointer select-none shadow-2xs ${
              includeTime
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
            }`}
          >
            {includeTime ? 'Time Precision ✓' : '+ Add Time Precision'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-7 pt-4 sm:pt-5">
          {/* From Date */}
          <div className="space-y-2">
            <DateInputField
              label="Start Date (From)"
              value={fromDate}
              onChange={(val) => setFromDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2.5 sm:gap-3 pt-0.5 animate-fade-in-down">
                <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--ink-mute)]">Start Time:</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-9 sm:h-11 px-3 sm:px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#7928ca]/40"
                />
              </div>
            )}
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <DateInputField
              label="End Date (To)"
              value={toDate}
              onChange={(val) => setToDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2.5 sm:gap-3 pt-0.5 animate-fade-in-down">
                <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--ink-mute)]">End Time:</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-9 sm:h-11 px-3 sm:px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#7928ca]/40"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {diff ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs relative transition-colors animate-fade-in-down space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#7928ca]" />
              <span className="text-xs sm:text-sm uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">
                Duration: <strong className="text-[var(--ink-primary)] font-mono">{fromDate}</strong> &rarr; <strong className="text-[var(--ink-primary)] font-mono">{toDate}</strong>
              </span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg sm:rounded-xl hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)] transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Y/M/D Display */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-4 text-center">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.years}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Years
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.months}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Months
              </span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {diff.days}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Days
              </span>
            </div>
          </div>

          {/* Secondary Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-3 border-t border-[var(--hairline)]">
            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Days</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {diff.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Hours</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {diff.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Minutes</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {diff.totalMinutes.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Seconds</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {diff.totalSeconds.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl text-center space-y-1.5 sm:space-y-2 shadow-xs">
          <ArrowRightLeft className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#7928ca]" />
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)]">Ready to Calculate Duration</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Choose both Start and End dates in the box above to compute the exact duration between them.
          </p>
        </div>
      )}
    </div>
  );
};
