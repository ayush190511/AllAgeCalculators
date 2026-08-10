import React, { useState, useEffect, useMemo } from 'react';
import { calculateAgeBreakdown, formatDateForInput } from '../../lib/date-utils';
import { Calendar, Sparkles, Copy, Check } from 'lucide-react';

interface NormalAgeModeProps {
  initialDob?: string;
  onDobChange?: (val: string) => void;
}

export const NormalAgeMode: React.FC<NormalAgeModeProps> = ({ 
  initialDob = '1998-05-15',
  onDobChange 
}) => {
  const [dob, setDob] = useState<string>(initialDob);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('08:30');
  const [now, setNow] = useState<Date>(new Date());
  const [copied, setCopied] = useState<boolean>(false);

  // Maximum date allowed is today's date (cannot be in future)
  const todayStr = useMemo(() => formatDateForInput(new Date()), []);

  // Sync state if initialDob prop changes externally
  useEffect(() => {
    if (initialDob) {
      setDob(initialDob);
    }
  }, [initialDob]);

  const handleDobInputChange = (val: string) => {
    // Prevent setting a future date if typed manually
    if (val > todayStr) {
      val = todayStr;
    }
    setDob(val);
    if (onDobChange) {
      onDobChange(val);
    }
  };

  // Live ticker updates every second if time is provided
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dobDate = useMemo(() => {
    if (!dob) return new Date(1998, 4, 15);
    const [y, m, d] = dob.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, showTime ? h || 0 : 0, showTime ? min || 0 : 0);
  }, [dob, timeStr, showTime]);

  const ageData = useMemo(() => {
    return calculateAgeBreakdown(dobDate, now);
  }, [dobDate, now]);

  // Down-to-the-second exact live counter calculations
  const liveSecondsTotal = useMemo(() => {
    const diffMs = Math.max(0, now.getTime() - dobDate.getTime());
    return Math.floor(diffMs / 1000);
  }, [dobDate, now]);

  const liveSecondsRem = liveSecondsTotal % 60;
  const liveMinutesRem = Math.floor(liveSecondsTotal / 60) % 60;
  const liveHoursRem = Math.floor(liveSecondsTotal / 3600) % 24;

  const handleCopySummary = () => {
    const text = `🎉 Exact Age Summary
📅 Date of Birth: ${dob} ${showTime ? `at ${timeStr}` : ''}
⏳ Exact Age: ${ageData.years} Years, ${ageData.months} Months, ${ageData.days} Days
🔢 Total Days Lived: ${ageData.totalDays.toLocaleString()} days
🎂 Next Birthday in: ${ageData.nextBirthdayDays} days (${ageData.nextBirthdayDateStr})
📍 Calculated via allagecalculators.com`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex items-center justify-between pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--ink-primary)]" />
            <h2 className="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Chronological Age & Live Ticker Engine
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Live as of Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Date of Birth <span className="text-[#ee0000]">*</span>
            </label>
            <input
              type="date"
              value={dob}
              max={todayStr}
              onChange={(e) => handleDobInputChange(e.target.value)}
              className="w-full h-11 px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--ink-primary)] font-mono-num focus:outline-none focus:ring-2 focus:ring-[var(--ink-primary)] transition cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Birth Time Precision (Optional Live Ticker)
            </label>
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setShowTime(!showTime)}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition cursor-pointer select-none ${
                  showTime
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-card)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                }`}
              >
                {showTime ? 'Time Added ✓' : '+ Add Time of Birth'}
              </button>

              {showTime && (
                <div className="animate-fade-in-down">
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="h-10 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm font-mono text-[var(--ink-primary)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Age Stat Display */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors">
        <div className="flex items-center justify-between pb-6 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0070f3]" />
            <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Current Age as of Today</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        {/* Primary Y/M/D Cards */}
        <div className="grid grid-cols-3 gap-4 my-6 text-center">
          <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
              {ageData.years}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Years</span>
          </div>
          <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
              {ageData.months}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Months</span>
          </div>
          <div className="bg-[var(--canvas-inset)] p-5 rounded-xl border border-[var(--hairline)]">
            <span className="block text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num">
              {ageData.days}
            </span>
            <span className="text-xs uppercase font-mono text-[var(--ink-mute)]">Days</span>
          </div>
        </div>

        {/* Live Second-by-Second Ticker (If Birth Time Provided) */}
        {showTime && (
          <div className="my-6 p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] text-[var(--ink-primary)] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-down">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#0070f3] animate-ticker-dot" />
              <div>
                <span className="text-xs font-mono uppercase text-[var(--ink-mute)]">Live Precision Ticker</span>
                <div className="text-base font-semibold text-[var(--ink-primary)]">Down-to-the-second Age</div>
              </div>
            </div>

            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-[#50e3c2] bg-[var(--canvas-card)] px-4 py-2 rounded-lg border border-[var(--hairline)]">
              {String(liveHoursRem).padStart(2, '0')}h : {String(liveMinutesRem).padStart(2, '0')}m : {String(liveSecondsRem).padStart(2, '0')}s
            </div>
          </div>
        )}

        {/* Milestone Totals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--hairline)]">
          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-xs text-[var(--ink-mute)] font-mono uppercase">Total Days</span>
            <span className="text-lg font-bold text-[var(--ink-primary)] font-mono-num">
              {ageData.totalDays.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-xs text-[var(--ink-mute)] font-mono uppercase">Total Hours</span>
            <span className="text-lg font-bold text-[var(--ink-primary)] font-mono-num">
              {ageData.totalHours.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)]">
            <span className="block text-xs text-[var(--ink-mute)] font-mono uppercase">Total Weeks</span>
            <span className="text-lg font-bold text-[var(--ink-primary)] font-mono-num">
              {ageData.totalWeeks.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-[var(--ink-mute)] font-mono uppercase">Next Birthday</span>
              <span className="text-sm font-bold text-[#0070f3] font-mono-num">
                {ageData.nextBirthdayDays} Days Left
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-[#f5a623]" />
          </div>
        </div>
      </div>
    </div>
  );
};
