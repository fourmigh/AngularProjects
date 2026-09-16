import { InjectionToken } from '@angular/core';
import { LocaleId } from './types';

export interface I18nConfig {
  /** 语言清单与标签的来源（运行时 fetch 的 URL） */
  manifestUrl: string;
  /** 按语言拆分的译文文件基础路径（不含 `.json` 后缀） */
  localesBasePath: string;
  /** 无法从 localStorage 恢复时使用的默认语言 */
  defaultLocale: LocaleId;
  /** localStorage key 前缀 */
  storagePrefix: string;
  /** FormatService 的默认货币代码 */
  defaultCurrency: string;
}

export type I18nSourceMessages = Record<string, () => string>;

export const DEFAULT_I18N_CONFIG: I18nConfig = {
  manifestUrl: 'i18n/translations.json',
  localesBasePath: 'assets/locale',
  defaultLocale: 'en',
  storagePrefix: 'i18n',
  defaultCurrency: 'EUR',
};

export const I18N_CONFIG = new InjectionToken<Partial<I18nConfig>>('I18N_CONFIG');

export const I18N_SOURCE_MESSAGES = new InjectionToken<I18nSourceMessages>('I18N_SOURCE_MESSAGES');
