import React, { useState, useMemo } from 'react';
import { calculateDateDifference, formatDateForInput } from '../../lib/date-utils';
import { DateInputField } from '../DateInputField';
import { Dog, Heart, Moon, Copy, Check, Info } from 'lucide-react';

export type DogSize = 'small' | 'medium' | 'large' | 'giant';

export const DogAgeMode: React.FC = () => {
  const [dob, setDob] = useState<string>('');
  const [dogSize, setDogSize] = useState<DogSize>('medium');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [copied, setCopied] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);

  const parsedDob = useMemo(() => {
    if (!dob) return null;
    const [y, m, d] = dob.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [dob]);

  // Actual Calendar Age of Dog
  const calendarAge = useMemo(() => {
    if (!parsedDob) return null;
    return calculateDateDifference(parsedDob, today);
  }, [parsedDob, today]);

  // Veterinary Human Equivalent Age Formula
  const humanAge = useMemo(() => {
    if (!calendarAge) return 0;
    const totalYears = calendarAge.years + calendarAge.months / 12;
    if (totalYears <= 0) return 0;
    if (totalYears <= 1) {
      return Math.round(totalYears * 15);
    }
    if (totalYears <= 2) {
      return Math.round(15 + (totalYears - 1) * 9);
    }
    // After 2 years: size multiplier
    const base = 24;
    const remainingYears = totalYears - 2;
    let multiplier = 5; // default medium
    if (dogSize === 'small') multiplier = 4;
    if (dogSize === 'medium') multiplier = 5;
    if (dogSize === 'large') multiplier = 6;
    if (dogSize === 'giant') multiplier = 7.5;

    return Math.round(base + remainingYears * multiplier);
  }, [calendarAge, dogSize]);

  // Life Stage Determination
  const lifeStage = useMemo(() => {
    if (!calendarAge) return null;
    if (calendarAge.years < 1) return { name: 'Puppy Stage', sleep: '18–20 hours/day', tip: 'High calorie puppy food, frequent small meals (3–4 times daily).' };
    if (calendarAge.years < 3) return { name: 'Young Adult', sleep: '12–14 hours/day', tip: 'High energy exercise, adult maintenance diet.' };
    if (calendarAge.years < 7) return { name: 'Mature Adult', sleep: '12–14 hours/day', tip: 'Balanced adult diet, regular wellness checkups.' };
    return { name: 'Senior Dog (7+ Yrs)', sleep: '14–18 hours/day', tip: 'Soft joint care food, gentle exercise, bi-annual vet checks.' };
  }, [calendarAge]);

  const handleCopySummary = () => {
    if (!calendarAge || !lifeStage) return;
    const text = `🐶 Dog Age Calculator Summary
📅 Dog Date of Birth: ${dob}
📏 Breed Size: ${dogSize.toUpperCase()}
🎂 Actual Calendar Age: ${calendarAge.years} yrs, ${calendarAge.months} mos
❤️ Human Equivalent Age: ${humanAge} Human Years
🐾 Life Stage: ${lifeStage.name}
📍 Calculated via agecalculatorupsc.com/dog-age-calculator`;

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
            <span className="text-lg sm:text-xl">🐶</span>
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[var(--ink-primary)]">
              Dog Age & Human Years Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md sm:rounded-lg text-[var(--ink-body)] font-medium">
            AVMA Formula
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-7 pt-4 sm:pt-5">
          {/* DOB */}
          <DateInputField
            label="Dog's Date of Birth"
            value={dob}
            max={formatDateForInput(today)}
            onChange={(val) => {
              const maxStr = formatDateForInput(today);
              const clamped = val > maxStr ? maxStr : val;
              setDob(clamped);
            }}
          />

          {/* Breed Size Selector */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                Dog Breed Size <span className="text-[#ee0000]">*</span>
              </label>

              {/* Unit Toggle Switch */}
              <div className="inline-flex items-center p-0.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg text-xs font-mono font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition cursor-pointer select-none ${
                    unit === 'lbs' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] shadow-xs' : 'text-[var(--ink-mute)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  lbs
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition cursor-pointer select-none ${
                    unit === 'kg' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] shadow-xs' : 'text-[var(--ink-mute)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {(['small', 'medium', 'large', 'giant'] as DogSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setDogSize(size)}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl md:rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs ${
                    dogSize === size
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)] shadow-sm scale-[1.02]'
                      : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)] hover:bg-[var(--canvas-card)]'
                  }`}
                >
                  <div className="font-bold capitalize">{size}</div>
                  <div className="text-[10px] sm:text-[11px] opacity-80 mt-0.5 font-mono">
                    {size === 'small' ? (unit === 'lbs' ? '< 20 lbs' : '< 9 kg') :
                     size === 'medium' ? (unit === 'lbs' ? '20–50 lbs' : '9–23 kg') :
                     size === 'large' ? (unit === 'lbs' ? '50–90 lbs' : '23–41 kg') :
                     (unit === 'lbs' ? '90+ lbs' : '41+ kg')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {calendarAge && lifeStage ? (
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs relative transition-colors animate-fade-in-down space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#ee0000]" />
              <span className="text-xs sm:text-sm uppercase font-mono tracking-wider font-bold text-[var(--ink-mute)]">
                Human Years Equivalent
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

          {/* Primary Human Equivalent Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <div className="bg-[var(--canvas-inset)] p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center shadow-2xs">
              <span className="text-[11px] sm:text-xs font-mono uppercase font-semibold text-[var(--ink-mute)]">Human Equivalent Age</span>
              <span className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0070f3] dark:text-[#38bdf8] font-mono-num mt-1">
                {humanAge}
              </span>
              <span className="text-xs sm:text-sm text-[var(--ink-body)] mt-0.5 sm:mt-1 font-semibold">Human Years Old</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center shadow-2xs">
              <span className="text-[11px] sm:text-xs font-mono uppercase font-semibold text-[var(--ink-mute)]">Actual Calendar Age</span>
              <span className="text-xl sm:text-3xl md:text-4xl font-bold text-[var(--ink-primary)] font-mono-num mt-1">
                {calendarAge.years} yrs, {calendarAge.months} mos
              </span>
              <span className="text-xs sm:text-sm text-[var(--ink-mute)] mt-0.5 sm:mt-1 font-medium">{calendarAge.totalDays.toLocaleString()} Days Lived</span>
            </div>
          </div>

          {/* Life Stage & Care Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-[var(--hairline)]">
            <div className="p-3.5 sm:p-5 bg-[var(--canvas-inset)] rounded-xl sm:rounded-2xl border border-[var(--hairline)] space-y-1 sm:space-y-1.5 shadow-2xs">
              <span className="block text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">Life Stage</span>
              <span className="text-sm sm:text-lg font-bold text-[var(--ink-primary)] block">{lifeStage.name}</span>
              <p className="text-xs sm:text-sm text-[var(--ink-body)] leading-relaxed">{lifeStage.tip}</p>
            </div>

            <div className="p-3.5 sm:p-5 bg-[var(--canvas-inset)] rounded-xl sm:rounded-2xl border border-[var(--hairline)] space-y-1 sm:space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[var(--ink-mute)] font-mono uppercase font-semibold">
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0070f3] dark:text-[#38bdf8]" /> Sleep Requirements
              </div>
              <span className="text-sm sm:text-lg font-bold text-[var(--ink-primary)] block">{lifeStage.sleep}</span>
              <p className="text-xs sm:text-sm text-[var(--ink-body)] leading-relaxed">Tailor sleep cycles and nutrition to this stage.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl text-center space-y-1.5 sm:space-y-2 shadow-xs">
          <Dog className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#0070f3]" />
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--ink-primary)]">Ready for Dog Age Calculation</h3>
          <p className="text-xs sm:text-sm text-[var(--ink-mute)] max-w-md mx-auto leading-relaxed">
            Enter your dog's Date of Birth in the box above to compute human equivalent age and life stage care.
          </p>
        </div>
      )}
    </div>
  );
};

