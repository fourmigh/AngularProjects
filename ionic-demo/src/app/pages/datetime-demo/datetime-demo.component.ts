import { Component, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonToggle, IonSegment, IonSegmentButton, IonLabel,
  IonSelect, IonSelectOption, IonInput,
  IonItem, IonItemDivider,
  IonList, IonNote, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonChip, IonButton, IonButtons, IonFooter,
} from '@ionic/angular/standalone';
import type { DatetimePresentation, DatetimeHourCycle, Color } from '@ionic/core/components';
import { DatetimePlusComponent } from '../../components/datetime-plus/datetime-plus.component';

type Presentation = DatetimePresentation | 'week';
type HourCycle = DatetimeHourCycle;
type DatetimeSize = 'cover' | 'fixed';

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

  @HostListener('window:resize')
  onResize() {
    this.isLandscape.set(window.innerWidth > window.innerHeight);
  }

  presentation = signal<Presentation>('date-time');
  value = signal<string | string[] | null | undefined>(undefined);
  minValue = signal('');
  maxValue = signal('');
  disabled = signal(false);
  readonly = signal(false);
  preferWheel = signal(false);
  hourCycle = signal<HourCycle>('h12');
  showDefaultButtons = signal(false);
  showClearButton = signal(false);
  showDefaultTimeLabel = signal(true);
  size = signal<DatetimeSize>('cover');
  multiple = signal(false);
  firstDayOfWeek = signal(0);
  locale = signal('en-US');
  color = signal<Color>('primary');

  presentations: { value: Presentation; label: string }[] = [
    { value: 'time', label: 'Time' },
    { value: 'date', label: 'Date' },
    { value: 'date-time', label: 'Date-Time' },
    { value: 'time-date', label: 'Time-Date' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'month-year', label: 'Month-Year' },
    { value: 'year', label: 'Year' },
  ];

  hourCycles: { value: HourCycle; label: string }[] = [
    { value: 'h12', label: '12 Hour' },
    { value: 'h24', label: '24 Hour' },
  ];

  sizes: { value: DatetimeSize; label: string }[] = [
    { value: 'cover', label: 'Cover' },
    { value: 'fixed', label: 'Fixed' },
  ];

  weekDays: { value: number; label: string }[] = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  locales: { value: string; label: string }[] = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'zh-CN', label: '中文 (中国)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'es-ES', label: 'Espa\u00F1ol' },
    { value: 'fr-FR', label: 'Fran\u00E7ais' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'ko-KR', label: '\uD55C\uAD6D\uC5B4' },
    { value: 'ar-SA', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
  ];

  colors: Color[] = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'];

  hasTime = computed(() =>
    ['time', 'date-time', 'time-date'].includes(this.presentation())
  );

  hasDate = computed(() =>
    ['date', 'date-time', 'time-date', 'week', 'month', 'year', 'month-year', 'year-month'].includes(
      this.presentation()
    )
  );

  minInputType = computed((): string => {
    const p = this.presentation();
    if (['date-time', 'time-date'].includes(p)) return 'datetime-local';
    if (p === 'time') return 'time';
    return 'date';
  });

  maxInputType = computed((): string => this.minInputType());

  weekRangeLabel = computed(() => {
    if (this.presentation() !== 'week') return '';
    const val = this.value();
    if (!val) return '';
    const picked = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : '');
    if (!picked) return '';
    const d = new Date(picked);
    const day = d.getDay();
    const firstDay = this.firstDayOfWeek();
    const diffToFirst = (day - firstDay + 7) % 7;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - diffToFirst);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const fmt = (dt: Date) =>
      dt.toLocaleDateString(this.locale(), { month: 'short', day: 'numeric' });
    return `${fmt(weekStart)} \u2013 ${fmt(weekEnd)}, ${weekEnd.getFullYear()}`;
  });

  onMinChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.minValue.set(input.value);
  }

  onMaxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.maxValue.set(input.value);
  }

  clearValue() {
    this.value.set(undefined);
  }

  clearMin() {
    this.minValue.set('');
  }

  clearMax() {
    this.maxValue.set('');
  }
}
