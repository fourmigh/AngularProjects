import { Component, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonToggle, IonSegment, IonSegmentButton, IonLabel,
  IonSelect, IonSelectOption,
  IonItem, IonItemDivider,
  IonList, IonNote, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonChip, IonButton, IonButtons, IonFooter,
} from '@ionic/angular/standalone';
import { NativeTimePickerComponent } from '../../components/native-time-picker/native-time-picker.component';
import { PRESENTATIONS, PLATFORMS, COLORS, Presentation, Platform } from '../../components/native-time-picker/native-time-picker.constants';

@Component({
  selector: 'app-time-picker-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    FormsModule,
    NativeTimePickerComponent,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonToggle, IonSegment, IonSegmentButton, IonLabel,
    IonSelect, IonSelectOption,
    IonItem, IonItemDivider,
    IonList, IonNote, IonText,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonChip, IonButton, IonButtons, IonFooter,
  ],
  templateUrl: './time-picker-demo.component.html',
  styleUrl: './time-picker-demo.component.scss',
})
export class TimePickerDemoComponent {
  isLandscape = signal(window.innerWidth > window.innerHeight);

  @HostListener('window:resize')
  onResize() {
    this.isLandscape.set(window.innerWidth > window.innerHeight);
  }

  formatDisplayValue(val: string | string[] | null | undefined): string {
    if (!val) return '—';
    return Array.isArray(val) ? val.join(', ') : val;
  }

  value = signal<string | string[] | null | undefined>('14:30');
  presentation = signal<Presentation>('time');
  platform = signal<Platform>('ios');
  minuteInterval = signal<number>(5);
  hourCycle = signal<'h12' | 'h24'>('h24');
  disabled = signal(false);
  color = signal('primary');
  locale = signal('en-US');
  firstDayOfWeek = signal(0);
  showClearButton = signal(false);

  readonly intervals: number[] = [1, 5, 10, 15, 30, 60];
  readonly presentations = PRESENTATIONS;
  readonly platforms = PLATFORMS;
  readonly colors = COLORS;

  readonly locales = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'zh-CN', label: '中文 (中国)' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'ko-KR', label: '한국어' },
    { value: 'ar-SA', label: 'العربية' },
  ];

  readonly weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  hasTime = computed(() => ['time', 'date-time', 'time-date'].includes(this.presentation()));

  intervalLabel = computed(() => {
    const v = this.minuteInterval();
    return v === 1 ? 'Every minute' : `Every ${v} min`;
  });

  defaultPreviewValue = computed((): string | undefined => {
    const p = this.presentation();
    if (p === 'time') return '14:30';
    if (p === 'date') return '2026-07-24';
    if (p === 'date-time' || p === 'time-date') return '2026-07-24T14:30';
    if (p === 'week') return '2026-07-20';
    if (p === 'month') return '2026-07';
    if (p === 'year') return '2026';
    if (p === 'month-year') return '2026-07';
    return undefined;
  });

  setValueToDefault() {
    this.value.set(this.defaultPreviewValue());
  }

  setValueFromNow() {
    const now = new Date();
    const p = this.presentation();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    switch (p) {
      case 'time': this.value.set(`${h}:${min}`); break;
      case 'date': this.value.set(`${y}-${m}-${d}`); break;
      case 'date-time':
      case 'time-date': this.value.set(`${y}-${m}-${d}T${h}:${min}`); break;
      case 'week': this.value.set(`${y}-${m}-${d}`); break;
      case 'month':
      case 'month-year': this.value.set(`${y}-${m}`); break;
      case 'year': this.value.set(`${y}`); break;
    }
  }

  clearValue() {
    this.value.set(null);
  }
}