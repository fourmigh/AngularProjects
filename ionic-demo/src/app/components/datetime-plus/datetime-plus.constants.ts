import type { DatetimePresentation, DatetimeHourCycle, Color } from '@ionic/core/components';

export type { Color };
export type Presentation = DatetimePresentation | 'week';
export type HourCycle = DatetimeHourCycle;
export type DatetimeSize = 'cover' | 'fixed';

export interface Option<T> {
  value: T;
  label: string;
}

export const PRESENTATIONS: Option<Presentation>[] = [
  { value: 'time', label: 'Time' },
  { value: 'date', label: 'Date' },
  { value: 'date-time', label: 'Date-Time' },
  { value: 'time-date', label: 'Time-Date' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'month-year', label: 'Month-Year' },
  { value: 'year', label: 'Year' },
];

export const HOUR_CYCLES: Option<HourCycle>[] = [
  { value: 'h12', label: '12 Hour' },
  { value: 'h24', label: '24 Hour' },
];

export const SIZES: Option<DatetimeSize>[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'fixed', label: 'Fixed' },
];

export const WEEK_DAYS: Option<number>[] = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const LOCALES: Option<string>[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'zh-CN', label: '中文 (中国)' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'es-ES', label: 'Espa\u00F1ol' },
  { value: 'fr-FR', label: 'Fran\u00E7ais' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'ko-KR', label: '\uD55C\uAD6D\uC5B4' },
  { value: 'ar-SA', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
];

export const COLORS: Color[] = [
  'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark',
];
