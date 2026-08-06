import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { OfficialContentComponent } from './official-content.component';
import { I18N_SCOPE, I18nService } from '../custom-i18n/i18n.service';
import { LocaleService } from '../locale.service';

@Component({
  selector: 'app-official',
  imports: [OfficialContentComponent],
  providers: [{ provide: I18N_SCOPE, useValue: 'official' }, I18nService],
  templateUrl: './official.component.html',
  styleUrl: './official.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficialComponent {
  readonly i18n = inject(I18nService);
  private readonly localeService = inject(LocaleService);

  constructor() {
    effect(() => {
      const locale = this.localeService.locale();
      if (this.i18n.ready()) this.i18n.switchLanguage(locale);
    });
    void this.i18n.init();
  }
}