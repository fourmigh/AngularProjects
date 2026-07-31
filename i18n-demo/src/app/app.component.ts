import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoComponent } from './demo/demo.component';
import { EditorComponent } from './editor/editor.component';
import { I18nService } from './i18n.service';

@Component({
  selector: 'app-root',
  imports: [DemoComponent, EditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly i18n = inject(I18nService);
}
