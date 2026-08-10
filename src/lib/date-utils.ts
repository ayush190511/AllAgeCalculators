import type { AgeBreakdown, DateDiffResult } from './types';

/**
 * Calculates exact difference in Years, Months, and Days between two dates.
 * Handles month boundaries and leap years correctly.
 */
export function calculateExactYMD(startDate: Date, endDate: Date): { years: number; months: number; days: number } {
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months -= 1;
    // Get last day of the previous month relative to endDate
    const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Calculates comprehensive Age Breakdown as of today (or target date)
 */
export function calculateAgeBreakdown(dob: Date, targetDate: Date = new Date()): AgeBreakdown {
  const ymd = calculateExactYMD(dob, targetDate);

  const diffMs = Math.abs(targetDate.getTime() - dob.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalWeeks = Math.floor(totalDays / 7);

  // Next Birthday Calculation
  const currentYear = targetDate.getFullYear();
  let nextBday = new Date(currentYear, dob.getMonth(), dob.getDate());
  
  if (nextBday < targetDate) {
    nextBday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
  }

  const nextBdayDiffMs = nextBday.getTime() - targetDate.getTime();
  const nextBirthdayDays = Math.ceil(nextBdayDiffMs / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const nextBirthdayDateStr = nextBday.toLocaleDateString('en-IN', options);

  return {
    years: ymd.years,
    months: ymd.months,
    days: ymd.days,
    totalDays,
    totalHours,
    totalWeeks,
    nextBirthdayDays,
    nextBirthdayDateStr,
  };
}

/**
 * Calculates difference between two arbitrary dates (with optional times)
 */
export function calculateDateDifference(from: Date, to: Date): DateDiffResult {
  const isPast = from <= to;
  const startDate = isPast ? from : to;
  const endDate = isPast ? to : from;

  const ymd = calculateExactYMD(startDate, endDate);

  const diffMs = endDate.getTime() - startDate.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    years: ymd.years,
    months: ymd.months,
    days: ymd.days,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    isPast,
  };
}

/**
 * Format a Date to YYYY-MM-DD for input fields
 */
export function formatDateForInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format a Date to human readable string (e.g. 1st August 2026)
 */
export function formatDateHuman(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}
