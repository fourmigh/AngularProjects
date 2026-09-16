import { Inject, Injectable, Optional, WritableSignal, signal } from '@angular/core';
import { DEFAULT_I18N_CONFIG, I18N_CONFIG, I18nConfig } from './tokens';
import { LocaleId } from './types';

@Injectable()
export class LocaleService {
  private readonly config: I18nConfig;

  readonly availableLanguages = signal<LocaleId[]>([]);
  readonly languageLabels = signal<Record<string, string>>({});
  readonly locale: WritableSignal<LocaleId>;

  constructor(@Optional() @Inject(I18N_CONFIG) config: Partial<I18nConfig> | null) {
    this.config = { ...DEFAULT_I18N_CONFIG, ...(config ?? {}) };
    this.locale = signal<LocaleId>(this.restore());
  }

  isRouteLang(value: string | null | undefined): value is LocaleId {
    return value !== null && value !== undefined && (this.availableLanguages() as string[]).includes(value);
  }

  setLocale(locale: LocaleId): void {
    if (this.locale() !== locale) {
      this.locale.set(locale);
      this.persist(locale);
    }
  }

  async fetchLanguages(): Promise<void> {
    try {
      const res = await fetch(this.config.manifestUrl);
      if (res.ok) {
        const raw = (await res.json()) as Record<string, unknown>;
        if (raw['$languageLabels'] && typeof raw['$languageLabels'] === 'object') {
          this.languageLabels.set(raw['$languageLabels'] as Record<string, string>);
        }
        if (Array.isArray(raw['$languages']) && raw['$languages'].length > 0) {
          this.availableLanguages.set(raw['$languages'] as LocaleId[]);
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

  private get storageKey(): string {
    return `${this.config.storagePrefix}.locale`;
  }

  private restore(): LocaleId {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw !== null) return raw as LocaleId;
    } catch {
      /* ignore */
    }
    return this.config.defaultLocale;
  }

  private persist(locale: LocaleId): void {
    try {
      localStorage.setItem(this.storageKey, locale);
    } catch {
      /* ignore */
    }
  }
}
