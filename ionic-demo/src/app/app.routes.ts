import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/datetime-demo/datetime-demo.component').then(
        (m) => m.DatetimeDemoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
