import {
  EnvironmentProviders,
  Optional,
  makeEnvironmentProviders,
} from '@angular/core';
import { I18N_CONFIG, I18N_SOURCE_MESSAGES, I18nConfig, I18nSourceMessages } from './tokens';
import { LocaleService } from './locale.service';
import { FormatService } from './format.service';
import { I18nService } from './i18n.service';

export interface ProvideI18nOptions {
  /** 覆盖默认配置（manifestUrl / localesBasePath / defaultLocale / storagePrefix / defaultCurrency）。 */
  config?: Partial<I18nConfig>;
  /** 项目生成的消息表：消息 id → () => $localize`...`。 */
  sourceMessages?: I18nSourceMessages;
  /** 是否在启动时加载译文并注册到 $localize；编译时静态站可设为 false。默认 true。 */
  runtime?: boolean;
}

export function provideI18n(options: ProvideI18nOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: I18N_CONFIG, useValue: options.config ?? {} },
    { provide: I18N_SOURCE_MESSAGES, useValue: options.sourceMessages ?? {} },
    {
      provide: LocaleService,
      useFactory: (config: Partial<I18nConfig> | null) => new LocaleService(config),
      deps: [[new Optional(), I18N_CONFIG]],
    },
    {
      provide: FormatService,
      useFactory: (locale: LocaleService, config: Partial<I18nConfig> | null) =>
        new FormatService(locale, config),
      deps: [LocaleService, [new Optional(), I18N_CONFIG]],
    },
    {
      provide: I18nService,
      useFactory: (
        locale: LocaleService,
        format: FormatService,
        config: Partial<I18nConfig> | null,
        sourceMessages: I18nSourceMessages | null,
      ) => new I18nService(locale, format, config, sourceMessages),
      deps: [
        LocaleService,
        FormatService,
        [new Optional(), I18N_CONFIG],
        [new Optional(), I18N_SOURCE_MESSAGES],
      ],
    },
  ]);
}
