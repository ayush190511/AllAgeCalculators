export type Category = 'GEN' | 'EWS' | 'OBC' | 'SC' | 'ST';

export interface RelaxationOptions {
  pwbd: boolean; // Person with Benchmark Disabilities (+10 yrs)
  exServicemen: boolean; // Ex-Servicemen / ECO / SSCO (+5 yrs, max age capped at 37)
  defenceOps: boolean; // Defence personnel disabled in operations (+3 yrs for GEN/OBC, +8 SC/ST)
  jkDomicile: boolean; // J&K Domicile (1980-1981 to 1989-1999) (+2 yrs)
}

export interface UPSCEligibilityResult {
  status: 'eligible' | 'overage' | 'underage';
  ageOnCutoff: {
    years: number;
    months: number;
    days: number;
  };
  cutoffDateStr: string;
  cutoffDate: Date;
  minAge: number;
  maxAgeAllowed: number;
  attemptsAllowed: number | 'Unlimited';
  attemptsRemaining: number | 'Unlimited';
  yearsRemaining: number; // exam cycles left before overage
  explanation: string;
  dobBounds: {
    minDobStr: string; // e.g. 2nd August 1994
    maxDobStr: string; // e.g. 1st August 2005
  };
  relaxationsApplied: string[];
}

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalWeeks: number;
  nextBirthdayDays: number;
  nextBirthdayDateStr: string;
}

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  isPast: boolean;
}

export interface ExamRules {
  id: string;
  name: string;
  fullName: string;
  cutoffMonth: number; // 0-indexed, 7 = August
  cutoffDay: number; // 1
  minAge: number;
  baseMaxAge: Record<Category, number>;
  baseAttempts: Record<Category, number | 'Unlimited'>;
  pwbdMaxAge: Record<Category, number>;
  pwbdAttempts: Record<Category, number | 'Unlimited'>;
  exServicemenMaxAgeCap?: number;
}
