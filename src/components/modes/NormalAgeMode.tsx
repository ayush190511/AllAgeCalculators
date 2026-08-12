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
  const [showPlace, setShowPlace] = useState<boolean>(false);
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Asia/Kolkata');
  const [now, setNow] = useState<Date>(new Date());
  const [copied, setCopied] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string | null>(null);

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
      setDateError('Future dates cannot be used for chronological age. Clamped to today.');
      val = todayStr;
    } else {
      setDateError(null);
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
${showPlace ? `📍 Birth Location: ${birthPlace ? birthPlace : 'Specified City'} (${selectedTimezone})\n` : ''}⏳ Exact Age: ${ageData.years} Years, ${ageData.months} Months, ${ageData.days} Days
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
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--ink-primary)]" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--ink-primary)]">
              Chronological Age & Live Ticker Engine
            </h2>
          </div>
          <span className="self-start sm:self-auto text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Live as of Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-6">
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
            {dateError && (
              <p className="text-xs text-amber-500 font-medium mt-1 animate-fade-in">{dateError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Birth Time Precision (Optional Live Ticker)
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 min-h-[44px]">
              <button
                type="button"
                onClick={() => setShowTime(!showTime)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition cursor-pointer select-none ${
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
                    className="h-9 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-sm font-mono text-[var(--ink-primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Optional Place of Birth & Timezone Adjustment */}
          <div className="md:col-span-2 pt-2 border-t border-[var(--hairline)]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPlace(!showPlace)}
                className="text-xs font-semibold text-[#0070f3] hover:underline flex items-center gap-1.5 cursor-pointer select-none"
              >
                <span>{showPlace ? '– Hide Place of Birth & Timezone' : '+ Add Place of Birth & Timezone (Optional)'}</span>
              </button>
            </div>

            {showPlace && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl animate-fade-in-down">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--ink-mute)]">
                    City / Place of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India or London, UK"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full h-9 px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs text-[var(--ink-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ink-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--ink-mute)]">
                    Birth Timezone Offset
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs text-[var(--ink-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ink-primary)] cursor-pointer"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                    <option value="America/New_York">America/New_York (EST/EDT - UTC-5)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT - UTC-8)</option>
                    <option value="Europe/London">Europe/London (GMT/BST - UTC+0)</option>
                    <option value="Europe/Paris">Europe/Paris (CET/CEST - UTC+1)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST - UTC+4)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST - UTC+9)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST - UTC+10)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Age Stat Display */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--hairline)]">
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
        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-6 text-center">
          <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
              {ageData.years}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years</span>
          </div>
          <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
              {ageData.months}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months</span>
          </div>
          <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 rounded-xl border border-[var(--hairline)] min-w-0">
            <span className="block text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
              {ageData.days}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days</span>
          </div>
        </div>

        {/* Place of Birth & Timezone Metadata Badge */}
        {showPlace && (
          <div className="my-4 p-3.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[var(--ink-body)] animate-fade-in-down">
            <span className="flex items-center gap-2">
              <span className="text-base">🌐</span>
              <span><strong>Birth Location & Timezone:</strong> {birthPlace ? birthPlace : 'Specified City'}</span>
            </span>
            <span className="font-mono text-[#0070f3] font-semibold bg-[var(--canvas-card)] px-2.5 py-1 rounded border border-[var(--hairline)] shrink-0 self-start sm:self-auto">
              {selectedTimezone}
            </span>
          </div>
        )}

        {/* Live Second-by-Second Ticker (If Birth Time Provided) */}
        {showTime && (
          <div className="my-6 p-4 sm:p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] text-[var(--ink-primary)] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-down">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#0070f3] animate-ticker-dot shrink-0" />
              <div className="text-center sm:text-left">
                <span className="text-xs font-mono uppercase text-[var(--ink-mute)]">Live Precision Ticker</span>
                <div className="text-sm sm:text-base font-semibold text-[var(--ink-primary)]">Down-to-the-second Age</div>
              </div>
            </div>

            <div className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-[#50e3c2] bg-[var(--canvas-card)] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-[var(--hairline)]">
              {String(liveHoursRem).padStart(2, '0')}h : {String(liveMinutesRem).padStart(2, '0')}m : {String(liveSecondsRem).padStart(2, '0')}s
            </div>
          </div>
        )}

        {/* Milestone Totals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 border-t border-[var(--hairline)]">
          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
            <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Days</span>
            <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
              {ageData.totalDays.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
            <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Hours</span>
            <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
              {ageData.totalHours.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
            <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase truncate">Total Weeks</span>
            <span className="text-base sm:text-lg font-bold text-[var(--ink-primary)] font-mono-num truncate block">
              {ageData.totalWeeks.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg flex items-center justify-between min-w-0 gap-1">
            <div className="min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Next Birthday</span>
              <span className="text-xs sm:text-sm font-bold text-[#0070f3] font-mono-num block truncate">
                {ageData.nextBirthdayDays} Days Left
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-[#f5a623] shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
