import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoComponent } from '../demo/demo.component';
import { EditorComponent } from '../editor/editor.component';
import { I18N_SCOPE, I18nService } from '../i18n.service';

@Component({
  selector: 'app-custom-page',
  imports: [DemoComponent, EditorComponent],
  providers: [{ provide: I18N_SCOPE, useValue: 'custom' }, I18nService],
  templateUrl: './custom-page.component.html',
  styleUrl: './custom-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPageComponent {
  readonly i18n = inject(I18nService);

  constructor() {
    void this.i18n.init();
  }
}