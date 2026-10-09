import { Component } from '@angular/core';
import { ThemeEditorComponent } from 'emp-components';

@Component({
  selector: 'app-theme-editor-page',
  standalone: true,
  imports: [ThemeEditorComponent],
  template: `<emp-theme-editor></emp-theme-editor>`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }
    `,
  ],
})
export class ThemeEditorPageComponent {}
