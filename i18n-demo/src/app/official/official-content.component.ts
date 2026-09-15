import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../custom-i18n/i18n.service';
import type { LocaleId } from '../custom-i18n/i18n-keys';

@Component({
  selector: 'app-official-content',
  imports: [],
  templateUrl: './official-content.component.html',
  styleUrl: './official-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficialContentComponent {
  private readonly i18n = inject(I18nService);

  readonly userName = 'Developer';
  readonly itemCount = 3;

  readonly title = $localize`:@@demo.title:Angular Native i18n Demo`;
  readonly subtitle = $localize`:@@demo.subtitle:Built with @angular/localize · runtime $localize + loadTranslations`;
  readonly welcome = $localize`:@@demo.welcome:Hello, ${this.userName}:USER:!`;
  readonly intro = $localize`:@@demo.intro:This is a live demo of Angular's built-in i18n. Click a language button on the left to switch instantly without rebuilding, or edit the JSON config in the editor and press Apply.`;
  readonly itemLabel = $localize`:@@demo.items:You have ${this.itemCount}:COUNT: items in your cart`;
  readonly currentLanguageLabel = $localize`:@@demo.currentLanguage:Current language`;
  readonly dateLabel = $localize`:@@demo.date:Localized date`;
  readonly numberLabel = $localize`:@@demo.number:Localized number`;
  readonly tip = $localize`:@@demo.tip:Tip: $localize in TS and i18n attributes in templates both support runtime translation via loadTranslations.`;
  readonly rendersLabel = $localize`:@@demo.renders:Component rebuilds`;

  readonly languages = this.i18n.languages;
  readonly current = this.i18n.current;
  readonly rebuilds = this.i18n.rebuilds;

  readonly date = computed(() => this.i18n.format.date(new Date()));
  readonly price = computed(() => this.i18n.format.currency(1234.56));

  switchLanguage(id: LocaleId): void {
    this.i18n.switchLanguage(id);
  }
}