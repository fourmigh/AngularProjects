import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone';

@Component({
  selector: 'app-datetime-plus',
  standalone: true,
  imports: [IonDatetime],
  templateUrl: './datetime-plus.component.html',
})
export class DatetimePlusComponent implements OnChanges {
  @Input() value: string | string[] | null | undefined;
  @Output() valueChange = new EventEmitter<string | string[] | null | undefined>();

  @Input() presentation = 'date-time';
  @Input() multiple = false;
  @Input() min = '';
  @Input() max = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() preferWheel = false;
  @Input() hourCycle?: string;
  @Input() showDefaultButtons = false;
  @Input() showClearButton = false;
  @Input() showDefaultTimeLabel = true;
  @Input() size = 'cover';
  @Input() firstDayOfWeek?: number;
  @Input() locale = 'en-US';
  @Input() color = 'primary';

  private previousWeekValue: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      const v = changes['value'].currentValue;
      if (!v || (Array.isArray(v) && v.length === 0)) {
        this.previousWeekValue = [];
      }
    }
  }

  onDatetimeChange(event: CustomEvent) {
    const rawValue = event.detail.value;

    if (this.presentation !== 'week') {
      this.value = rawValue;
      this.valueChange.emit(rawValue);
      this.previousWeekValue = [];
      return;
    }

    if (!rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) {
      this.value = undefined;
      this.valueChange.emit(undefined);
      this.previousWeekValue = [];
      return;
    }

    const arr = (Array.isArray(rawValue) ? rawValue : [rawValue]) as string[];

    if (this.previousWeekValue.length > 0) {
      const prevSet = new Set(this.previousWeekValue);
      const removed = this.previousWeekValue.filter(v => !arr.includes(v));

      if (removed.length > 0) {
        this.previousWeekValue = [];
        setTimeout(() => {
          this.value = [];
          this.valueChange.emit([]);
        });
        return;
      }

      const clicked = arr.find(v => !prevSet.has(v));
      if (clicked) {
        const weekDates = this.getWeekDates(clicked);
        this.value = weekDates;
        this.valueChange.emit(weekDates);
        this.previousWeekValue = weekDates;
      }
      return;
    }

    const weekDates = this.getWeekDates(arr[0]);
    this.value = weekDates;
    this.valueChange.emit(weekDates);
    this.previousWeekValue = weekDates;
  }

  getWeekDates(picked: string): string[] {
    const d = new Date(picked);
    const day = d.getDay();
    const firstDay = this.firstDayOfWeek ?? 0;
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
    this.value = undefined;
    this.valueChange.emit(undefined);
    this.previousWeekValue = [];
  }
}
