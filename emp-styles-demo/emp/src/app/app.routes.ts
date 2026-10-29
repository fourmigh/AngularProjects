import { Routes } from '@angular/router';
import { ShowcaseComponent } from './pages/showcase/showcase.component';

export const routes: Routes = [
  { path: '', component: ShowcaseComponent },
  { path: 'showcase', component: ShowcaseComponent },
  {
    path: 'skin-editor',
    loadComponent: () =>
      import('./pages/skin-editor/skin-editor.component').then(
        (m) => m.SkinEditorComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
