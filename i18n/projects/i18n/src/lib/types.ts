export type LocaleId = string;

export type TranslationKey = string;

export interface LanguageInfo {
  id: LocaleId;
  label: string;
}

export type TranslationMap = Record<string, string>;

export type MergedTranslations = Record<string, Partial<Record<LocaleId, string>> | LocaleId[]>;
