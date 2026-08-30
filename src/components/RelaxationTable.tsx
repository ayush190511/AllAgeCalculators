import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Table, Info } from 'lucide-react';

export const RelaxationTable: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xs transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 md:px-7 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-[var(--canvas-card)] hover:bg-[var(--canvas-inset)] transition text-left cursor-pointer"
      >
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <Table className="w-4 h-4 sm:w-5 sm:h-5 text-[#0070f3] shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-[var(--ink-primary)] tracking-tight">
              Official UPSC Category Age Relaxation & Attempt Limits Table
            </h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-[var(--ink-mute)] mt-0.5">
              Reference guide for General, EWS, OBC, SC, ST, PwBD, Ex-Servicemen & J&K Domiciles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-md sm:rounded-lg bg-[var(--canvas-inset)] border border-[var(--hairline)] text-[var(--ink-body)] font-medium">
            {isOpen ? 'Collapse Table' : 'Expand Matrix'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ink-primary)]" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ink-mute)]" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:p-5 md:p-7 border-t border-[var(--hairline)] bg-[var(--canvas-inset)] space-y-3 sm:space-y-4">
          <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-[var(--hairline)]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--canvas-card)] text-[var(--ink-mute)] uppercase font-mono text-[10px] sm:text-xs">
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Category</th>
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Min Age</th>
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Max Age (Base)</th>
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Attempt Limit</th>
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Crucial Cutoff Date</th>
                  <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">Key Relaxations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)] bg-[var(--canvas-card)] font-mono-num text-[var(--ink-primary)]">
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">General (GEN)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">32 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">6 Attempts</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-mute)] font-sans">None (Standard baseline)</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">EWS (Economically Weaker)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">32 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">6 Attempts</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-mute)] font-sans">Income/asset eligibility criteria applies</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">OBC (Non-Creamy Layer)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#0070f3]">35 Years (+3 Yrs)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">9 Attempts</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-body)] font-sans">+3 years age relaxation, 9 attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">Scheduled Caste (SC)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#0070f3]">37 Years (+5 Yrs)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#0070f3]">Unlimited</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-body)] font-sans">+5 years age relaxation, unlimited attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">Scheduled Tribe (ST)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#0070f3]">37 Years (+5 Yrs)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#0070f3]">Unlimited</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-body)] font-sans">+5 years age relaxation, unlimited attempts</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition bg-[var(--canvas-inset)]">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">PwBD (Disabilities)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#7928ca]">+10 Years (42-47)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold">9 (GEN/OBC) / Unlimited (SC/ST)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-body)] font-sans">+10 years added across all categories</td>
                </tr>
                <tr className="hover:bg-[var(--canvas-inset)] transition bg-[var(--canvas-inset)]">
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[var(--ink-primary)]">Ex-Servicemen (ECO/SSCO)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">21 Years</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-[#7928ca]">+5 Years (Cap 37)</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">As per Category</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">1st August of Exam Year</td>
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[var(--ink-body)] font-sans">Must have minimum 5 years military service</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2.5 p-4 bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-xl text-xs sm:text-sm text-[var(--ink-mute)] shadow-2xs">
            <Info className="w-5 h-5 text-[#0070f3] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong className="text-[var(--ink-primary)] font-semibold">Crucial Rule Note:</strong> Age calculation is strictly as on <strong>1st August</strong> of the target exam year (Rule 6 of UPSC CSE Gazette Notification). Candidates born on 1st August are considered to have completed the exact age on that date.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
