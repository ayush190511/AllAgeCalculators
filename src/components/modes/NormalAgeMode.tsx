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
    <div className="space-y-4 sm:space-y-6">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#0070f3] shadow-[0_0_8px_rgba(0,112,243,0.6)]" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[var(--ink-primary)]">
              Chronological Age & Live Ticker Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md sm:rounded-lg text-[var(--ink-body)] font-medium">
            Live as of Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-7 pt-4 sm:pt-5">
          <DateInputField
            label="Date of Birth"
            value={dob}
            max={todayStr}
            onChange={(val) => handleDobInputChange(val)}
            helpText={dateError || undefined}
          />

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ink-primary)]">
              Birth Time Precision (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-h-[40px] sm:min-h-[48px]">
              <button
                type="button"
                onClick={() => setShowTime(!showTime)}
                className={`h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl border transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs ${
                  showTime
                    ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm'
                    : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
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
                    className="h-10 sm:h-12 px-3 sm:px-4 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 focus:border-[#0070f3] shadow-2xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Optional Place of Birth & Timezone Adjustment */}
          <div className="md:col-span-2 pt-2 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setShowPlace(!showPlace)}
              className="text-xs sm:text-sm font-semibold text-[#0070f3] dark:text-[#38bdf8] hover:underline flex items-center gap-1.5 cursor-pointer select-none py-1"
            >
              <span>{showPlace ? '– Hide Place of Birth & Timezone' : '+ Add Place of Birth & Timezone (Optional)'}</span>
            </button>

            {showPlace && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2.5 sm:mt-3 p-3.5 sm:p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl animate-fade-in-down">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-mute)] font-semibold">
                    City / Place of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, India or London, UK"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full h-9 sm:h-11 px-3 sm:px-3.5 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm text-[var(--ink-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--ink-mute)] font-semibold">
                    Birth Timezone Offset
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full h-9 sm:h-11 px-2.5 sm:px-3 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-lg sm:rounded-xl text-xs sm:text-sm text-[var(--ink-primary)] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 cursor-pointer"
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
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs relative transition-colors animate-fade-in-down space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#0070f3]" />
              <span className="text-xs sm:text-sm uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">
                Current Age as of Today
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

          {/* Primary Y/M/D Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-4 text-center">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.years}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Years
              </span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.months}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Months
              </span>
            </div>
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                {ageData.days}
              </span>
              <span className="text-[11px] sm:text-sm uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-2">
                Days
              </span>
            </div>
          </div>

          {/* Live Precision Ticker (If Active) */}
          {showTime && (
            <div className="p-3 sm:p-4 md:p-5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm animate-fade-in-down shadow-2xs">
              <div className="flex items-center gap-2 font-mono font-semibold text-[var(--ink-body)]">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#0070f3] animate-ticker-dot" />
                <span>Live Age Ticker:</span>
              </div>
              <div className="font-mono text-sm sm:text-lg md:text-xl font-black text-[#0070f3] dark:text-[#38bdf8] bg-[var(--canvas-card)] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-[var(--hairline)] shadow-xs">
                {String(liveHoursRem).padStart(2, '0')}h : {String(liveMinutesRem).padStart(2, '0')}m : {String(liveSecondsRem).padStart(2, '0')}s
              </div>
            </div>
          )}

          {/* Milestone Totals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-3 border-t border-[var(--hairline)]">
            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Days</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {ageData.totalDays.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Hours</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {ageData.totalHours.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Total Weeks</span>
              <span className="text-sm sm:text-base md:text-xl font-bold text-[var(--ink-primary)] font-mono-num truncate block mt-0.5 sm:mt-1">
                {ageData.totalWeeks.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 md:p-4 bg-[var(--canvas-card)] border border-[#0070f3]/40 dark:border-[#38bdf8]/40 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-between min-w-0 gap-1.5 sm:gap-2 shadow-2xs">
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Next Birthday</span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-[#0070f3] dark:text-[#38bdf8] font-mono-num block truncate mt-0.5 sm:mt-1">
                  {ageData.nextBirthdayDays} Days Left
                </span>
              </div>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5a623] shrink-0" />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl text-center space-y-1.5 sm:space-y-2 shadow-xs">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#0070f3]" />
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)]">Ready to Calculate</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your Date of Birth in the box above to compute your exact age, lifetime milestones, and next birthday countdown.
          </p>
        </div>
      )}
    </div>
  );
};
