import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OfficialContentComponent } from './official-content.component';
import { APP_I18N } from '../i18n/app-i18n';

@Component({
  selector: 'app-official',
  imports: [OfficialContentComponent],
  templateUrl: './official.component.html',
  styleUrl: './official.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficialComponent {
  readonly i18n = inject(APP_I18N);
}
