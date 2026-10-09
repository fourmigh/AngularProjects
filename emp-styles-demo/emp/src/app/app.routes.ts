import { Routes } from '@angular/router';
import { DemoHomeComponent } from './pages/demo-home/demo-home.component';
import { ThemeEditorPageComponent } from './pages/theme-editor/theme-editor-page.component';

export const routes: Routes = [
  { path: '', component: DemoHomeComponent },
  { path: 'theme-editor', component: ThemeEditorPageComponent },
];
