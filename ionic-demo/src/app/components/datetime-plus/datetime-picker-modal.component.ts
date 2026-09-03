import { Component, input, signal, computed, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonButton, IonContent,
} from '@ionic/angular';
import { DatetimePlusComponent } from './datetime-plus.component';
import { Color } from './datetime-plus.constants';
import { localizePickerModal } from './datetime-plus.i18n';

export interface PickerModalProps {
  title: string;
  initialValue: string | string[] | null | undefined;
  color: Color;
  locale: string;
  firstDayOfWeek: number | undefined;
}

export interface PickerModalResult {
  value: string | null;
  cleared: boolean;
}

@Component({
  selector: 'app-datetime-picker-modal',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    DatetimePlusComponent,
  ],
  templateUrl: './datetime-picker-modal.component.html',
})
export class DatetimePickerModalComponent implements OnInit {
  title = input<string>('');
  initialValue = input<string | string[] | null | undefined>();
  color = input<Color>('primary');
  locale = input<string>('en');
  firstDayOfWeek = input<number | undefined>(0);

  selected = signal<string | string[] | null | undefined>(undefined);

  cancelLabel = computed(() => localizePickerModal(this.locale(), 'cancel'));
  clearLabel = computed(() => localizePickerModal(this.locale(), 'clear'));
  okLabel = computed(() => localizePickerModal(this.locale(), 'ok'));

  private readonly baseYear = new Date().getFullYear();
  pickerMin = signal(`${this.baseYear - 100}-01-01T00:00`);
  pickerMax = signal(`${this.baseYear + 100}-12-31T23:59`);

  private readonly modalController = inject(ModalController);

  ngOnInit() {
    this.selected.set(this.initialValue());
  }

  cancel() {
    this.modalController.dismiss();
  }

  confirm() {
    const v = this.normalize(this.selected());
    this.modalController.dismiss({ value: v || null, cleared: false } satisfies PickerModalResult);
  }

  clear() {
    this.modalController.dismiss({ value: null, cleared: true } satisfies PickerModalResult);
  }

  private normalize(v: string | string[] | null | undefined): string {
    if (!v) return '';
    if (Array.isArray(v)) v = v[0] ?? '';
    return typeof v === 'string' ? v : '';
  }
}