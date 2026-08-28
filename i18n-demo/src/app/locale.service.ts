import { Injectable, signal } from '@angular/core';
import { LocaleId } from './custom-i18n/i18n-keys';

const KEY_LOCALE = 'i18n-demo.locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly availableLanguages = signal<LocaleId[]>([]);
  readonly locale = signal<LocaleId>(this.restore());

  constructor() {
    this.fetchLanguages();
  }

  isRouteLang(value: string | null | undefined): value is LocaleId {
    const langs = this.availableLanguages();
    return value !== null && value !== undefined && (langs as string[]).includes(value);
  }

  setLocale(locale: LocaleId): void {
    if (this.locale() !== locale) {
      this.locale.set(locale);
      this.persist(locale);
    }
  }

  private async fetchLanguages(): Promise<void> {
    try {
      const res = await fetch('i18n/translations.json');
      if (res.ok) {
        const raw = (await res.json()) as Record<string, unknown>;
        if (Array.isArray(raw['$languages']) && raw['$languages'].length > 0) {
          this.availableLanguages.set(raw['$languages'] as LocaleId[]);
          // re-validate persisted locale against fresh list
          const current = this.locale();
          if (!(raw['$languages'] as string[]).includes(current)) {
            this.locale.set(raw['$languages'][0] as LocaleId);
          }
        }
      }
    } catch {
      // 网络不可用，保持空列表
    }
  }

  private restore(): LocaleId {
    try {
      const raw = localStorage.getItem(KEY_LOCALE);
      if (raw !== null) return raw as LocaleId;
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
