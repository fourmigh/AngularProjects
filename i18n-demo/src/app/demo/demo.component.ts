import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { LocaleId } from 'i18n';
import { APP_I18N } from '../i18n-bindings/app-i18n';

const CURRENCIES = ['EUR', 'USD', 'JPY', 'CNY', 'GBP'] as const;
type CurrencyCode = (typeof CURRENCIES)[number];

@Component({
  selector: 'app-demo',
  imports: [],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {
  private readonly i18n = inject(APP_I18N);

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
  // 原写法: readonly currencyLabel = $localize`:@@demo.currency:Localized currency`;
  readonly currencyLabel = this.i18n.t('demo.currency');
  // 原写法: readonly tip = $localize`:@@demo.tip:Tip: $localize in TS and i18n attributes in templates both support runtime translation via loadTranslations.`;
  readonly tip = this.i18n.t('demo.tip');
  // 原写法: readonly rendersLabel = $localize`:@@demo.renders:Component rebuilds`;
  readonly rendersLabel = this.i18n.t('demo.renders');

  readonly languages = this.i18n.languages;
  readonly current = this.i18n.current;
  readonly rebuilds = this.i18n.rebuilds;

  readonly currencies = CURRENCIES;
  readonly selectedCurrency = signal<CurrencyCode>('EUR');

  readonly date = computed(() => this.i18n.format.date(new Date()));
  readonly money = computed(() =>
    this.i18n.format.currency(1234.56, { currency: this.selectedCurrency() }),
  );

  // localize 切换语言链路:
  // 1) switchLanguage(id) → LocaleService.setLocale(id)（全局语言源）
  // 2) I18nService 内部 effect 监听 locale 变化 → applyLocale(id)
  // 3) applyLocale: buildMap(id) 抽取当前语言 → clearTranslations() 清旧消息 → loadTranslations(map) 载入新语言映射
  // 4) renderTick++ → custom-page.component.html 的 @for track 触发 <app-demo> 重建
  // 5) demo 字段重新执行 this.i18n.t(...) → $localize 按消息 id 读官方 registry 新语言，界面即时切换
  // 语言为内存状态（localStorage 记住上次选择）：setLocale 不改变 URL
  switchLanguage(id: LocaleId): void {
    this.i18n.switchLanguage(id);
  }

  selectCurrency(currency: CurrencyCode): void {
    this.selectedCurrency.set(currency);
  }
}
