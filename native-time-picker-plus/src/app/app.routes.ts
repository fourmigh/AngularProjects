import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/time-picker-demo/time-picker-demo.component').then(
        (m) => m.TimePickerDemoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];