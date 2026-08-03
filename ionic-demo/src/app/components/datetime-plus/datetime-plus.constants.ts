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

export const HOUR_VALUE_PRESETS: Option<string>[] = [
  { value: '', label: 'All Hours' },
  { value: '9,10,11,12,13,14,15,16,17', label: 'Business Hours (9-17)' },
  { value: '6,7,8,9,10,11,12', label: 'Morning (6-12)' },
  { value: '12,13,14,15,16,17,18', label: 'Afternoon (12-18)' },
  { value: '18,19,20,21,22,23', label: 'Evening (18-24)' },
  { value: '0,1,2,3,4,5,6', label: 'Night (0-6)' },
];

export const MINUTE_VALUE_PRESETS: Option<string>[] = [
  { value: '', label: 'All Minutes' },
  { value: '0,15,30,45', label: 'Every 15 min' },
  { value: '0,10,20,30,40,50', label: 'Every 10 min' },
  { value: '0,5,10,15,20,25,30,35,40,45,50,55', label: 'Every 5 min' },
  { value: '0,30', label: 'Every 30 min' },
];
