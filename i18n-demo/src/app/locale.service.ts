import { Injectable, signal } from '@angular/core';
import { LocaleId } from './custom-i18n/i18n-keys';

export const ROUTE_LANGS: LocaleId[] = ['en', 'zh', 'de'];

const KEY_LOCALE = 'i18n-demo.locale';

export function isRouteLang(value: string | null | undefined): value is LocaleId {
  return value !== null && value !== undefined && (ROUTE_LANGS as string[]).includes(value);
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<LocaleId>(this.restore());

  setLocale(locale: LocaleId): void {
    if (this.locale() !== locale) {
      this.locale.set(locale);
      this.persist(locale);
    }
  }

  private restore(): LocaleId {
    try {
      const raw = localStorage.getItem(KEY_LOCALE);
      if (raw !== null && (ROUTE_LANGS as string[]).includes(raw)) return raw as LocaleId;
    } catch {
      /* ignore */
    }
    return 'zh';
  }

  private persist(locale: LocaleId): void {
    try {
      localStorage.setItem(KEY_LOCALE, locale);
    } catch {
      /* ignore */
    }
  }
}