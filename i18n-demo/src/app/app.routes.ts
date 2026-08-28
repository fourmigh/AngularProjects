import { inject } from '@angular/core';
import { Route, Router, Routes, UrlSegment } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OfficialComponent } from './official/official.component';
import { CustomPageComponent } from './custom-i18n/pages/custom-page.component';
import { CompileTimeComponent } from './compile-time/compile-time.component';
import { LocaleService } from './locale.service';

export const routes: Routes = [
  { path: '', redirectTo: 'en', pathMatch: 'full' },
  {
    path: ':lang',
    canMatch: [
      (_route: Route, segments: UrlSegment[]) => {
        const localeService = inject(LocaleService);
        const lang = segments[0]?.path;
        if (localeService.isRouteLang(lang)) return true;
        const langs = localeService.availableLanguages();
        if (langs.length > 0) return inject(Router).createUrlTree(['/', langs[0]]);
        return false;
      },
    ],
    children: [
      { path: '', component: HomeComponent },
      { path: 'compile-time', component: CompileTimeComponent },
    ],
  },
  { path: 'official', component: OfficialComponent },
  { path: 'custom', component: CustomPageComponent },
  { path: '**', redirectTo: 'en' },
];