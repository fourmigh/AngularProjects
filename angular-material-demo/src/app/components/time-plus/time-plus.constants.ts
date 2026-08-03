import type { ThemePalette } from '@angular/material/core';

export interface Option<T> {
  value: T;
  label: string;
}

export type Appearance = 'fill' | 'outline';

export const APPEARANCES: Option<Appearance>[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'outline', label: 'Outline' },
];

export const COLORS: Option<ThemePalette>[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
  { value: 'warn', label: 'Warn' },
];

export const INTERVAL_PRESETS: Option<string>[] = [
  { value: '30m', label: '30 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: '10m', label: '10 minutes' },
  { value: '5m', label: '5 minutes' },
  { value: '1m', label: '1 minute' },
  { value: '1h', label: '1 hour' },
  { value: '2h', label: '2 hours' },
];

export const LOCALES: Option<string>[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'zh-CN', label: '中文 (中国)' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'ko-KR', label: '한국어' },
];