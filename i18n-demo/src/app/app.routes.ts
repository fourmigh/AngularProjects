import { inject } from '@angular/core';
import { Route, Routes, UrlSegment } from '@angular/router';
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
        const lang = segments[0]?.path;
        return inject(LocaleService).isRouteLang(lang);
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