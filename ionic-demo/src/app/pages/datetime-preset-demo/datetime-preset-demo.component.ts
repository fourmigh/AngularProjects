import { Component, signal, computed, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonLabel, IonNote, IonBadge, IonText,
} from '@ionic/angular';
import { DatetimePlusComponent } from '../../components/datetime-plus/datetime-plus.component';
import { formatDuration, localizeNoSelection } from '../../components/datetime-plus/datetime-plus.i18n';
import { LOCALES } from '../../components/datetime-plus/datetime-plus.constants';

const DEFAULT_LOCALE = 'en';

@Component({
  selector: 'app-datetime-preset-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonNote, IonBadge, IonText,
    DatetimePlusComponent,
  ],
  templateUrl: './datetime-preset-demo.component.html',
  styleUrl: './datetime-preset-demo.component.scss',
})
export class DatetimePresetDemoComponent {
  locale = signal<string>(DEFAULT_LOCALE);
  noSelectionText = computed(() => localizeNoSelection(this.locale()));

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      const locale = params.get('locale');
      this.locale.set(this.isValidLocale(locale) ? locale : DEFAULT_LOCALE);
    });
  }

  private isValidLocale(locale: string | null): locale is string {
    return !!locale && LOCALES.some((l) => l.value === locale);
  }

  singleDate = signal<string | string[] | null | undefined>(undefined);
  multipleDate = signal<string | string[] | null | undefined>(undefined);
  singleWeek = signal<string | string[] | null | undefined>(undefined);
  multipleWeek = signal<string | string[] | null | undefined>(undefined);
  monthYear = signal<string | string[] | null | undefined>(undefined);

  @ViewChild('cSingleDate') cSingleDate?: DatetimePlusComponent;
  @ViewChild('cMultipleDate') cMultipleDate?: DatetimePlusComponent;
  @ViewChild('cSingleWeek') cSingleWeek?: DatetimePlusComponent;
  @ViewChild('cMultipleWeek') cMultipleWeek?: DatetimePlusComponent;
  @ViewChild('cMonthYear') cMonthYear?: DatetimePlusComponent;

  singleDateStart = computed(() => {
    this.singleDate();
    return this.startLabel(this.cSingleDate);
  });
  singleDateEnd = computed(() => {
    this.singleDate();
    return this.endLabel(this.cSingleDate);
  });
  singleDateRange = computed(() => {
    this.singleDate();
    return this.rangeLabel(this.cSingleDate);
  });

  multipleDateStart = computed(() => {
    this.multipleDate();
    return this.startLabel(this.cMultipleDate);
  });
  multipleDateEnd = computed(() => {
    this.multipleDate();
    return this.endLabel(this.cMultipleDate);
  });
  multipleDateRange = computed(() => {
    this.multipleDate();
    return this.rangeLabel(this.cMultipleDate);
  });

  singleWeekStart = computed(() => {
    this.singleWeek();
    return this.startLabel(this.cSingleWeek);
  });
  singleWeekEnd = computed(() => {
    this.singleWeek();
    return this.endLabel(this.cSingleWeek);
  });
  singleWeekRange = computed(() => {
    this.singleWeek();
    return this.rangeLabel(this.cSingleWeek);
  });

  multipleWeekStart = computed(() => {
    this.multipleWeek();
    return this.startLabel(this.cMultipleWeek);
  });
  multipleWeekEnd = computed(() => {
    this.multipleWeek();
    return this.endLabel(this.cMultipleWeek);
  });
  multipleWeekRange = computed(() => {
    this.multipleWeek();
    return this.rangeLabel(this.cMultipleWeek);
  });

  monthYearStart = computed(() => {
    this.monthYear();
    return this.startLabel(this.cMonthYear, 'month');
  });
  monthYearEnd = computed(() => {
    this.monthYear();
    return this.endLabel(this.cMonthYear, 'month');
  });
  monthYearRange = computed(() => {
    this.monthYear();
    return this.rangeLabel(this.cMonthYear);
  });

  private startLabel(
    component: DatetimePlusComponent | undefined,
    mode: 'date' | 'month' = 'date'
  ): string {
    const d = component?.startDate();
    if (!d) return this.noSelectionText();
    return this.format(d, mode);
  }

  private endLabel(
    component: DatetimePlusComponent | undefined,
    mode: 'date' | 'month' = 'date'
  ): string {
    const d = component?.endDate();
    if (!d) return this.noSelectionText();
    return this.format(d, mode);
  }

  private rangeLabel(component: DatetimePlusComponent | undefined): string {
    const r = component?.range();
    if (!r) return this.noSelectionText();
    if (!this.hasTime(component)) {
      return r.days > 0 ? formatDuration(this.locale(), r.days, 'day') : this.noSelectionText();
    }
    const parts: string[] = [];
    if (r.days > 0) parts.push(formatDuration(this.locale(), r.days, 'day'));
    if (r.hours > 0) parts.push(formatDuration(this.locale(), r.hours, 'hour'));
    if (r.minutes > 0) parts.push(formatDuration(this.locale(), r.minutes, 'minute'));
    if (r.seconds > 0 || parts.length === 0) parts.push(formatDuration(this.locale(), r.seconds, 'second'));
    return parts.join(' ');
  }

  private hasTime(component: DatetimePlusComponent | undefined): boolean {
    const p = component?.presentation();
    return p === 'time' || p === 'date-time' || p === 'time-date';
  }

  private format(d: Date, mode: 'date' | 'month'): string {
    const region = this.regionLocale(this.locale());
    const options: Intl.DateTimeFormatOptions =
      mode === 'month'
        ? { year: 'numeric', month: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat(region, options).format(d);
  }

  private regionLocale(locale: string): string {
    return locale === 'en' ? 'en-US' : locale === 'zh' ? 'zh-CN' : locale;
  }
}
