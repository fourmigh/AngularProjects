import { Component, signal, computed, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonToggle, IonSegment, IonSegmentButton, IonLabel,
  IonSelect, IonSelectOption, IonInput,
  IonItem, IonItemDivider,
  IonList, IonNote, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonChip, IonButton, IonButtons, IonFooter,
} from '@ionic/angular';
import { DatetimePlusComponent } from '../../components/datetime-plus/datetime-plus.component';
import {
  Presentation, HourCycle, DatetimeSize, Color,
  PRESENTATIONS, HOUR_CYCLES, SIZES, WEEK_DAYS, LOCALES, COLORS,
  HOUR_VALUE_PRESETS, MINUTE_VALUE_PRESETS,
} from '../../components/datetime-plus/datetime-plus.constants';

@Component({
  selector: 'app-datetime-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonToggle, IonSegment, IonSegmentButton, IonLabel,
    IonSelect, IonSelectOption, IonInput,
    IonItem, IonItemDivider,
    IonList, IonNote, IonText,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonChip, IonButton, IonButtons, IonFooter,
    DatetimePlusComponent,
  ],
  templateUrl: './datetime-demo.component.html',
  styleUrl: './datetime-demo.component.scss',
})
export class DatetimeDemoComponent {
  isLandscape = signal(window.innerWidth > window.innerHeight);

  @ViewChild('datetimePlus') datetimePlus?: DatetimePlusComponent;

  startDateLabel = computed(() => {
    this.value();
    const d = this.datetimePlus?.startDate();
    return d ? d + '' : '';
  });

  endDateLabel = computed(() => {
    this.value();
    const d = this.datetimePlus?.endDate();
    return d ? d + '' : '';
  });

  dateDiffLabel = computed(() => {
    this.value();
    const r = this.datetimePlus?.range();
    if (!r) return '';

    if (!this.hasTime()) {
      if (r.days <= 0) return '';
      return this.formatDurationUnit(r.days, 'day');
    }

    const parts: string[] = [];
    if (r.days > 0) parts.push(this.formatDurationUnit(r.days, 'day'));
    if (r.hours > 0) parts.push(this.formatDurationUnit(r.hours, 'hour'));
    if (r.minutes > 0) parts.push(this.formatDurationUnit(r.minutes, 'minute'));
    if (r.seconds > 0 || parts.length === 0) parts.push(this.formatDurationUnit(r.seconds, 'second'));
    return parts.join(' ');
  });

  @HostListener('window:resize')
  onResize() {
    this.isLandscape.set(window.innerWidth > window.innerHeight);
  }

  presentation = signal<Presentation>('date-time');
  value = signal<string | string[] | null | undefined>(undefined);
  minValue = signal('');
  maxValue = signal('');
  hourValues = signal('');
  minuteValues = signal('');
  disabled = signal(false);
  readonly = signal(false);
  preferWheel = signal(false);
  hourCycle = signal<HourCycle>('h12');
  showDefaultButtons = signal(false);
  showClearButton = signal(false);
  showDefaultTimeLabel = signal(true);
  size = signal<DatetimeSize>('cover');
  multiple = signal(false);
  consecutive = signal(false);
  firstDayOfWeek = signal(0);
  locale = signal('en-US');
  color = signal<Color>('primary');

  PRESENTATIONS = PRESENTATIONS;
  HOUR_CYCLES = HOUR_CYCLES;
  SIZES = SIZES;
  WEEK_DAYS = WEEK_DAYS;
  LOCALES = LOCALES;
  COLORS = COLORS;
  HOUR_VALUE_PRESETS = HOUR_VALUE_PRESETS;
  MINUTE_VALUE_PRESETS = MINUTE_VALUE_PRESETS;

  hasTime = computed(() =>
    ['time', 'date-time', 'time-date'].includes(this.presentation())
  );

  hasDate = computed(() =>
    ['date', 'date-time', 'time-date', 'week', 'month', 'year', 'month-year', 'year-month'].includes(
      this.presentation()
    )
  );

  supportsMultiple = computed(() =>
    ['date', 'date-time', 'time-date'].includes(this.presentation())
  );

  minInputType = computed((): string => {
    const p = this.presentation();
    if (['date-time', 'time-date'].includes(p)) return 'datetime-local';
    if (p === 'time') return 'time';
    return 'date';
  });

  maxInputType = computed((): string => this.minInputType());

  onMinChange(event: CustomEvent) {
    this.minValue.set(event.detail.value ?? '');
  }

  onMaxChange(event: CustomEvent) {
    this.maxValue.set(event.detail.value ?? '');
  }

  clearValue() {
    this.value.set(undefined);
  }

  private formatDurationUnit(value: number, unit: 'day' | 'hour' | 'minute' | 'second'): string {
    const language = (this.locale() || 'en').split('-')[0].toLowerCase();
    const num = new Intl.NumberFormat(this.locale()).format(value);
    const labels = this.durationLabels(language, unit, value);
    return `${num} ${labels}`;
  }

  private durationLabels(language: string, unit: 'day' | 'hour' | 'minute' | 'second', value: number): string {
    if (language === 'zh') {
      const zh: Record<string, string> = { day: '天', hour: '小时', minute: '分', second: '秒' };
      return zh[unit];
    }
    const en: Record<string, string[]> = {
      day: ['day', 'days'], hour: ['hour', 'hours'],
      minute: ['minute', 'minutes'], second: ['second', 'seconds'],
    };
    const forms = en[unit];
    const plural = new Intl.PluralRules(language).select(value);
    return plural === 'one' ? forms[0] : forms[1];
  }
}
