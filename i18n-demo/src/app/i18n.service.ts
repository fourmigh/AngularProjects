import { Injectable, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';

export type LocaleId = 'zh' | 'en' | 'de';

export interface LanguageInfo {
  id: LocaleId;
  label: string;
}

export interface TranslationMap {
  [key: string]: string;
}

export interface MergedTranslations {
  $languages?: LocaleId[];
  [key: string]: TranslationMap | LocaleId[] | undefined;
}

const ALL_LANGUAGES: LocaleId[] = ['zh', 'en', 'de'];
const KEY_ACTIVE = 'i18n-demo.active';
const KEY_DRAFT = 'i18n-demo.draft';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages: LanguageInfo[] = [
    { id: 'zh', label: '中文' },
    { id: 'en', label: 'English' },
    { id: 'de', label: 'Deutsch' },
  ];

  readonly current = signal<LocaleId>('zh');

  readonly ready = signal(false);

  private readonly renderTickSignal = signal(0);
  readonly renderTick = this.renderTickSignal.asReadonly();

  readonly activeMap = signal<TranslationMap>({});
  readonly keyCount = signal(0);

  private readonly rebuildCount = signal(0);
  readonly rebuilds = this.rebuildCount.asReadonly();

  private mergedDefault: MergedTranslations = {};
  private activeMerged: MergedTranslations | null = null;
  private draftMerged: string | null = null;
  private lastParseError = '';

  async init(): Promise<void> {
    await this.loadDefault();
    this.restoreActive();
    this.restoreDraft();
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

  getMergedContent(): string {
    if (this.draftMerged !== null) return this.draftMerged;
    return JSON.stringify(this.activeMerged ?? this.mergedDefault, null, 2) + '\n';
  }

  saveDraft(text: string): void {
    this.draftMerged = text;
    localStorage.setItem(KEY_DRAFT, text);
  }

  applyEdited(text: string): string | null {
    const merged = this.parseMerged(text);
    if (merged === null) return this.lastParseError;
    this.activeMerged = merged;
    this.draftMerged = JSON.stringify(merged, null, 2) + '\n';
    this.persistActive();
    this.persistDraft();
    this.applyLocale(this.current());
    return null;
  }

  resetMerged(): void {
    this.activeMerged = null;
    this.draftMerged = null;
    localStorage.removeItem(KEY_ACTIVE);
    localStorage.removeItem(KEY_DRAFT);
    this.applyLocale(this.current());
  }

  downloadMerged(): void {
    const merged = this.activeMerged ?? this.mergedDefault;
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private parseMerged(text: string): MergedTranslations | null {
    this.lastParseError = '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      this.lastParseError = (err as Error).message;
      return null;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      this.lastParseError = '顶层必须是对象（{ 翻译键: { 语言: 文本 } }）';
      return null;
    }
    const raw = parsed as Record<string, unknown>;
    const merged: MergedTranslations = {};

    if (raw['$languages'] !== undefined) {
      if (
        !Array.isArray(raw['$languages']) ||
        raw['$languages'].some((l) => !ALL_LANGUAGES.includes(l as LocaleId))
      ) {
        this.lastParseError = `"$languages" 必须是 ${ALL_LANGUAGES.join('/')} 的子集数组`;
        return null;
      }
      merged['$languages'] = raw['$languages'] as LocaleId[];
    }

    for (const [key, value] of Object.entries(raw)) {
      if (key === '$languages') continue;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        this.lastParseError = `翻译键 "${key}" 的值必须是对象（{ 语言: 文本 }）`;
        return null;
      }
      const entry: TranslationMap = {};
      for (const [lang, text] of Object.entries(value)) {
        if (!ALL_LANGUAGES.includes(lang as LocaleId)) {
          this.lastParseError = `翻译键 "${key}" 含未知语言 "${lang}"`;
          return null;
        }
        if (typeof text !== 'string') {
          this.lastParseError = `翻译键 "${key}" 的语言 "${lang}" 的值必须是字符串`;
          return null;
        }
        entry[lang] = text;
      }
      merged[key] = entry;
    }
    return merged;
  }

  private async loadDefault(): Promise<void> {
    const res = await fetch('i18n/translations.json');
    if (!res.ok) throw new Error(`Failed to load i18n/translations.json`);
    this.mergedDefault = (await res.json()) as MergedTranslations;
  }

  private restoreActive(): void {
    try {
      const raw = localStorage.getItem(KEY_ACTIVE);
      if (!raw) return;
      const parsed = this.parseMerged(raw);
      if (parsed !== null) this.activeMerged = parsed;
    } catch {
      localStorage.removeItem(KEY_ACTIVE);
    }
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(KEY_DRAFT);
      if (raw && raw.trim().length > 0) this.draftMerged = raw;
    } catch {
      localStorage.removeItem(KEY_DRAFT);
    }
  }

  private persistActive(): void {
    if (this.activeMerged !== null) {
      localStorage.setItem(KEY_ACTIVE, JSON.stringify(this.activeMerged));
    }
  }

  private persistDraft(): void {
    if (this.draftMerged !== null) {
      localStorage.setItem(KEY_DRAFT, this.draftMerged);
    }
  }

  private applyLocale(id: LocaleId, bounce = true): void {
    const map = this.buildMap(id);
    clearTranslations();
    loadTranslations(map);
    this.activeMap.set(map);
    this.keyCount.set(this.translationKeyCount());
    if (bounce) {
      this.renderTickSignal.update((n) => n + 1);
      this.rebuildCount.update((n) => n + 1);
    }
  }

  private buildMap(id: LocaleId): TranslationMap {
    const merged = this.activeMerged ?? this.mergedDefault;
    const map: TranslationMap = {};
    for (const [key, value] of Object.entries(merged)) {
      if (key === '$languages') continue;
      const entry = value as TranslationMap;
      const text = entry[id];
      if (typeof text === 'string') map[key] = text;
    }
    return map;
  }

  private translationKeyCount(): number {
    const merged = this.activeMerged ?? this.mergedDefault;
    return Object.keys(merged).filter((k) => k !== '$languages').length;
  }
}
