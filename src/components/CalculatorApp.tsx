import React, { useState, useEffect } from 'react';
import { UPSCMode } from './modes/UPSCMode';
import { NormalAgeMode } from './modes/NormalAgeMode';
import { DateDiffMode } from './modes/DateDiffMode';
import { RelaxationTable } from './RelaxationTable';
import { ShieldCheck, Calendar, ArrowRightLeft } from 'lucide-react';

export type ModeType = 'upsc' | 'normal' | 'datediff';

export const CalculatorApp: React.FC = () => {
  const [mode, setMode] = useState<ModeType>('upsc');
  // Shared DOB state maintained across modes (empty by default)
  const [sharedDob, setSharedDob] = useState<string>('');

  // URL query parameter sync for sharing exact calculation view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode') as ModeType;
      const urlDob = params.get('dob');
      if (urlMode && ['upsc', 'normal', 'datediff'].includes(urlMode)) {
        setMode(urlMode);
      }
      if (urlDob) {
        setSharedDob(urlDob);
      }
    }
  }, []);

  const handleModeChange = (newMode: ModeType) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', newMode);
      url.searchParams.set('dob', sharedDob);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleDobChange = (newDob: string) => {
    setSharedDob(newDob);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('dob', newDob);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Three Hero Mode Cards / Tabs directly at top of the page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-[var(--canvas-inset)] border border-[var(--hairline)] rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-colors">
        {/* Mode 1 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('upsc')}
          className={`p-4 rounded-xl text-left transition flex items-start gap-3 relative ${
            mode === 'upsc'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/50 border border-transparent'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              mode === 'upsc' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)]' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--ink-mute)]">Mode 1</span>
              {mode === 'upsc' && <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />}
            </div>
            <h3 className="text-sm font-bold tracking-tight mt-0.5">UPSC Age & Eligibility</h3>
            <p className="text-[11px] text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Exact 1st August cutoff, attempt counter & relaxations
            </p>
          </div>
        </button>

        {/* Mode 2 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('normal')}
          className={`p-4 rounded-xl text-left transition flex items-start gap-3 relative ${
            mode === 'normal'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/50 border border-transparent'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              mode === 'normal' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)]' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--ink-mute)]">Mode 2</span>
              {mode === 'normal' && <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />}
            </div>
            <h3 className="text-sm font-bold tracking-tight mt-0.5">Normal Age Calculator</h3>
            <p className="text-[11px] text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Exact age as of today + live second-by-second ticker
            </p>
          </div>
        </button>

        {/* Mode 3 Tab */}
        <button
          type="button"
          onClick={() => handleModeChange('datediff')}
          className={`p-4 rounded-xl text-left transition flex items-start gap-3 relative ${
            mode === 'datediff'
              ? 'bg-[var(--canvas-card)] text-[var(--ink-primary)] border border-[var(--hairline)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'text-[var(--ink-body)] hover:text-[var(--ink-primary)] hover:bg-[var(--canvas-card)]/50 border border-transparent'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              mode === 'datediff' ? 'bg-[var(--ink-primary)] text-[var(--canvas-card)]' : 'bg-[var(--hairline)] text-[var(--ink-body)]'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--ink-mute)]">Mode 3</span>
              {mode === 'datediff' && <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />}
            </div>
            <h3 className="text-sm font-bold tracking-tight mt-0.5">Date Difference</h3>
            <p className="text-[11px] text-[var(--ink-mute)] line-clamp-1 mt-0.5">
              Age gaps, event intervals & unit breakdowns
            </p>
          </div>
        </button>
      </div>

      {/* Active Mode Render */}
      <div>
        {mode === 'upsc' && <UPSCMode dob={sharedDob} onDobChange={handleDobChange} />}
        {mode === 'normal' && <NormalAgeMode dob={sharedDob} onDobChange={handleDobChange} />}
        {mode === 'datediff' && <DateDiffMode />}
      </div>

      {/* Collapsible Category Relaxation Reference Matrix */}
      <RelaxationTable />
    </div>
  );
};
