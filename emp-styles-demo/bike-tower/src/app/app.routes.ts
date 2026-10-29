import { Routes } from '@angular/router';
import { ShowcaseComponent } from './pages/showcase/showcase.component';
import { HomeComponent } from './pages/home/home.component';
import { PlainCompareComponent } from './pages/compare/plain-compare.component';
import { SkinnedCompareComponent } from './pages/compare/skinned-compare.component';
import { SplitCompareComponent } from './pages/compare/split-compare.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'showcase', component: ShowcaseComponent },
  { path: 'compare', component: SplitCompareComponent },
  { path: 'compare/plain', component: PlainCompareComponent },
  { path: 'compare/skinned', component: SkinnedCompareComponent },
  { path: '**', redirectTo: '' },
];
