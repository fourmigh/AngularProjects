import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { I18nService, LocaleService, provideI18n } from 'i18n';
import { routes } from './app.routes';
import { RUNTIME_PAGES } from './features';
import { APP_I18N, type AppI18n } from './i18n/app-i18n';
import { SOURCE_MESSAGES } from '../assets/i18n/source-messages';
import { fetchEntityTranslations } from './i18n/entity-translations';

async function preloadEntityTranslations(locale: LocaleService, i18n: I18nService): Promise<void> {
  await Promise.all(
    locale.availableLanguages().map(async (lang) => {
      try {
        const entries = await fetchEntityTranslations(lang);
        i18n.importTranslations(lang, entries);
      } catch (err) {
        console.warn(`[i18n] 无法加载 ${lang} 的实体元数据翻译，将回退到 key`, err);
      }
    }),
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideI18n({
      config: {
        manifestUrl: 'assets/i18n/languages-meta.json',
        localesBasePath: 'assets/i18n',
        defaultLocale: 'zh',
        storagePrefix: 'i18n-demo',
      },
      sourceMessages: SOURCE_MESSAGES,
    }),
    { provide: APP_I18N, useFactory: (i18n: I18nService) => i18n as AppI18n, deps: [I18nService] },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [LocaleService, I18nService],
      useFactory: (locale: LocaleService, i18n: I18nService) => () => {
        if (!RUNTIME_PAGES) return Promise.resolve();
        return (async () => {
          await locale.fetchLanguages();
          await i18n.init();
          await preloadEntityTranslations(locale, i18n);
        })();
      },
    },
    provideRouter(routes),
  ],
};
