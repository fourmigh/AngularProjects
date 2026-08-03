import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/time-demo/time-demo.component').then(
        (m) => m.TimeDemoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];