import { Routes } from '@angular/router';
import { DemoHomeComponent } from './pages/demo-home/demo-home.component';
import { ThemeEditorComponent } from './pages/theme-editor/theme-editor.component';

export const routes: Routes = [
  { path: '', component: DemoHomeComponent },
  { path: 'theme-editor', component: ThemeEditorComponent },
];
