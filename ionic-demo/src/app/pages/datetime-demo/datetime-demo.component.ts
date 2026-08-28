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

  onMinChange(event: CustomEvent) {
    this.minValue.set(event.detail.value ?? '');
  }

  onMaxChange(event: CustomEvent) {
    this.maxValue.set(event.detail.value ?? '');
  }

  clearValue() {
    this.value.set(undefined);
  }
}
