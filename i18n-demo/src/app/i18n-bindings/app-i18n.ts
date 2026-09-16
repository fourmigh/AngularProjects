import { InjectionToken } from '@angular/core';
import { I18nService } from 'i18n';
import type { TranslationKey } from './i18n-keys';

/**
 * 类型投影：APP_I18N 通过 useExisting 指向同一个 I18nService 单例，
 * 但 t()/label()/lookup() 的 key 收窄为项目生成的 TranslationKey（拼错可编译期报错），
 * 同时允许运行时动态 key（如服务端 metadata 的 `entity.field`）：既有自动补全，又不报错。
 */
export type RuntimeKey = TranslationKey | (string & {});

export type AppI18n = Omit<I18nService, 't' | 'label' | 'lookup'> & {
  t(key: RuntimeKey, params?: Record<string, string | number>): string;
  label(key: RuntimeKey): string;
  lookup(key: RuntimeKey): string;
};

export const APP_I18N = new InjectionToken<AppI18n>('APP_I18N');
