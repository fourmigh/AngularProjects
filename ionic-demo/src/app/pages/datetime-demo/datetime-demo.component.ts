import { Component, signal, computed, HostListener, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonToggle, IonSegment, IonSegmentButton, IonLabel,
  IonSelect, IonSelectOption,
  IonItem, IonItemDivider,
  IonList, IonNote, IonText,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonChip, IonButton, IonButtons, IonFooter,
} from '@ionic/angular';
import { DatetimePlusComponent } from '../../components/datetime-plus/datetime-plus.component';
import {
  DatetimePickerModalComponent,
  PickerModalProps,
  PickerModalResult,
} from './datetime-picker-modal.component';
import {
  formatDuration,
  localizePresentations, localizeHourCycles, localizeSizes,
  localizeWeekDays, localizeHourValuePresets, localizeMinuteValuePresets,
  localizeNoSelection,
} from '../../components/datetime-plus/datetime-plus.i18n';
import {
  Presentation, HourCycle, DatetimeSize, Color,
  LOCALES, COLORS,
} from '../../components/datetime-plus/datetime-plus.constants';

@Component({
  selector: 'app-datetime-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    FormsModule,
    RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonToggle, IonSegment, IonSegmentButton, IonLabel,
    IonSelect, IonSelectOption,
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

  private readonly modalController = inject(ModalController);

  constructor() {
    effect(() => {
      if (!this.supportsMultiple()) {
        this.multiple.set(false);
        this.consecutive.set(false);
      }
    });
  }

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
      return this.formatDuration(r.days, 'day');
    }

    const parts: string[] = [];
    if (r.days > 0) parts.push(this.formatDuration(r.days, 'day'));
    if (r.hours > 0) parts.push(this.formatDuration(r.hours, 'hour'));
    if (r.minutes > 0) parts.push(this.formatDuration(r.minutes, 'minute'));
    if (r.seconds > 0 || parts.length === 0) parts.push(this.formatDuration(r.seconds, 'second'));
    return parts.join(' ');
  });

  @HostListener('window:resize')
  onResize() {
    this.isLandscape.set(window.innerWidth > window.innerHeight);
  }

  presentation = signal<Presentation>('date-time');
  value = signal<string | string[] | null | undefined>(undefined);
  minValue = signal<string | undefined>(undefined);
  maxValue = signal<string | undefined>(undefined);
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
  locale = signal('en');
  color = signal<Color>('primary');

  LOCALES = LOCALES;
  COLORS = COLORS;

  presentationOptions = computed(() => localizePresentations(this.locale()));
  hourCycleOptions = computed(() => localizeHourCycles(this.locale()));
  sizeOptions = computed(() => localizeSizes(this.locale()));
  weekDayOptions = computed(() => localizeWeekDays(this.locale()));
  hourValuePresetOptions = computed(() => localizeHourValuePresets(this.locale()));
  minuteValuePresetOptions = computed(() => localizeMinuteValuePresets(this.locale()));
  noSelectionText = computed(() => localizeNoSelection(this.locale()));

  hasTime = computed(() =>
    ['time', 'date-time', 'time-date'].includes(this.presentation())
  );

  hasDate = computed(() =>
    ['date', 'date-time', 'time-date', 'week', 'month', 'year', 'month-year', 'year-month'].includes(
      this.presentation()
    )
  );

  supportsMultiple = computed(() =>
    ['date', 'date-time', 'time-date', 'week'].includes(this.presentation())
  );

  hasSelection = computed(() => {
    const v = this.value();
    return v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0);
  });

  clearValue() {
    this.value.set(undefined);
  }

  openMinPicker() {
    this.openPicker('Set Min', this.minValue());
  }

  openMaxPicker() {
    this.openPicker('Set Max', this.maxValue());
  }

  private async openPicker(title: string, initialValue: string | undefined) {
    const modal = await this.modalController.create({
      component: DatetimePickerModalComponent,
      cssClass: 'picker-modal',
      componentProps: {
        title,
        initialValue,
        color: this.color(),
      } satisfies PickerModalProps,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss<PickerModalResult | undefined>();

    if (!data) return;
    if (data.cleared || !data.value) {
      if (title === 'Set Min') this.minValue.set(undefined);
      else this.maxValue.set(undefined);
      return;
    }
    if (title === 'Set Min') this.minValue.set(data.value);
    else this.maxValue.set(data.value);
  }

  private formatDuration(value: number, unit: 'day' | 'hour' | 'minute' | 'second'): string {
    return formatDuration(this.locale(), value, unit);
  }
}
