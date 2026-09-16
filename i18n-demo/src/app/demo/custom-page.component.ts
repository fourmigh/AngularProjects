import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from 'i18n';
import { EditorComponent, I18N_EDITOR_TRANSLATE } from 'i18n/editor';
import { APP_I18N } from '../i18n/app-i18n';
import { setupMonacoEnvironment } from '../monaco-environment';
import { DemoComponent } from './demo.component';

@Component({
  selector: 'app-custom-page',
  imports: [DemoComponent, EditorComponent],
  providers: [
    {
      provide: I18N_EDITOR_TRANSLATE,
      useFactory: (i18n: I18nService) => (key: string) => i18n.t(key),
      deps: [I18nService],
    },
  ],
  templateUrl: './custom-page.component.html',
  styleUrl: './custom-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPageComponent {
  readonly i18n = inject(APP_I18N);

  constructor() {
    setupMonacoEnvironment();
  }
}
