import { OfficeSettings, EmployeeProfile } from '../types/hrms';

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStr(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function minutesToFormattedTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Checks if a given checkIn time is late according to office start time & grace period.
 * Default: 10:00 AM office start, 15 min grace (up to 10:15 is on time).
 * If > 10:15, late minutes are counted from office start (e.g. 10:25 is 25 min late).
 */
export function evaluateCheckInPunctuality(
  checkInTimeStr: string,
  settings: OfficeSettings
): { isLate: boolean; lateMinutes: number; badgeText: string } {
  if (!checkInTimeStr) {
    return { isLate: false, lateMinutes: 0, badgeText: '—' };
  }

  const checkInMins = parseTimeToMinutes(checkInTimeStr);
  const officeStartMins = parseTimeToMinutes(settings.officeStartTime); // e.g. 10 * 60 = 600
  const graceThreshold = officeStartMins + (settings.gracePeriodMinutes || 0); // e.g. 615

  if (checkInMins <= graceThreshold) {
    return {
      isLate: false,
      lateMinutes: 0,
      badgeText: '✅ On time',
    };
  }

  const lateMinutes = checkInMins - officeStartMins;
  return {
    isLate: true,
    lateMinutes,
    badgeText: `⚠️ ${lateMinutes} min late`,
  };
}

/**
 * Calculates working hours between check-in and check-out.
 */
export function calculateWorkHours(checkInStr: string, checkOutStr: string): number {
  if (!checkInStr || !checkOutStr) return 0;
  const inMins = parseTimeToMinutes(checkInStr);
  const outMins = parseTimeToMinutes(checkOutStr);
  if (outMins <= inMins) return 0;
  const diffHours = (outMins - inMins) / 60;
  return Math.round(diffHours * 10) / 10;
}

export function formatHours(hours: number): string {
  if (!hours || hours <= 0) return '0 hrs';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Calculates number of calendar days between fromDate and toDate inclusive.
 */
export function calculateDaysBetween(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return 0;
  const from = new Date(fromDateStr + 'T00:00:00');
  const to = new Date(toDateStr + 'T00:00:00');
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
  if (to < from) return -1; // invalid range
  const diffTime = to.getTime() - from.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Returns an array of YYYY-MM-DD strings between fromDate and toDate inclusive.
 */
export function getDateRangeArray(fromDateStr: string, toDateStr: string): string[] {
  const dates: string[] = [];
  const from = new Date(fromDateStr + 'T00:00:00');
  const to = new Date(toDateStr + 'T00:00:00');
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return dates;

  const cur = new Date(from);
  while (cur <= to) {
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${d} ${monthName} ${y}`;
}

export function formatMonthDayPretty(monthDayStr: string): string {
  if (!monthDayStr) return '';
  const parts = monthDayStr.split('-');
  const m = parts.length === 3 ? parts[1] : parts[0];
  const d = parts.length === 3 ? parts[2] : parts[1];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(m, 10) - 1] || m;
  return `${d} ${monthName}`;
}

export interface UpcomingBirthdayInfo {
  employee: EmployeeProfile;
  formattedDate: string; // e.g. "14 Oct"
  daysRemaining: number;
  isToday: boolean;
  ageTurning?: number;
  birthDateString: string;
}

export function getUpcomingBirthdays(
  employees: EmployeeProfile[],
  referenceDateStr?: string
): UpcomingBirthdayInfo[] {
  const todayStr = referenceDateStr || getTodayDateStr();
  const [refYearStr, refMonthStr, refDayStr] = todayStr.split('-');
  const refYear = parseInt(refYearStr, 10);
  const refDate = new Date(`${todayStr}T00:00:00`);

  const list: UpcomingBirthdayInfo[] = [];

  for (const emp of employees) {
    if (!emp.dateOfBirth) continue;
    const parts = emp.dateOfBirth.split('-');
    if (parts.length < 3) continue;

    const bYear = parseInt(parts[0], 10);
    const bMonth = parseInt(parts[1], 10);
    const bDay = parseInt(parts[2], 10);

    // This year's birthday
    let nextBday = new Date(refYear, bMonth - 1, bDay);
    let targetYear = refYear;

    // Check if birthday has passed this year
    // Set hours to 0 to compare dates accurately
    nextBday.setHours(0, 0, 0, 0);

    if (nextBday < refDate) {
      // It has passed this year, so next birthday is next year
      nextBday = new Date(refYear + 1, bMonth - 1, bDay);
      targetYear = refYear + 1;
    }

    const diffMs = nextBday.getTime() - refDate.getTime();
    const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isToday = daysRemaining === 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${bDay} ${months[bMonth - 1]}`;

    list.push({
      employee: emp,
      formattedDate,
      daysRemaining,
      isToday,
      ageTurning: targetYear - bYear,
      birthDateString: emp.dateOfBirth,
    });
  }

  // Sort by daysRemaining ascending
  return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

