import { Injectable, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';

export type LocaleId = 'zh' | 'en' | 'de';

export interface LanguageInfo {
  id: LocaleId;
  code: string;
  label: string;
  file: string;
}

export interface TranslationMap {
  [key: string]: string;
}

const EDITED_KEY = 'i18n-demo.edited';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages: LanguageInfo[] = [
    { id: 'zh', code: 'zh', label: '中文', file: 'assets/locale/zh.json' },
    { id: 'en', code: 'en', label: 'English', file: 'assets/locale/en.json' },
    { id: 'de', code: 'de', label: 'Deutsch', file: 'assets/locale/de.json' },
  ];

  readonly current = signal<LocaleId>('zh');

  readonly ready = signal(false);

  private readonly renderTickSignal = signal(0);
  readonly renderTick = this.renderTickSignal.asReadonly();

  readonly activeMap = signal<TranslationMap>({});

  private readonly rebuildCount = signal(0);
  readonly rebuilds = this.rebuildCount.asReadonly();

  private readonly defaults = new Map<LocaleId, TranslationMap>();
  private readonly edited = new Map<LocaleId, TranslationMap>();
  private readonly drafts = new Map<LocaleId, string>();

  async init(): Promise<void> {
    await Promise.all(this.languages.map((l) => this.loadDefault(l)));
    this.restoreEdited();
    this.applyLocale(this.current(), false);
    this.ready.set(true);
  }

  switchLanguage(id: LocaleId): void {
    this.current.set(id);
    this.applyLocale(id);
  }

  label(key: string): string {
    return this.activeMap()[key] ?? key;
  }

  getContent(id: LocaleId): string {
    const draft = this.drafts.get(id);
    if (draft !== undefined) return draft;
    return JSON.stringify(this.edited.get(id) ?? this.defaults.get(id) ?? {}, null, 2) + '\n';
  }

  saveDraft(id: LocaleId, text: string): void {
    this.drafts.set(id, text);
  }

  setConfig(id: LocaleId, map: TranslationMap): void {
    this.edited.set(id, map);
    this.saveDraft(id, JSON.stringify(map, null, 2) + '\n');
    this.persistEdited();
    if (this.current() === id) this.applyLocale(id);
  }

  resetConfig(id: LocaleId): void {
    this.edited.delete(id);
    this.drafts.delete(id);
    this.persistEdited();
    if (this.current() === id) this.applyLocale(id);
  }

  download(id: LocaleId): void {
    const lang = this.languages.find((l) => l.id === id);
    const map = this.edited.get(id) ?? this.defaults.get(id) ?? {};
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lang ? lang.file.split('/').pop() ?? `${id}.json` : `${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async loadDefault(lang: LanguageInfo): Promise<void> {
    const res = await fetch(lang.file);
    if (!res.ok) throw new Error(`Failed to load ${lang.file}`);
    this.defaults.set(lang.id, (await res.json()) as TranslationMap);
  }

  private applyLocale(id: LocaleId, bounce = true): void {
    const map = this.edited.get(id) ?? this.defaults.get(id) ?? {};
    clearTranslations();
    loadTranslations(map);
    this.activeMap.set(map);
    if (bounce) {
      this.renderTickSignal.update((n) => n + 1);
      this.rebuildCount.update((n) => n + 1);
    }
  }

  private restoreEdited(): void {
    try {
      const raw = localStorage.getItem(EDITED_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, TranslationMap>;
      for (const [k, v] of Object.entries(data)) {
        if (this.languages.some((l) => l.id === k)) this.edited.set(k as LocaleId, v);
      }
    } catch {
      localStorage.removeItem(EDITED_KEY);
    }
  }

  private persistEdited(): void {
    localStorage.setItem(EDITED_KEY, JSON.stringify(Object.fromEntries(this.edited)));
  }
}
