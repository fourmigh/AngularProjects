import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OfficialComponent } from './official/official.component';
import { CustomPageComponent } from './custom-i18n/pages/custom-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'official', component: OfficialComponent },
  { path: 'custom', component: CustomPageComponent },
  { path: '**', redirectTo: '' },
];