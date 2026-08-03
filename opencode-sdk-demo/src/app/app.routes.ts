import { Routes } from '@angular/router';
import { App } from './app';

export const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'demo/:id',
        loadComponent: () =>
          import('./pages/demo-detail/demo-detail.component').then((m) => m.DemoDetailComponent),
      },
    ],
  },
];
