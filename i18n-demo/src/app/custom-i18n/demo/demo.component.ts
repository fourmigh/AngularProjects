import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../i18n.service';
import type { LocaleId } from '../i18n-keys';

@Component({
  selector: 'app-demo',
  imports: [],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {
  private readonly i18n = inject(I18nService);

  readonly userName = 'Developer';
  readonly itemCount = 3;

  // 原写法: readonly title = $localize`:@@demo.title:Angular Native i18n Demo`;
  readonly title = this.i18n.t('demo.title');
  // 原写法: readonly subtitle = $localize`:@@demo.subtitle:Built with @angular/localize - runtime $localize + loadTranslations`;
  readonly subtitle = this.i18n.t('demo.subtitle');
  // 原写法: readonly welcome = $localize`:@@demo.welcome:Hello, ${this.userName}:USER:!`;
  readonly welcome = this.i18n.t('demo.welcome', { USER: this.userName });
  // 原写法: readonly intro = $localize`:@@demo.intro:This is a live demo of Angular's built-in i18n. Click a language button on the left to switch instantly without rebuilding, or edit the JSON config in the editor and press Apply.`;
  readonly intro = this.i18n.t('demo.intro');
  // 原写法: readonly itemLabel = $localize`:@@demo.items:You have ${this.itemCount}:COUNT: items in your cart`;
  readonly itemLabel = this.i18n.t('demo.items', { COUNT: this.itemCount });
  // 原写法: readonly currentLanguageLabel = $localize`:@@demo.currentLanguage:Current language`;
  readonly currentLanguageLabel = this.i18n.t('demo.currentLanguage');
  // 原写法: readonly dateLabel = $localize`:@@demo.date:Localized date`;
  readonly dateLabel = this.i18n.t('demo.date');
  // 原写法: readonly numberLabel = $localize`:@@demo.number:Localized number`;
  readonly numberLabel = this.i18n.t('demo.number');
  // 原写法: readonly tip = $localize`:@@demo.tip:Tip: $localize in TS and i18n attributes in templates both support runtime translation via loadTranslations.`;
  readonly tip = this.i18n.t('demo.tip');
  // 原写法: readonly rendersLabel = $localize`:@@demo.renders:Component rebuilds`;
  readonly rendersLabel = this.i18n.t('demo.renders');

  readonly languages = this.i18n.languages;
  readonly current = this.i18n.current;
  readonly rebuilds = this.i18n.rebuilds;

  readonly date = computed(() =>
    new Intl.DateTimeFormat(this.i18n.current(), { dateStyle: 'full' }).format(new Date()),
  );
  readonly price = computed(() =>
    new Intl.NumberFormat(this.i18n.current(), { style: 'currency', currency: 'EUR' }).format(1234.56),
  );

  // localize 切换语言链路:
  // 1) switchLanguage(id): current.set(id) + applyLocale(id)
  // 2) applyLocale: buildMap(id) 抽取当前语言 → clearTranslations() 清旧消息 → loadTranslations(map) 载入新语言映射
  // 3) renderTick++ → app.component.html 的 @for track 触发 <app-demo> 重建
  // 4) demo 字段重新执行 this.i18n.t(...) → 读 activeMap 新语言，界面即时切换
  switchLanguage(id: LocaleId): void {
    this.i18n.switchLanguage(id);
  }
}
