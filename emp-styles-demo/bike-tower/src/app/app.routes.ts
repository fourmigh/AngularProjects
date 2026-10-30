import { Routes } from '@angular/router';
import { ShowcaseComponent } from './pages/showcase/showcase.component';
import { HomeComponent } from './pages/home/home.component';
import { PlainCompareComponent } from './pages/compare/plain-compare.component';
import { SkinnedCompareComponent } from './pages/compare/skinned-compare.component';
import { SplitCompareComponent } from './pages/compare/split-compare.component';
import { skinGuard } from './skin.guard';

const skinOff = { skin: false };

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [skinGuard],
    children: [
      { path: '', component: HomeComponent, data: skinOff },
      { path: 'showcase', component: ShowcaseComponent },
      { path: 'compare', component: SplitCompareComponent, data: skinOff },
      {
        path: 'compare/plain',
        component: PlainCompareComponent,
        data: skinOff,
      },
      { path: 'compare/skinned', component: SkinnedCompareComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
