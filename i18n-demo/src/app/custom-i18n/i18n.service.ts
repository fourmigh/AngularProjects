import { Inject, Injectable, InjectionToken, Optional, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';
import { LocaleId, MergedTranslations, TranslationKey, TranslationMap } from './i18n-keys';
import { SOURCE_MESSAGES } from './source-messages';

export interface LanguageInfo {
  id: LocaleId;
  label: string;
}

export const I18N_SCOPE = new InjectionToken<string>('I18N_SCOPE');

const ALL_LANGUAGES: LocaleId[] = ['zh', 'en', 'de'];
const KEY_ACTIVE = 'i18n-demo.active';
const KEY_DRAFT = 'i18n-demo.draft';

@Injectable()
export class I18nService {
  private readonly keyActive: string;
  private readonly keyDraft: string;

  constructor(@Optional() @Inject(I18N_SCOPE) scope: string | null = null) {
    const suffix = scope ? `:${scope}` : '';
    this.keyActive = KEY_ACTIVE + suffix;
    this.keyDraft = KEY_DRAFT + suffix;
  }

  readonly languages: LanguageInfo[] = [
    { id: 'zh', label: '中文' },
    { id: 'en', label: 'English' },
    { id: 'de', label: 'Deutsch' },
  ];

  readonly current = signal<LocaleId>('zh');

  readonly ready = signal(false);

  private readonly renderTickSignal = signal(0);
  readonly renderTick = this.renderTickSignal.asReadonly();

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

  label(key: TranslationKey): string {
    return SOURCE_MESSAGES[key]();
  }

  lookup(key: TranslationKey): string {
    return SOURCE_MESSAGES[key]();
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const text = SOURCE_MESSAGES[key]();
    if (!params) return text;
    return text.replace(/\{\$(\w+)\}/g, (_, n) => String(params[n] ?? `{$${n}}`));
  }

  getMergedContent(): string {
    if (this.draftMerged !== null) return this.draftMerged;
    return JSON.stringify(this.activeMerged ?? this.mergedDefault, null, 2) + '\n';
  }

  saveDraft(text: string): void {
    this.draftMerged = text;
    localStorage.setItem(this.keyDraft, text);
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
    localStorage.removeItem(this.keyActive);
    localStorage.removeItem(this.keyDraft);
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
    const merged: Record<string, unknown> = {};

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
      const entry: Partial<Record<LocaleId, string>> = {};
      for (const [lang, text] of Object.entries(value)) {
        if (!ALL_LANGUAGES.includes(lang as LocaleId)) {
          this.lastParseError = `翻译键 "${key}" 含未知语言 "${lang}"`;
          return null;
        }
        if (typeof text !== 'string') {
          this.lastParseError = `翻译键 "${key}" 的语言 "${lang}" 的值必须是字符串`;
          return null;
        }
        entry[lang as LocaleId] = text;
      }
      merged[key] = entry;
    }
    return merged as MergedTranslations;
  }

  private async loadDefault(): Promise<void> {
    // 标准运行时 i18n：按 locale 加载各自独立的 json（assets/locale/{zh,en,de}.json），
    // 这些文件由 split-i18n.mjs 从主文件 translations.json 拆分生成，格式即 loadTranslations 所需的 { 消息id: 译文 }。
    // translations.json 仅作为脚本（check / make-xlf / split）的主文件，运行时不再直接加载；
    // 若拆分文件缺失（如未跑 i18n:split），则回退到 translations.json 以保证开发可用。
    try {
      const merged: Record<string, unknown> = { $languages: [...ALL_LANGUAGES] };
      for (const lang of ALL_LANGUAGES) {
        const res = await fetch(`assets/locale/${lang}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Record<string, string>;
        for (const [key, text] of Object.entries(data)) {
          const entry = (merged[key] as Partial<Record<LocaleId, string>> | undefined) ?? {};
          entry[lang] = text;
          merged[key] = entry;
        }
      }
      this.mergedDefault = merged as MergedTranslations;
    } catch (err) {
      const message = (err as Error).message;
      console.warn(`[i18n] 未能加载 assets/locale/*.json（${message}），回退到 i18n/translations.json`);
      const res = await fetch('i18n/translations.json');
      if (!res.ok) throw new Error(`Failed to load i18n/translations.json`);
      this.mergedDefault = (await res.json()) as MergedTranslations;
    }
  }

  private restoreActive(): void {
    try {
      const raw = localStorage.getItem(this.keyActive);
      if (!raw) return;
      const parsed = this.parseMerged(raw);
      if (parsed !== null) this.activeMerged = parsed;
    } catch {
      localStorage.removeItem(this.keyActive);
    }
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(this.keyDraft);
      if (raw && raw.trim().length > 0) this.draftMerged = raw;
    } catch {
      localStorage.removeItem(this.keyDraft);
    }
  }

  private persistActive(): void {
    if (this.activeMerged !== null) {
      localStorage.setItem(this.keyActive, JSON.stringify(this.activeMerged));
    }
  }

  private persistDraft(): void {
    if (this.draftMerged !== null) {
      localStorage.setItem(this.keyDraft, this.draftMerged);
    }
  }

  private applyLocale(id: LocaleId, bounce = true): void {
    const map = this.buildMap(id);
    clearTranslations();
    loadTranslations(map);
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
      const entry = value as Partial<Record<LocaleId, string>>;
      const text = entry[id];
      if (typeof text === 'string') map[key as TranslationKey] = text;
    }
    return map;
  }

  private translationKeyCount(): number {
    const merged = this.activeMerged ?? this.mergedDefault;
    return Object.keys(merged).filter((k) => k !== '$languages').length;
  }
}
