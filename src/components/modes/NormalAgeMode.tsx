import React, { useState, useEffect, useMemo } from 'react';
import { calculateAgeBreakdown, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Calendar, Sparkles, Copy, Check } from 'lucide-react';

interface NormalAgeModeProps {
  initialDob?: string;
  dob?: string;
  onDobChange?: (val: string) => void;
}

export const NormalAgeMode: React.FC<NormalAgeModeProps> = ({ 
  initialDob = '',
  dob: controlledDob,
  onDobChange 
}) => {
  const [dob, setDob] = useState<string>(controlledDob !== undefined ? controlledDob : initialDob);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('08:30');
  const [showPlace, setShowPlace] = useState<boolean>(false);
  const [birthPlace, setBirthPlace] = useState<string>('');
  
  // Auto-detect browser device timezone silently without location permissions
  const detectedTimezone = useMemo(() => {
    if (typeof window !== 'undefined' && Intl?.DateTimeFormat) {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      } catch {
        return 'Asia/Kolkata';
      }
    }
    return 'Asia/Kolkata';
  }, []);

  const [selectedTimezone, setSelectedTimezone] = useState<string>(detectedTimezone);
  const [now, setNow] = useState<Date>(new Date());
  const [copied, setCopied] = useState<boolean>(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Maximum date allowed is today's date (cannot be in future)
  const todayStr = useMemo(() => formatDateForInput(new Date()), []);

  // Sync state if controlled dob or initialDob prop changes externally
  useEffect(() => {
    if (controlledDob !== undefined) {
      setDob(controlledDob);
    } else if (initialDob !== undefined) {
      setDob(initialDob);
    }
  }, [controlledDob, initialDob]);

  const handleDobInputChange = (val: string) => {
    if (val && val > todayStr) {
      setDateError('Future dates cannot be used for chronological age.');
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
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, showTime ? h || 0 : 0, showTime ? min || 0 : 0);
  }, [dob, timeStr, showTime]);

  const ageData = useMemo(() => {
    if (!dobDate) return null;
    return calculateAgeBreakdown(dobDate, now);
  }, [dobDate, now]);

  // Down-to-the-second exact live counter calculations
  const liveSecondsTotal = useMemo(() => {
    if (!dobDate) return 0;
    const diffMs = Math.max(0, now.getTime() - dobDate.getTime());
    return Math.floor(diffMs / 1000);
  }, [dobDate, now]);

  const liveSecondsRem = liveSecondsTotal % 60;
  const liveMinutesRem = Math.floor(liveSecondsTotal / 60) % 60;
  const liveHoursRem = Math.floor(liveSecondsTotal / 3600) % 24;

  const handleCopySummary = () => {
    if (!ageData) return;
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
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              Chronological Age & Live Ticker Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            Live as of Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
          <DateInputField
            label="Date of Birth"
            value={dob}
            max={todayStr}
            onChange={(val) => handleDobInputChange(val)}
            helpText={dateError || undefined}
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
              Birth Time Precision (Optional Live Ticker)
            </label>
            <div className="flex flex-wrap items-center gap-2.5 min-h-[40px]">
              <button
                type="button"
                onClick={() => setShowTime(!showTime)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer select-none ${
                  showTime
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                    : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
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
                    className="h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs font-mono text-[var(--ink-primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Optional Place of Birth & Timezone Adjustment */}
          <div className="md:col-span-2 pt-1 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setShowPlace(!showPlace)}
              className="text-xs font-semibold text-[#0070f3] hover:underline flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span>{showPlace ? '– Hide Place of Birth & Timezone' : '+ Add Place of Birth & Timezone (Optional)'}</span>
            </button>

            {showPlace && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 p-3.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl animate-fade-in-down">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--ink-mute)]">
                    City / Place of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India or London, UK"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full h-8 px-2.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--ink-mute)]">
                    Birth Timezone Offset
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full h-8 px-2 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg text-xs text-[var(--ink-primary)] font-mono focus:outline-none cursor-pointer"
                  >
                    {!['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney'].includes(detectedTimezone) && (
                      <option value={detectedTimezone}>{detectedTimezone} (Device Auto-detected)</option>
                    )}
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

      {/* Main Results Display */}
      {ageData ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Current Age as of Today</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Y/M/D Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 my-3 text-center">
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {ageData.years}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Years</span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {ageData.months}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Months</span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 rounded-xl border border-[var(--hairline)] min-w-0">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ink-primary)] font-mono-num truncate">
                {ageData.days}
              </span>
              <span className="text-[11px] uppercase font-mono text-[var(--ink-mute)] block mt-0.5">Days</span>
            </div>
          </div>

          {/* Live Precision Ticker (If Active) */}
          {showTime && (
            <div className="my-3 px-4 py-2.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl flex items-center justify-between gap-3 text-xs animate-fade-in-down">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-body)]">
                <span className="h-2 w-2 rounded-full bg-[#0070f3] animate-ticker-dot" />
                <span>Live Age Ticker</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-[#50e3c2] bg-[var(--canvas-card)] px-3 py-1 rounded-lg border border-[var(--hairline)]">
                {String(liveHoursRem).padStart(2, '0')}h : {String(liveMinutesRem).padStart(2, '0')}m : {String(liveSecondsRem).padStart(2, '0')}s
              </div>
            </div>
          )}

          {/* Milestone Totals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-[var(--hairline)]">
            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Days</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {ageData.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Hours</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {ageData.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Total Weeks</span>
              <span className="text-sm sm:text-base font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5">
                {ageData.totalWeeks.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-[var(--canvas-card)] border border-[#0070f3]/30 rounded-lg flex items-center justify-between min-w-0 gap-1">
              <div className="min-w-0">
                <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase truncate">Next Birthday</span>
                <span className="text-xs sm:text-sm font-bold text-[#0070f3] font-mono-num block truncate mt-0.5">
                  {ageData.nextBirthdayDays} Days Left
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-[#f5a623] shrink-0" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <Calendar className="w-6 h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready to Calculate</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your Date of Birth in the box above to compute your exact age, lifetime milestones, and countdown.
          </p>
        </div>
      )}
    </div>
  );
};
