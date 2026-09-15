import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OfficialContentComponent } from './official-content.component';
import { I18nService } from '../custom-i18n/i18n.service';

@Component({
  selector: 'app-official',
  imports: [OfficialContentComponent],
  templateUrl: './official.component.html',
  styleUrl: './official.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficialComponent {
  readonly i18n = inject(I18nService);
}
