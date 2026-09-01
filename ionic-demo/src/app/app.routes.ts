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
    path: 'preset-demo',
    loadComponent: () =>
      import('./pages/datetime-preset-demo/datetime-preset-demo.component').then(
        (m) => m.DatetimePresetDemoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
