import { Injectable, effect, inject, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';
import { LocaleId, MergedTranslations, TranslationKey, TranslationMap } from './i18n-keys';
import { SOURCE_MESSAGES } from './source-messages';
import { LocaleService } from '../locale.service';

export interface LanguageInfo {
  id: LocaleId;
  label: string;
}

const KEY_ACTIVE = 'i18n-demo.active';
const KEY_DRAFT = 'i18n-demo.draft';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly localeService = inject(LocaleService);

  readonly locale = this.localeService.locale;
  readonly current = this.localeService.locale;

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
  private initPromise: Promise<void> | null = null;

  constructor() {
    effect(() => {
      const locale = this.localeService.locale();
      if (this.ready()) this.applyLocale(locale);
    });
  }

  get languages(): LanguageInfo[] {
    const labels = this.localeService.languageLabels();
    return this.localeService.availableLanguages().map((id) => ({ id, label: labels[id] ?? id }));
  }

  init(): Promise<void> {
    if (this.initPromise === null) this.initPromise = this.doInit();
    return this.initPromise;
  }

  setLocale(id: LocaleId): void {
    this.localeService.setLocale(id);
  }

  switchLanguage(id: LocaleId): void {
    this.localeService.setLocale(id);
  }

  isRouteLang(value: string | null | undefined): value is LocaleId {
    return this.localeService.isRouteLang(value);
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

  private async doInit(): Promise<void> {
    try {
      await this.loadDefault();
      this.restoreActive();
      this.restoreDraft();
      this.applyLocale(this.current(), false);
    } catch (err) {
      console.warn('[i18n] 初始化失败，界面将回退到源文', err);
    } finally {
      this.ready.set(true);
    }
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
    const available = this.localeService.availableLanguages();
    const merged: Record<string, unknown> = {};

    if (raw['$languages'] !== undefined) {
      if (
        available.length > 0 &&
        (!Array.isArray(raw['$languages']) ||
        raw['$languages'].some((l) => !available.includes(l as LocaleId)))
      ) {
        this.lastParseError = `"$languages" 必须是 ${available.join('/')} 的子集数组`;
        return null;
      }
      merged['$languages'] = raw['$languages'] as LocaleId[];
    }

    for (const [key, value] of Object.entries(raw)) {
      if (key === '$languages' || key === '$languageLabels') continue;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        this.lastParseError = `翻译键 "${key}" 的值必须是对象（{ 语言: 文本 }）`;
        return null;
      }
      const entry: Partial<Record<LocaleId, string>> = {};
      for (const [lang, text] of Object.entries(value)) {
        if (available.length > 0 && !available.includes(lang as LocaleId)) {
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
    // 语言清单与标签由 LocaleService 在 APP_INITIALIZER 中从 i18n/translations.json 解析，
    // 这里按 availableLanguages 加载各自独立的 locale json（assets/locale/{lang}.json）。
    // 这些文件由 split-i18n.mjs 从主文件 translations.json 拆分生成，格式即 loadTranslations 所需的 { 消息id: 译文 }。
    const languages = this.localeService.availableLanguages();
    try {
      if (languages.length === 0) throw new Error('语言清单为空');
      const merged: Record<string, unknown> = { $languages: [...languages] };
      for (const lang of languages) {
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
      if (key === '$languages' || key === '$languageLabels') continue;
      const entry = value as Partial<Record<LocaleId, string>>;
      const text = entry[id];
      if (typeof text === 'string') map[key as TranslationKey] = text;
    }
    return map;
  }

  private translationKeyCount(): number {
    const merged = this.activeMerged ?? this.mergedDefault;
    return Object.keys(merged).filter((k) => k !== '$languages' && k !== '$languageLabels').length;
  }
}
