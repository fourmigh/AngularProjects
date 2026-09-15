import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocaleService } from './locale.service';
import { I18nService } from './custom-i18n/i18n.service';
import { RUNTIME_PAGES } from './features';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: APP_INITIALIZER,
      useFactory: (locale: LocaleService, i18n: I18nService) => async () => {
        await locale.fetchLanguages();
        if (RUNTIME_PAGES) await i18n.init();
      },
      deps: [LocaleService, I18nService],
      multi: true,
    },
    provideRouter(routes),
  ],
};
