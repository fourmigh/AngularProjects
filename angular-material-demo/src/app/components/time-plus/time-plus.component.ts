import { Component, model, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import type { ThemePalette } from '@angular/material/core';
import type { Appearance } from './time-plus.constants';

@Component({
  selector: 'app-time-plus',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field [appearance]="appearance()" [color]="color()">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [matTimepicker]="picker"
        [value]="value()"
        (valueChange)="value.set($event)"
        [matTimepickerMin]="min()"
        [matTimepickerMax]="max()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [required]="required()"
        [placeholder]="placeholder()"
      />
      <mat-timepicker-toggle matIconSuffix [for]="picker" [disabled]="disabled()" />
      <mat-timepicker #picker [interval]="interval()" />
    </mat-form-field>
  `,
})
export class TimePlusComponent {
  value = model<Date | null>(null);
  label = input('Select time');
  placeholder = input('');
  appearance = input<Appearance>('fill');
  color = input<ThemePalette>('primary');
  interval = input<string | number>('30m');
  min = input<Date | null>(null);
  max = input<Date | null>(null);
  disabled = input(false);
  readonly = input(false);
  required = input(false);
}