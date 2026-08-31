import { Component, model, input, effect } from '@angular/core';
import type { DatetimePresentation, DatetimeHourCycle, Color } from '@ionic/core/components';
import { IonDatetime } from '@ionic/angular';

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

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
  consecutive = input(false);
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

  private previousSelected: string[] = [];

  constructor() {
    effect(() => {
      const v = this.value();
      if (!v || (Array.isArray(v) && v.length === 0)) {
        this.previousSelected = [];
      }
    });
  }

  onDatetimeChange(event: CustomEvent) {
    const rawValue = event.detail.value;

    if (this.presentation() !== 'week') {
      this.handleDateChange(rawValue);
      return;
    }

    this.handleWeekChange(rawValue);
  }

  private handleDateChange(rawValue: string | string[] | null) {
    if (this.multiple() && this.consecutive()) {
      const arr = (Array.isArray(rawValue) ? rawValue : [rawValue]) as string[];
      const prev = this.previousSelected;

      if (prev.length === 0) {
        const sorted = [...arr].sort();
        const range = this.getContiguousRange(sorted[0], sorted[sorted.length - 1]);
        this.value.set(range);
        this.previousSelected = range;
        return;
      }

      const prevSet = new Set(prev);
      const prevMin = prev[0], prevMax = prev[prev.length - 1];
      const newDate = arr.find(v => !prevSet.has(v));
      const removedDate = prev.find(v => !arr.includes(v));

      if (newDate) {
        if (newDate < prevMin) {
          if (this.areDatesAdjacent(newDate, prevMin)) {
            const range = this.getContiguousRange(newDate, prevMax);
            this.value.set(range);
            this.previousSelected = range;
            return;
          }
          this.value.set([...prev]);
          return;
        }

        if (newDate > prevMax) {
          if (this.areDatesAdjacent(newDate, prevMax)) {
            const range = this.getContiguousRange(prevMin, newDate);
            this.value.set(range);
            this.previousSelected = range;
            return;
          }
          this.value.set([...prev]);
          return;
        }

        this.value.set([...prev]);
        return;
      }

      if (removedDate) {
        if (removedDate === prevMin) {
          const secondDate = prev[1];
          if (secondDate) {
            const range = this.getContiguousRange(secondDate, prevMax);
            this.value.set(range);
            this.previousSelected = range;
          } else {
            this.value.set(undefined);
            this.previousSelected = [];
          }
          return;
        }

        if (removedDate === prevMax) {
          const secondToLast = prev[prev.length - 2];
          if (secondToLast) {
            const range = this.getContiguousRange(prevMin, secondToLast);
            this.value.set(range);
            this.previousSelected = range;
          } else {
            this.value.set(undefined);
            this.previousSelected = [];
          }
          return;
        }

        this.value.set([...prev]);
        return;
      }

      this.value.set([...prev]);
      return;
    }

    this.value.set(rawValue);
    this.previousSelected = [];
  }

  private handleWeekChange(rawValue: string | string[] | null) {
    if (!rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) {
      this.value.set(undefined);
      this.previousSelected = [];
      return;
    }

    const arr = (Array.isArray(rawValue) ? rawValue : [rawValue]) as string[];

    if (this.previousSelected.length > 0) {
      const prevSet = new Set(this.previousSelected);
      const clicked = arr.find(v => !prevSet.has(v));

      if (!clicked) {
        const removedDate = this.previousSelected.find(v => !arr.includes(v));
        if (removedDate) {
          const weekDates = this.getWeekDates(removedDate);
          const atStart = weekDates.includes(this.previousSelected[0]);
          const atEnd = weekDates.includes(this.previousSelected[this.previousSelected.length - 1]);
          if (!this.consecutive() || atStart || atEnd) {
            const remaining = this.previousSelected.filter(d => !weekDates.includes(d));
            if (remaining.length === 0) {
              this.value.set([]);
              this.previousSelected = [];
            } else {
              this.value.set(remaining);
              this.previousSelected = remaining;
            }
            return;
          }
        }
        this.value.set([...this.previousSelected]);
        return;
      }

      const weekDates = this.getWeekDates(clicked);

      if (!this.multiple()) {
        this.value.set(weekDates);
        this.previousSelected = weekDates;
        return;
      }

      if (this.consecutive()) {
        const firstWeekStart = this.previousSelected[0];
        const lastWeekEnd = this.previousSelected[this.previousSelected.length - 1];
        const firstWeekDates = this.getWeekDates(firstWeekStart);
        const lastWeekDates = this.getWeekDates(lastWeekEnd);

        const isAtStart = this.areWeeksAdjacent(weekDates, firstWeekDates)
          && weekDates[weekDates.length - 1] < firstWeekDates[0];
        const isAtEnd = this.areWeeksAdjacent(weekDates, lastWeekDates)
          && weekDates[0] > lastWeekDates[lastWeekDates.length - 1];

        if (isAtStart) {
          const merged = [...new Set([...weekDates, ...this.previousSelected])].sort();
          this.value.set(merged);
          this.previousSelected = merged;
          return;
        }

        if (isAtEnd) {
          const merged = [...new Set([...this.previousSelected, ...weekDates])].sort();
          this.value.set(merged);
          this.previousSelected = merged;
          return;
        }

        this.value.set([...this.previousSelected]);
        return;
      }

      const alreadySelected = weekDates.every(d => prevSet.has(d));
      if (alreadySelected) {
        const remaining = this.previousSelected.filter(d => !weekDates.includes(d));
        if (remaining.length === 0) {
          this.value.set(undefined);
          this.previousSelected = [];
        } else {
          this.value.set(remaining);
          this.previousSelected = remaining;
        }
      } else {
        const merged = [...new Set([...this.previousSelected, ...weekDates])].sort();
        this.value.set(merged);
        this.previousSelected = merged;
      }
      return;
    }

    const weekDates = this.getWeekDates(arr[0]);
    this.value.set(weekDates);
    this.previousSelected = weekDates;
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

  private areDatesAdjacent(dateA: string, dateB: string): boolean {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const diff = Math.abs(a.getTime() - b.getTime());
    return diff === 86400000;
  }

  private getContiguousRange(start: string, end: string): string[] {
    const dates: string[] = [];
    const d = new Date(start);
    const last = new Date(end);
    while (d <= last) {
      dates.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }

  private areWeeksAdjacent(weekA: string[], weekB: string[]): boolean {
    const endA = new Date(weekA[weekA.length - 1]);
    const startB = new Date(weekB[0]);
    const endB = new Date(weekB[weekB.length - 1]);
    const startA = new Date(weekA[0]);

    endA.setDate(endA.getDate() + 1);
    endB.setDate(endB.getDate() + 1);

    return endA.toISOString().split('T')[0] === startB.toISOString().split('T')[0]
        || endB.toISOString().split('T')[0] === startA.toISOString().split('T')[0];
  }

  clearValue() {
    this.value.set(undefined);
    this.previousSelected = [];
  }

  private getSelectedValues(): string[] {
    const v = this.value();
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  }

  private isTimeLikePresentation(): boolean {
    const p = this.presentation();
    return p === 'time' || p === 'date-time' || p === 'time-date';
  }

  startDate(): Date | undefined {
    const values = this.getSelectedValues();
    if (values.length === 0) return undefined;

    const first = values[0];
    if (this.isTimeLikePresentation()) {
      return new Date(first);
    }
    const d = new Date(first);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  endDate(): Date | undefined {
    const values = this.getSelectedValues();
    if (values.length === 0) return undefined;

    const last = values[values.length - 1];
    if (this.isTimeLikePresentation()) {
      return new Date(last);
    }
    const d = new Date(last);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  range(): DurationParts | null {
    const values = this.getSelectedValues();
    if (values.length === 0) return null;

    const first = values[0];
    const last = values[values.length - 1];
    if (!first || !last) return null;

    if (!this.isTimeLikePresentation()) {
      const start = new Date(first.slice(0, 10));
      const end = new Date(last.slice(0, 10));
      const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
      if (diffDays <= 0) return null;
      return { days: diffDays, hours: 0, minutes: 0, seconds: 0 };
    }

    const start = new Date(first);
    const end = new Date(last);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return null;

    const totalSeconds = Math.floor(diffMs / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }
}
