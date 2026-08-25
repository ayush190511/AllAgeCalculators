import React, { useState, useMemo } from 'react';
import { calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';

export const DateDiffMode: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('00:00');
  const [toDate, setToDate] = useState<string>(formatDateForInput(new Date()));
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
📍 Calculated via allagecalculators.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Inputs Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex items-center justify-between pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#7928ca]" />
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Date Difference & Age Gap Calculator
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIncludeTime(!includeTime)}
            className={`text-xs px-3 py-1 font-mono rounded-md border transition cursor-pointer select-none ${
              includeTime
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
            }`}
          >
            {includeTime ? 'Time Included ✓' : '+ Add Time Inputs'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* From Date (Empty by default) */}
          <div className="space-y-2">
            <DateInputField
              label="From Date / Earlier Date"
              value={fromDate}
              onChange={(val) => setFromDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2 animate-fade-in-down pt-1">
                <span className="text-xs font-mono text-[var(--ink-mute)]">From Time:</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-9 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
                />
              </div>
            )}
          </div>

          {/* To Date (Prefilled with Today's Date) */}
          <div className="space-y-2">
            <DateInputField
              label="To Date / Later Date"
              value={toDate}
              onChange={(val) => setToDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2 animate-fade-in-down pt-1">
                <span className="text-xs font-mono text-[var(--ink-mute)]">To Time:</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-9 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Difference Output Card */}
      {diff ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#7928ca]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Calculated Interval</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>

          {/* Primary Y/M/D */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-6 text-center">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.years}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years</span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.months}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months</span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.days}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days</span>
            </div>
          </div>

          {/* Secondary Unit Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-[var(--hairline)]">
            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Days</span>
              <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
                {diff.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Hours</span>
              <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
                {diff.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Minutes</span>
              <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
                {diff.totalMinutes.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Seconds</span>
              <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
                {diff.totalSeconds.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-2">
          <ArrowRightLeft className="w-8 h-8 mx-auto text-[#7928ca]/60" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready to Calculate Duration</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter a "From Date" in the input box above to calculate the exact duration, total days, hours, and seconds between the two dates.
          </p>
        </div>
      )}
    </div>
  );
};
