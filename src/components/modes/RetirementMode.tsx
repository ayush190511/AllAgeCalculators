import React, { useState, useEffect, useMemo } from 'react';
import { calculateAgeBreakdown, calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Briefcase, Calendar, Clock, Copy, Check, ShieldCheck, Award, Sliders, Plus, Minus } from 'lucide-react';

interface RetirementModeProps {
  initialDob?: string;
  title?: string;
  subtitle?: string;
}

export const RetirementMode: React.FC<RetirementModeProps> = ({ initialDob = '', title, subtitle }) => {
  const [dob, setDob] = useState<string>(initialDob);
  const [retirementAge, setRetirementAge] = useState<number>(60); // Default 60
  const [isCustomRetirement, setIsCustomRetirement] = useState<boolean>(false);
  const [customRetirementInput, setCustomRetirementInput] = useState<string>('60');

  // User-configurable Career Start Age (Work Joining Age)
  const [careerStartAge, setCareerStartAge] = useState<number>(22);

  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    setDob(initialDob || '');
  }, [initialDob]);

  const parsedDob = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  // Calculate current exact age
  const currentAge = useMemo(() => {
    if (!parsedDob) return null;
    return calculateAgeBreakdown(parsedDob, today);
  }, [parsedDob, today]);

  // Active Retirement Target Age
  const activeRetirementAge = useMemo(() => {
    if (isCustomRetirement) {
      const parsed = parseInt(customRetirementInput, 10);
      return isNaN(parsed) || parsed <= 0 ? 60 : parsed;
    }
    return retirementAge;
  }, [isCustomRetirement, customRetirementInput, retirementAge]);

  // Calculate retirement date (DOB + activeRetirementAge years)
  const retirementDate = useMemo(() => {
    if (!parsedDob) return null;
    const ret = new Date(parsedDob);
    ret.setFullYear(ret.getFullYear() + activeRetirementAge);
    return ret;
  }, [parsedDob, activeRetirementAge]);

  // Calculate time remaining until retirement
  const remaining = useMemo(() => {
    if (!retirementDate) return null;
    if (today >= retirementDate) {
      return { isRetired: true, years: 0, months: 0, days: 0, totalDays: 0 };
    }
    const diff = calculateDateDifference(today, retirementDate);
    return { isRetired: false, ...diff };
  }, [today, retirementDate]);

  // Career progress percentage based on custom Joining Age and Target Retirement Age
  const progressPercent = useMemo(() => {
    if (!currentAge) return 0;
    const totalWorkingYears = Math.max(1, activeRetirementAge - careerStartAge);
    const yearsWorked = Math.max(0, currentAge.years - careerStartAge);
    const pct = Math.min(100, Math.max(0, (yearsWorked / totalWorkingYears) * 100));
    return Math.round(pct);
  }, [currentAge, activeRetirementAge, careerStartAge]);

  const handleCopySummary = () => {
    if (!currentAge || !retirementDate || !remaining) return;
    const text = `🏖️ Retirement Countdown Summary
📅 Date of Birth: ${dob}
💼 Work Joining Age: ${careerStartAge} Years
🎯 Target Retirement Age: ${activeRetirementAge} Years
📅 Official Retirement Date: ${formatDateForInput(retirementDate)}
⏳ Current Age: ${currentAge.years} yrs, ${currentAge.months} mos, ${currentAge.days} days
⏱️ Time Remaining: ${remaining.isRetired ? 'Already Retired!' : `${remaining.years} yrs, ${remaining.months} mos, ${remaining.days} days`}
📊 Career Progress: ${progressPercent}% Completed
📍 Calculated via allagecalculators.com/retirement-age-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAges = [58, 60, 62, 65, 70, 73];

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        {/* Card Header Title */}
        <div className="border-b border-[var(--hairline)] pb-3 sm:pb-3.5 mb-3.5 sm:mb-4 text-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-[var(--ink-primary)]">
            {title || "Retirement Age Calculator"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-body)] mt-1 max-w-xl mx-auto leading-relaxed">
            {subtitle || "Calculate exact years, months, and days remaining until your target pension or retirement milestone."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">
          {/* DOB */}
          <DateInputField
            label="Your Date of Birth"
            value={dob}
            max={formatDateForInput(today)}
            onChange={(val) => {
              const maxStr = formatDateForInput(today);
              const clamped = val > maxStr ? maxStr : val;
              setDob(clamped);
            }}
          />

          {/* Steppers & Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Work Joining Age Stepper */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)]">
                Joining Age <span className="text-[#ee0000]">*</span>
              </label>
              <div className="flex items-center h-9 sm:h-10 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCareerStartAge((prev) => Math.max(15, prev - 1))}
                  className="h-full px-2.5 sm:px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none"
                  aria-label="Decrease joining age"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={15}
                  max={85}
                  value={careerStartAge}
                  onChange={(e) => setCareerStartAge(Math.max(10, Math.min(85, Number(e.target.value) || 22)))}
                  className="w-full h-full text-center bg-transparent text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCareerStartAge((prev) => Math.min(85, prev + 1))}
                  className="h-full px-2.5 sm:px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition flex items-center justify-center cursor-pointer select-none"
                  aria-label="Increase joining age"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Target Age Stepper / Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)]">
                Target Age <span className="text-[#ee0000]">*</span>
              </label>
              <select
                value={isCustomRetirement ? 'custom' : retirementAge}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomRetirement(true);
                  } else {
                    setIsCustomRetirement(false);
                    setRetirementAge(Number(e.target.value));
                  }
                }}
                className="w-full h-9 sm:h-10 px-2.5 sm:px-3 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 cursor-pointer shadow-2xs"
              >
                {presetAges.map((age) => (
                  <option key={age} value={age}>
                    {age} Yrs {age === 60 ? '(Govt)' : age === 73 ? '(RMD)' : ''}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>

          {isCustomRetirement && (
            <div className="md:col-span-2 flex items-center h-9 sm:h-10 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg overflow-hidden animate-fade-in-down shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customRetirementInput, 10) || 60;
                  setCustomRetirementInput(String(Math.max(30, current - 1)));
                }}
                className="h-full px-2.5 sm:px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={30}
                max={100}
                value={customRetirementInput}
                onChange={(e) => setCustomRetirementInput(e.target.value)}
                placeholder="Custom Target Retirement Age"
                className="w-full h-full text-center bg-transparent text-xs sm:text-sm font-mono font-bold text-[var(--ink-primary)] no-spinner focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customRetirementInput, 10) || 60;
                  setCustomRetirementInput(String(Math.min(100, current + 1)));
                }}
                className="h-full px-2.5 sm:px-3 text-[var(--ink-primary)] hover:bg-[var(--hairline)] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Display */}
      {currentAge && retirementDate && remaining ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-5.5 shadow-xs relative transition-colors animate-fade-in-down space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0070f3]" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--ink-mute)]">
                Retirement Countdown
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

          {/* Big Remaining Time Display */}
          {remaining.isRetired ? (
            <div className="p-3.5 sm:p-4 bg-[var(--canvas-inset)] border border-[var(--hairline)] text-center rounded-lg sm:rounded-xl shadow-2xs">
              <div className="text-base sm:text-xl font-bold text-[#0070f3] dark:text-[#38bdf8]">🎉 Already Retired!</div>
              <p className="text-xs text-[var(--ink-mute)] mt-0.5 font-medium">Target retirement age reached on {formatDateForInput(retirementDate)}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
                <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                  {remaining.years}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                  Years Left
                </span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
                <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                  {remaining.months}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                  Months Left
                </span>
              </div>
              <div className="bg-[var(--canvas-inset)] p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border border-[var(--hairline)] min-w-0 shadow-2xs">
                <span className="block text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-[var(--ink-primary)] font-mono-num tracking-tight truncate">
                  {remaining.days}
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-mono font-bold text-[var(--ink-mute)] block mt-0.5 sm:mt-1">
                  Days Left
                </span>
              </div>
            </div>
          )}

          {/* Career Progress Bar */}
          <div className="space-y-1.5 p-3 bg-[var(--canvas-inset)] rounded-lg sm:rounded-xl border border-[var(--hairline)] shadow-2xs">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--ink-body)] font-medium truncate">Career Track (Age {careerStartAge} &rarr; {activeRetirementAge})</span>
              <span className="font-bold text-[var(--ink-primary)] shrink-0">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-[var(--canvas-card)] h-2 sm:h-2.5 rounded-full overflow-hidden border border-[var(--hairline)]">
              <div
                className="bg-[#0070f3] dark:bg-[#38bdf8] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timeline Chips */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2.5 border-t border-[var(--hairline)] text-xs">
            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Current Age</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num block truncate mt-0.5">
                {currentAge.years}y {currentAge.months}m
              </span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Pension Date</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[#0070f3] dark:text-[#38bdf8] font-mono-num block truncate mt-0.5">
                {formatDateForInput(retirementDate)}
              </span>
            </div>

            <div className="p-2 sm:p-2.5 md:p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] min-w-0 shadow-2xs">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase font-semibold truncate">Days Left</span>
              <span className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] font-mono-num block truncate mt-0.5">
                {remaining.totalDays.toLocaleString()} Days
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 md:p-7 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl text-center space-y-1.5 shadow-xs">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm sm:text-base font-bold text-[var(--ink-primary)]">Ready for Retirement Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your Date of Birth in the box above to compute your retirement countdown and pension milestone date.
          </p>
        </div>
      )}
    </div>
  );
};
