import { Component, model, input, effect } from '@angular/core';
import type { DatetimePresentation, DatetimeHourCycle, Color } from '@ionic/core/components';
import { IonDatetime } from '@ionic/angular/standalone';

@Component({
  selector: 'app-datetime-plus',
  standalone: true,
  imports: [IonDatetime],
  templateUrl: './datetime-plus.component.html',
})
export class DatetimePlusComponent {
  value = model<string | string[] | null | undefined>();

  presentation = input<DatetimePresentation | 'week'>('date-time');
  multiple = input(false);
  min = input<string | undefined>(undefined);
  max = input<string | undefined>(undefined);
  disabled = input(false);
  readonly = input(false);
  hourValues = input<number[] | string | undefined>();
  minuteValues = input<number[] | string | undefined>();
  preferWheel = input(false);
  hourCycle = input<DatetimeHourCycle | undefined>(undefined);
  showDefaultButtons = input(false);
  showClearButton = input(false);
  showDefaultTimeLabel = input(true);
  size = input<'cover' | 'fixed'>('cover');
  firstDayOfWeek = input<number | undefined>(0);
  locale = input('en-US');
  color = input<Color>('primary');

  private previousWeekValue: string[] = [];

  constructor() {
    effect(() => {
      const v = this.value();
      if (!v || (Array.isArray(v) && v.length === 0)) {
        this.previousWeekValue = [];
      }
    });
  }

  onDatetimeChange(event: CustomEvent) {
    const rawValue = event.detail.value;

    if (this.presentation() !== 'week') {
      this.value.set(rawValue);
      this.previousWeekValue = [];
      return;
    }

    if (!rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) {
      this.value.set(undefined);
      this.previousWeekValue = [];
      return;
    }

    const arr = (Array.isArray(rawValue) ? rawValue : [rawValue]) as string[];

    if (this.previousWeekValue.length > 0) {
      const prevSet = new Set(this.previousWeekValue);
      const removed = this.previousWeekValue.filter(v => !arr.includes(v));

      if (removed.length > 0) {
        this.previousWeekValue = [];
        setTimeout(() => this.value.set([]));
        return;
      }

      const clicked = arr.find(v => !prevSet.has(v));
      if (clicked) {
        const weekDates = this.getWeekDates(clicked);
        this.value.set(weekDates);
        this.previousWeekValue = weekDates;
      }
      return;
    }

    const weekDates = this.getWeekDates(arr[0]);
    this.value.set(weekDates);
    this.previousWeekValue = weekDates;
  }

  getWeekDates(picked: string): string[] {
    const d = new Date(picked);
    const day = d.getDay();
    const firstDay = this.firstDayOfWeek() ?? 0;
    const diffToFirst = (day - firstDay + 7) % 7;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - diffToFirst);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  clearValue() {
    this.value.set(undefined);
    this.previousWeekValue = [];
  }
}
