import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocaleService } from './locale.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: APP_INITIALIZER,
      useFactory: (svc: LocaleService) => () => svc.fetchLanguages(),
      deps: [LocaleService],
      multi: true,
    },
    provideRouter(routes),
  ],
};