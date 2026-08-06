import { Routes } from '@angular/router';
import { CompileTimeComponent } from './compile-time/compile-time.component';

export const routes: Routes = [
  { path: '', component: CompileTimeComponent },
  { path: '**', redirectTo: '' },
];
