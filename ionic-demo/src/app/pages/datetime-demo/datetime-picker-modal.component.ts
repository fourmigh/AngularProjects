import { Component, input, signal, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonButton, IonContent,
} from '@ionic/angular';
import { DatetimePlusComponent } from '../../components/datetime-plus/datetime-plus.component';
import { Color } from '../../components/datetime-plus/datetime-plus.constants';

export interface PickerModalProps {
  title: string;
  initialValue: string | string[] | null | undefined;
  color: Color;
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
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button color="danger" (click)="clear()">Clear</ion-button>
          <ion-button (click)="cancel()">Cancel</ion-button>
          <ion-button [color]="color()" (click)="confirm()">OK</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-datetime-plus
        presentation="date-time"
        hourCycle="h23"
        [min]="pickerMin()"
        [max]="pickerMax()"
        [value]="selected()"
        (valueChange)="selected.set($event)"
      ></app-datetime-plus>
    </ion-content>
  `,
})
export class DatetimePickerModalComponent implements OnInit {
  title = input<string>('');
  initialValue = input<string | string[] | null | undefined>();
  color = input<Color>('primary');

  selected = signal<string | string[] | null | undefined>(undefined);

  private readonly baseYear = new Date().getFullYear();
  pickerMin = signal(`${this.baseYear - 100}-01-01T00:00`);
  pickerMax = signal(`${this.baseYear + 100}-12-31T23:59`);

  constructor(private modalController: ModalController) {}

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
