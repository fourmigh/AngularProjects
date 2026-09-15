import { Injectable, inject } from '@angular/core';
import { LocaleService } from '../locale.service';

export interface CurrencyFormatOptions extends Intl.NumberFormatOptions {
  /** 货币代码；缺省使用 FormatService 的默认货币（EUR）。 */
  currency?: string;
  /** 是否显示货币标识；false 时仅输出数字但保留该货币的小数位规则。默认 true。 */
  withSymbol?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FormatService {
  private readonly localeService = inject(LocaleService);

  private static readonly DEFAULT_CURRENCY = 'EUR';

  private readonly dateFormatters = new Map<string, Intl.DateTimeFormat>();
  private readonly numberFormatters = new Map<string, Intl.NumberFormat>();
  private readonly relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();
  private readonly listFormatters = new Map<string, Intl.ListFormat>();
  private readonly pluralRules = new Map<string, Intl.PluralRules>();

  private get locale(): string {
    return this.localeService.locale();
  }

  date(value: Date | number, options: Intl.DateTimeFormatOptions = { dateStyle: 'full' }): string {
    try {
      return this.dateFormatter(options).format(value);
    } catch {
      return String(value);
    }
  }

  number(value: number, options: Intl.NumberFormatOptions = {}): string {
    try {
      return this.numberFormatter(options).format(value);
    } catch {
      return String(value);
    }
  }

  currency(value: number, options: CurrencyFormatOptions = {}): string {
    const { withSymbol = true, currency = FormatService.DEFAULT_CURRENCY, ...intl } = options;
    try {
      if (withSymbol) {
        return this.numberFormatter({
          ...intl,
          style: 'currency',
          currency,
          currencyDisplay: 'symbol',
        }).format(value);
      }
      // 纯数字但保留该货币的小数位规则（EUR=2 / JPY=0 / BHD=3）
      const digits = this.numberFormatter({ style: 'currency', currency }).resolvedOptions();
      return this.numberFormatter({
        ...intl,
        style: 'decimal',
        minimumFractionDigits: intl.minimumFractionDigits ?? digits.minimumFractionDigits,
        maximumFractionDigits: intl.maximumFractionDigits ?? digits.maximumFractionDigits,
      }).format(value);
    } catch {
      return String(value);
    }
  }

  percent(value: number, options: Intl.NumberFormatOptions = {}): string {
    try {
      return this.numberFormatter({ ...options, style: 'percent' }).format(value);
    } catch {
      return String(value);
    }
  }

  relative(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options: Intl.RelativeTimeFormatOptions = {},
  ): string {
    try {
      return this.relativeFormatter(options).format(value, unit);
    } catch {
      return String(value);
    }
  }

  list(items: readonly string[], options: Intl.ListFormatOptions = {}): string {
    try {
      return this.listFormatter(options).format(items);
    } catch {
      return items.join(', ');
    }
  }

  plural(value: number, options: Intl.PluralRulesOptions = {}): Intl.LDMLPluralRule {
    try {
      return this.pluralRule(options).select(value);
    } catch {
      return 'other';
    }
  }

  private dateFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let formatter = this.dateFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(this.locale, options);
      this.dateFormatters.set(key, formatter);
    }
    return formatter;
  }

  private numberFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let formatter = this.numberFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat(this.locale, options);
      this.numberFormatters.set(key, formatter);
    }
    return formatter;
  }

  private relativeFormatter(options: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let formatter = this.relativeFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.RelativeTimeFormat(this.locale, options);
      this.relativeFormatters.set(key, formatter);
    }
    return formatter;
  }

  private listFormatter(options: Intl.ListFormatOptions): Intl.ListFormat {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let formatter = this.listFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.ListFormat(this.locale, options);
      this.listFormatters.set(key, formatter);
    }
    return formatter;
  }

  private pluralRule(options: Intl.PluralRulesOptions): Intl.PluralRules {
    const key = `${this.locale}|${JSON.stringify(options)}`;
    let rules = this.pluralRules.get(key);
    if (!rules) {
      rules = new Intl.PluralRules(this.locale, options);
      this.pluralRules.set(key, rules);
    }
    return rules;
  }
}
