export type Presentation = 'date-time' | 'time-date' | 'date' | 'time' | 'week' | 'month' | 'year' | 'month-year';
export type Platform = 'ios' | 'material';
export type HourCycle = 'h12' | 'h24';

export interface PickerDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

// ---- Month / day names ----

let _monthNamesCache = new Map<string, string[]>();
let _dayNamesCache = new Map<string, string[]>();

export function getMonthNames(locale: string): string[] {
  const key = `month:${locale}`;
  if (_monthNamesCache.has(key)) return _monthNamesCache.get(key)!;
  const names: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2000, i, 1);
    names.push(d.toLocaleString(locale, { month: 'short' }));
  }
  _monthNamesCache.set(key, names);
  return names;
}

export function getDayNames(locale: string, firstDayOfWeek = 0): string[] {
  const key = `day:${locale}:${firstDayOfWeek}`;
  if (_dayNamesCache.has(key)) return _dayNamesCache.get(key)!;
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, i + 1);
    names.push(d.toLocaleString(locale, { weekday: 'short' }));
  }
  const reordered = [...names.slice(firstDayOfWeek), ...names.slice(0, firstDayOfWeek)];
  _dayNamesCache.set(key, reordered);
  return reordered;
}

// ---- Calendar math ----

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number, firstDayOfWeek = 0): number {
  const raw = new Date(year, month, 1).getDay();
  return (raw - firstDayOfWeek + 7) % 7;
}

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
}

export function getCalendarDays(year: number, month: number, firstDayOfWeek = 0): CalendarDay[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getFirstDayOfMonth(year, month, firstDayOfWeek);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  for (let i = 0; i < startOffset; i++) {
    currentWeek.push({ day: prevMonthDays - startOffset + i + 1, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push({ day: d, isCurrentMonth: true });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  let nextDay = 1;
  while (currentWeek.length < 7) {
    currentWeek.push({ day: nextDay++, isCurrentMonth: false });
  }
  weeks.push(currentWeek);

  return weeks;
}

// ---- Value parsing / formatting ----

export function parsePickerValue(value: string | string[] | null | undefined, presentation: Presentation): PickerDate {
  const now = new Date();
  const fallback: PickerDate = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hour: now.getHours(), minute: 0 };

  if (!value) return fallback;

  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return fallback;

  const hasDate = ['date', 'date-time', 'time-date', 'week', 'month', 'month-year', 'year'].includes(presentation);
  const hasTime = ['time', 'date-time', 'time-date'].includes(presentation);

  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hour = 0;
  let minute = 0;

  if (presentation === 'year') {
    const y = parseInt(v, 10);
    if (!isNaN(y)) year = y;
    return { year, month: 0, day: 1, hour: 0, minute: 0 };
  }

  if (presentation === 'month' || presentation === 'month-year') {
    const parts = v.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y)) year = y;
      if (!isNaN(m)) month = m;
    } else if (parts.length === 1) {
      const y = parseInt(parts[0], 10);
      if (!isNaN(y)) year = y;
    }
    return { year, month, day: 1, hour: 0, minute: 0 };
  }

  if (hasDate && hasTime) {
    const [datePart, timePart] = v.split('T');
    if (datePart) {
      const parts = datePart.split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y)) year = y;
        if (!isNaN(m)) month = m;
        if (!isNaN(d)) day = d;
      }
    }
    if (timePart) {
      const timeParts = timePart.split(':');
      if (timeParts.length >= 2) {
        const h = parseInt(timeParts[0], 10);
        const min = parseInt(timeParts[1], 10);
        if (!isNaN(h)) hour = h;
        if (!isNaN(min)) minute = min;
      }
    }
    return { year, month, day, hour, minute };
  }

  if (hasDate) {
    const parts = v.split('-');
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y)) year = y;
      if (!isNaN(m)) month = m;
      if (!isNaN(d)) day = d;
    }
    return { year, month, day, hour: 0, minute: 0 };
  }

  if (hasTime) {
    const parts = v.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const min = parseInt(parts[1], 10);
      if (!isNaN(h)) hour = h;
      if (!isNaN(min)) minute = min;
    }
    return { year, month, day, hour, minute };
  }

  return fallback;
}

export function formatPickerValue(date: PickerDate, presentation: Presentation): string {
  switch (presentation) {
    case 'time':
      return `${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}`;
    case 'date':
      return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    case 'week': {
      const d = new Date(date.year, date.month, date.day);
      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(diff);
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    }
    case 'month':
      return `${date.year}-${String(date.month + 1).padStart(2, '0')}`;
    case 'year':
      return `${date.year}`;
    case 'month-year':
      return `${date.year}-${String(date.month + 1).padStart(2, '0')}`;
    case 'date-time':
      return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}T${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}`;
    case 'time-date':
      return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}T${String(date.hour).padStart(2, '0')}:${String(date.minute).padStart(2, '0')}`;
    default:
      return '';
  }
}

export function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

export function isInRange(year: number, month: number, day: number, min?: string, max?: string): boolean {
  const date = new Date(year, month, day);
  if (min) {
    const minDate = new Date(min);
    if (date < minDate) return false;
  }
  if (max) {
    const maxDate = new Date(max);
    if (date > maxDate) return false;
  }
  return true;
}

export function getWeekRange(year: number, month: number, day: number): { year: number; month: number; day: number }[] {
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dayOfWeek);
  const dates: { year: number; month: number; day: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate() });
  }
  return dates;
}

// ---- Minutes / Hours ----

export function generateMinutes(interval: number): number[] {
  if (interval < 1) interval = 1;
  if (interval > 30) interval = 30;
  const minutes: number[] = [];
  for (let m = 0; m < 60; m += interval) minutes.push(m);
  return minutes;
}

export function generateHours(hourCycle: HourCycle): number[] {
  if (hourCycle === 'h12') return Array.from({ length: 12 }, (_, i) => i + 1);
  return Array.from({ length: 24 }, (_, i) => i);
}

export function to12Hour(hour: number): { hour12: number; period: 'AM' | 'PM' } {
  if (hour === 0) return { hour12: 12, period: 'AM' };
  if (hour < 12) return { hour12: hour, period: 'AM' };
  if (hour === 12) return { hour12: 12, period: 'PM' };
  return { hour12: hour - 12, period: 'PM' };
}

export function from12Hour(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function nearestMinute(minute: number, interval: number): number {
  return Math.round(minute / interval) * interval;
}

// ---- View helpers ----

export const PRESENTATIONS: { value: Presentation; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'date', label: 'Date' },
  { value: 'date-time', label: 'Date-Time' },
  { value: 'time-date', label: 'Time-Date' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'month-year', label: 'Month-Year' },
  { value: 'year', label: 'Year' },
];

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'ios', label: 'iOS' },
  { value: 'material', label: 'Material' },
];

export const COLORS = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'];