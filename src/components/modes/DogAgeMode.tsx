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
    <div className="space-y-4 sm:space-y-5">
      {/* Input Card */}
      <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐶</span>
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[var(--ink-primary)]">
              Dog Age & Human Years Engine
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-md text-[var(--ink-body)]">
            AVMA Formula
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--ink-body)]">
                Dog Breed Size <span className="text-[#ee0000]">*</span>
              </label>

              {/* Unit Toggle Switch */}
              <div className="inline-flex items-center p-0.5 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg text-[11px] font-mono font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer select-none ${
                    unit === 'lbs' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] shadow-xs' : 'text-[var(--ink-mute)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  lbs
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer select-none ${
                    unit === 'kg' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] shadow-xs' : 'text-[var(--ink-mute)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'giant'] as DogSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setDogSize(size)}
                  className={`p-2 rounded-lg border text-left text-xs font-medium transition cursor-pointer ${
                    dogSize === size
                      ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)] border-[var(--ink-primary)]'
                      : 'bg-[var(--canvas-inset)] text-[var(--ink-body)] border-[var(--hairline)] hover:border-[var(--ink-primary)]'
                  }`}
                >
                  <div className="font-bold capitalize">{size}</div>
                  <div className="text-[10px] opacity-80">
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
        <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs relative transition-colors animate-fade-in-down">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#ee0000]" />
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--ink-mute)]">Human Years Equivalent</span>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-lg hover:border-[var(--ink-primary)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0070f3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Primary Human Equivalent Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-3">
            <div className="bg-[var(--canvas-inset)] p-3 sm:p-4 rounded-xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center">
              <span className="text-[11px] font-mono uppercase text-[var(--ink-mute)]">Human Equivalent Age</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0070f3] font-mono-num mt-0.5">
                {humanAge}
              </span>
              <span className="text-xs text-[var(--ink-body)] mt-0.5 font-medium">Human Years Old</span>
            </div>

            <div className="bg-[var(--canvas-inset)] p-3 sm:p-4 rounded-xl border border-[var(--hairline)] flex flex-col justify-center items-center text-center">
              <span className="text-[11px] font-mono uppercase text-[var(--ink-mute)]">Actual Calendar Age</span>
              <span className="text-lg sm:text-2xl font-bold text-[var(--ink-primary)] font-mono-num mt-0.5">
                {calendarAge.years} yrs, {calendarAge.months} mos
              </span>
              <span className="text-[11px] text-[var(--ink-mute)] mt-0.5">{calendarAge.totalDays.toLocaleString()} Days Lived</span>
            </div>
          </div>

          {/* Life Stage & Care Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[var(--hairline)] text-xs">
            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] space-y-1">
              <span className="block text-[10px] text-[var(--ink-mute)] font-mono uppercase">Life Stage</span>
              <span className="text-sm font-bold text-[var(--ink-primary)]">{lifeStage.name}</span>
              <p className="text-[11px] text-[var(--ink-body)]">{lifeStage.tip}</p>
            </div>

            <div className="p-3 bg-[var(--canvas-inset)] rounded-lg border border-[var(--hairline)] space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-[var(--ink-mute)] font-mono uppercase">
                <Moon className="w-3 h-3 text-[#0070f3]" /> Sleep Requirements
              </div>
              <span className="text-sm font-bold text-[var(--ink-primary)]">{lifeStage.sleep}</span>
              <p className="text-[11px] text-[var(--ink-body)]">Tailor sleep cycles and nutrition to this stage.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-center space-y-1.5">
          <Dog className="w-6 h-6 mx-auto text-[#0070f3]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">Ready for Dog Age Calculation</h3>
          <p className="text-xs text-[var(--ink-mute)] max-w-sm mx-auto">
            Enter your dog's Date of Birth in the box above to compute human equivalent age and life stage care.
          </p>
        </div>
      )}
    </div>
  );
};

