import { Component, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonDatetime,
  IonToggle, IonSegment, IonSegmentButton, IonLabel,
  IonSelect, IonSelectOption, IonInput,
  IonItem, IonItemDivider,
  IonList, IonNote, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonChip, IonButton, IonButtons, IonFooter,
} from '@ionic/angular/standalone';

type Presentation =
  | 'date' | 'time' | 'date-time' | 'time-date'
  | 'month' | 'year' | 'month-year' | 'year-month';
type HourCycle = 'h12' | 'h23';
type DatetimeSize = 'cover' | 'fixed';

@Component({
  selector: 'app-datetime-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonDatetime,
    IonToggle, IonSegment, IonSegmentButton, IonLabel,
    IonSelect, IonSelectOption, IonInput,
    IonItem, IonItemDivider,
    IonList, IonNote, IonText,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonChip, IonButton, IonButtons, IonFooter,
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
  value = signal<string | null | undefined>(undefined);
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
  color = signal('primary');

  presentations: { value: Presentation; label: string }[] = [
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'date-time', label: 'Date-Time' },
    { value: 'time-date', label: 'Time-Date' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'month-year', label: 'Month-Year' },
    { value: 'year-month', label: 'Year-Month' },
  ];

  hourCycles: { value: HourCycle; label: string }[] = [
    { value: 'h12', label: '12 Hour' },
    { value: 'h23', label: '23 Hour' },
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

  colors = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'];

  hasTime = computed(() =>
    ['time', 'date-time', 'time-date'].includes(this.presentation())
  );

  hasDate = computed(() =>
    ['date', 'date-time', 'time-date', 'month', 'year', 'month-year', 'year-month'].includes(
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

  onDatetimeChange(event: CustomEvent) {
    this.value.set(event.detail.value);
  }

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
