import { Inject, Injectable, Optional, WritableSignal, signal } from '@angular/core';
import { clearTranslations, loadTranslations } from '@angular/localize';
import {
  DEFAULT_I18N_CONFIG,
  I18N_CONFIG,
  I18N_SOURCE_MESSAGES,
  I18nConfig,
  I18nSourceMessages,
} from './tokens';
import { LanguageInfo, LocaleId, MergedTranslations, TranslationMap } from './types';
import { LocaleService } from './locale.service';
import { FormatService } from './format.service';

@Injectable()
export class I18nService {
  private readonly localeService: LocaleService;
  private readonly config: I18nConfig;
  private readonly sourceMessages: I18nSourceMessages;

  readonly format: FormatService;
  readonly locale: WritableSignal<LocaleId>;
  readonly current: WritableSignal<LocaleId>;

  readonly ready = signal(false);

  private readonly renderTickSignal = signal(0);
  readonly renderTick = this.renderTickSignal.asReadonly();

  readonly keyCount = signal(0);

  private readonly rebuildCount = signal(0);
  readonly rebuilds = this.rebuildCount.asReadonly();

  private mergedDefault: MergedTranslations = {};
  private activeMerged: MergedTranslations | null = null;
  private readonly runtime = new Map<LocaleId, Map<string, string>>();
  private draftMerged: string | null = null;
  private lastParseError = '';
  private initPromise: Promise<void> | null = null;
  private readonly keyActive: string;
  private readonly keyDraft: string;

  constructor(
    localeService: LocaleService,
    format: FormatService,
    @Optional() @Inject(I18N_CONFIG) config: Partial<I18nConfig> | null,
    @Optional() @Inject(I18N_SOURCE_MESSAGES) sourceMessages: I18nSourceMessages | null,
  ) {
    this.localeService = localeService;
    this.format = format;
    this.config = { ...DEFAULT_I18N_CONFIG, ...(config ?? {}) };
    this.sourceMessages = sourceMessages ?? {};
    this.locale = this.localeService.locale;
    this.current = this.localeService.locale;
    this.keyActive = `${this.config.storagePrefix}.active`;
    this.keyDraft = `${this.config.storagePrefix}.draft`;
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
    if (this.localeService.locale() === id) return;
    this.localeService.setLocale(id);
    if (this.ready()) this.applyLocale(id);
  }

  switchLanguage(id: LocaleId): void {
    this.setLocale(id);
  }

  isRouteLang(value: string | null | undefined): value is LocaleId {
    return this.localeService.isRouteLang(value);
  }

  label(key: string): string {
    return this.resolve(key) ?? key;
  }

  lookup(key: string): string {
    return this.resolve(key) ?? key;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const text = this.resolve(key) ?? key;
    if (!params) return text;
    return text.replace(/\{\$(\w+)\}/g, (_, n) => String(params[n] ?? `{$${n}}`));
  }

  /**
   * 导入某语言的运行时翻译（key → 文案）。
   * 与 $localize 的 loadTranslations 相互独立：源消息缺失时 t/label/lookup 会回退到这里。
   * 同语言同名 key 后导入覆盖先导入；导入后触发一次视图刷新。
   */
  importTranslations(locale: LocaleId, entries: TranslationMap): void {
    const bucket = this.runtime.get(locale) ?? new Map<string, string>();
    for (const [key, text] of Object.entries(entries)) bucket.set(key, text);
    this.runtime.set(locale, bucket);
    this.bounce();
  }

  /** 清空运行时翻译（不传 locale 则清全部）。 */
  clearRuntimeTranslations(locale?: LocaleId): void {
    if (locale === undefined) this.runtime.clear();
    else this.runtime.delete(locale);
    this.bounce();
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

  private async doInit(): Promise<void> {
    try {
      await this.localeService.fetchLanguages();
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
    // 语言清单与标签由 LocaleService 在初始化阶段从 manifestUrl 解析，
    // 这里按 availableLanguages 加载各自独立的译文文件（{消息id: 译文}）。
    const languages = this.localeService.availableLanguages();
    try {
      if (languages.length === 0) throw new Error('语言清单为空');
      const merged: Record<string, unknown> = { $languages: [...languages] };
      for (const lang of languages) {
        const res = await fetch(`${this.config.localesBasePath}/${lang}.json`);
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
      console.warn(`[i18n] 未能按语言加载译文（${message}），回退到 ${this.config.manifestUrl}`);
      const res = await fetch(this.config.manifestUrl);
      if (!res.ok) throw new Error(`Failed to load ${this.config.manifestUrl}`);
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
    if (bounce) this.bounce();
  }

  private bounce(): void {
    this.renderTickSignal.update((n) => n + 1);
    this.rebuildCount.update((n) => n + 1);
  }

  /** 解析文案：编译期源消息 → 当前语言运行时表 → 默认语言运行时表。 */
  private resolve(key: string): string | undefined {
    const staticText = this.sourceMessages[key]?.();
    if (staticText !== undefined) return staticText;
    return (
      this.runtime.get(this.current())?.get(key) ??
      this.runtime.get(this.config.defaultLocale)?.get(key)
    );
  }

  private buildMap(id: LocaleId): TranslationMap {
    const merged = this.activeMerged ?? this.mergedDefault;
    const map: TranslationMap = {};
    for (const [key, value] of Object.entries(merged)) {
      if (key === '$languages' || key === '$languageLabels') continue;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;
      const text = (value as Partial<Record<LocaleId, string>>)[id];
      if (typeof text === 'string') map[key] = text;
    }
    return map;
  }

  private translationKeyCount(): number {
    const merged = this.activeMerged ?? this.mergedDefault;
    return Object.keys(merged).filter(
      (k) => k !== '$languages' && k !== '$languageLabels' && !Array.isArray(merged[k]),
    ).length;
  }
}
