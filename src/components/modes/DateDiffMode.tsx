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
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#7928ca]" />
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              Date & Time Difference Engine
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIncludeTime(!includeTime)}
            className={`text-xs px-3 py-1.5 font-mono rounded-lg border transition cursor-pointer select-none ${
              includeTime
                ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
            }`}
          >
            {includeTime ? 'Time Precision ✓' : '+ Add Time Comparison'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
          {/* From Date */}
          <div className="space-y-2">
            <DateInputField
              label="Start Date (From)"
              value={fromDate}
              onChange={(val) => setFromDate(val)}
            />
            {includeTime && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in-down">
                <span className="text-xs font-mono text-[var(--ink-mute)]">Start Time:</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
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
              <div className="flex items-center gap-2 pt-1 animate-fade-in-down">
                <span className="text-xs font-mono text-[var(--ink-mute)]">End Time:</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {diff ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7928ca]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Calculated Duration</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Y/M/D Display */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 my-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.years}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.months}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {diff.days}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days</span>
            </div>
          </div>

          {/* Secondary Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-[var(--hairline)]">
            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Days</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Hours</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Minutes</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalMinutes.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Seconds</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {diff.totalSeconds.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <ArrowRightLeft className="w-6 h-6 mx-auto text-[#7928ca]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready to Calculate Duration</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Choose both Start and End dates in the box above to compute the exact duration between them.
          </p>
        </div>
      )}
    </div>
  );
};
