import { Component, model, input, computed, signal, viewChildren, ElementRef, AfterViewInit, effect } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Presentation, Platform, PickerDate,
  generateMinutes, generateHours, parsePickerValue, formatPickerValue,
  to12Hour, from12Hour, nearestMinute,
  getCalendarDays, getMonthNames, getDayNames, getDaysInMonth,
  isToday, isInRange, getWeekRange,
} from './native-time-picker.constants';

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

@Component({
  selector: 'app-native-time-picker',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: './native-time-picker.component.html',
  styleUrl: './native-time-picker.component.scss',
})
export class NativeTimePickerComponent implements AfterViewInit {
  // ---- Inputs ----
  value = model<string | string[] | null | undefined>();
  presentation = input<Presentation>('date-time');
  platform = input<Platform>('ios');
  minuteInterval = input<number>(1);
  hourCycle = input<'h12' | 'h24'>('h24');
  disabled = input(false);
  color = input<string>('primary');
  locale = input<string>('en-US');
  min = input<string | undefined>(undefined);
  max = input<string | undefined>(undefined);
  multiple = input(false);
  firstDayOfWeek = input<number>(0);
  showClearButton = input(false);
  showDefaultButtons = input(false);

  // ---- Visual constants ----
  readonly ITEM_HEIGHT = ITEM_HEIGHT;
  readonly VISIBLE_ITEMS = VISIBLE_ITEMS;

  // ---- Derived state ----
  hours = computed(() => generateHours(this.hourCycle()));
  minutes = computed(() => generateMinutes(this.minuteInterval()));
  monthNames = computed(() => getMonthNames(this.locale()));
  dayNames = computed(() => getDayNames(this.locale(), this.firstDayOfWeek()));
  calendarDays = computed(() => getCalendarDays(this.viewYear(), this.viewMonth(), this.firstDayOfWeek()));

  hasTime = computed(() => ['time', 'date-time', 'time-date'].includes(this.presentation()));
  hasDate = computed(() => ['date', 'date-time', 'time-date', 'week'].includes(this.presentation()));
  hasCalendar = computed(() => this.hasDate() || this.presentation() === 'week');
  hasMonth = computed(() => ['month', 'month-year'].includes(this.presentation()));
  hasYear = computed(() => ['year', 'month-year'].includes(this.presentation()));

  isDateTime = computed(() => this.presentation() === 'date-time');
  isTimeDate = computed(() => this.presentation() === 'time-date');
  isWeek = computed(() => this.presentation() === 'week');

  showDateFirst = computed(() => this.isDateTime() || this.presentation() === 'date');

  columnHeight = computed(() => {
    const maxItems = Math.max(this.hours().length, this.minutes().length, 2);
    return maxItems * ITEM_HEIGHT;
  });

  selectedDates = signal<Set<string>>(new Set());
  weekDates = signal<string[]>([]);

  // ---- Selection state ----
  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth());
  selectedDay = signal<number>(new Date().getDate());
  selectedHour = signal<number>(12);
  selectedMinute = signal<number>(0);
  selectedPeriod = signal<'AM' | 'PM'>('AM');
  selectedYearList = signal<number>(new Date().getFullYear());

  // ---- View state (for calendar navigation) ----
  viewYear = signal<number>(new Date().getFullYear());
  viewMonth = signal<number>(new Date().getMonth());

  // ---- Wheel refs ----
  private hourColumns = viewChildren<ElementRef<HTMLElement>>('hourCol');
  private minuteColumns = viewChildren<ElementRef<HTMLElement>>('minuteCol');
  private ampmColumns = viewChildren<ElementRef<HTMLElement>>('ampmCol');
  private yearColumns = viewChildren<ElementRef<HTMLElement>>('yearCol');

  constructor() {
    this.initFromValue();

    effect(() => {
      const p = this.presentation();
      if (this.hasCalendar() || this.hasMonth()) {
        this.viewYear.set(this.selectedYear());
        this.viewMonth.set(this.selectedMonth());
      }
    });
  }

  private initFromValue() {
    const raw = this.value();
    if (Array.isArray(raw)) {
      const parsed = parsePickerValue(raw[0], this.presentation());
      this.applyPickerDate(parsed);
    } else {
      const parsed = parsePickerValue(raw, this.presentation());
      this.applyPickerDate(parsed);
    }
  }

  private applyPickerDate(d: PickerDate) {
    this.selectedYear.set(d.year);
    this.selectedMonth.set(d.month);
    this.selectedDay.set(d.day);
    this.selectedYearList.set(d.year);

    const interval = this.minuteInterval();
    const roundedMinute = nearestMinute(d.minute, interval);
    this.selectedMinute.set(roundedMinute);

    if (this.hourCycle() === 'h12') {
      const { hour12, period } = to12Hour(d.hour);
      this.selectedHour.set(hour12);
      this.selectedPeriod.set(period);
    } else {
      this.selectedHour.set(d.hour);
    }
  }

  ngAfterViewInit(): void {
    this.syncScrollToValue();
  }

  // ===================== Calendar =====================

  getDayClass(day: number, isCurrentMonth: boolean): Record<string, boolean> {
    const d = this.selectedDay();
    const m = this.selectedMonth();
    const y = this.selectedYear();
    const vm = this.viewMonth();
    const vy = this.viewYear();
    const selected = isCurrentMonth && day === d && m === vm && y === vy;
    const today = isCurrentMonth && isToday(vy, vm, day);
    const disabled = !isInRange(vy, vm, day, this.min(), this.max());
    const inWeek = this.isWeek() && this.weekDates().some(wd => {
      const parts = wd.split('-');
      return parseInt(parts[0]) === vy && parseInt(parts[1]) - 1 === vm && parseInt(parts[2]) === day;
    });
    return {
      'is-selected': selected,
      'is-today': today,
      'is-disabled': disabled,
      'is-other-month': !isCurrentMonth,
      'in-week': !!inWeek,
    };
  }

  onDayClick(day: number, isCurrentMonth: boolean) {
    if (!isCurrentMonth) {
      if (day > 15) {
        this.goToPrevMonth();
      } else {
        this.goToNextMonth();
      }
      return;
    }
    const vy = this.viewYear();
    const vm = this.viewMonth();
    if (!isInRange(vy, vm, day, this.min(), this.max())) return;

    this.selectedYear.set(vy);
    this.selectedMonth.set(vm);
    this.selectedDay.set(day);

    if (this.isWeek()) {
      const week = getWeekRange(vy, vm, day);
      this.weekDates.set(week.map(w => `${w.year}-${String(w.month + 1).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`));
      this.selectedYear.set(week[0].year);
      this.selectedMonth.set(week[0].month);
      this.selectedDay.set(week[0].day);
    }

    if (this.multiple()) {
      const key = `${vy}-${String(vm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const set = new Set(this.selectedDates());
      if (set.has(key)) set.delete(key); else set.add(key);
      this.selectedDates.set(set);
    }

    this.emitValue();
  }

  goToPrevMonth() {
    const m = this.viewMonth() - 1;
    if (m < 0) {
      this.viewYear.set(this.viewYear() - 1);
      this.viewMonth.set(11);
    } else {
      this.viewMonth.set(m);
    }
  }

  goToNextMonth() {
    const m = this.viewMonth() + 1;
    if (m > 11) {
      this.viewYear.set(this.viewYear() + 1);
      this.viewMonth.set(0);
    } else {
      this.viewMonth.set(m);
    }
  }

  // ===================== Month grid =====================

  onMonthClick(month: number) {
    this.selectedMonth.set(month);
    this.selectedYear.set(this.viewYear());
    if (this.presentation() === 'month-year') {
      this.viewMonth.set(month);
    }
    this.emitValue();
  }

  goToPrevYear() {
    this.viewYear.set(this.viewYear() - 1);
    if (!this.hasMonth()) {
      this.selectedYear.set(this.viewYear());
      this.emitValue();
    }
  }

  goToNextYear() {
    this.viewYear.set(this.viewYear() + 1);
    if (!this.hasMonth()) {
      this.selectedYear.set(this.viewYear());
      this.emitValue();
    }
  }

  // ===================== Year wheel =====================

  yearRange = computed(() => {
    const vy = this.viewYear();
    const years: number[] = [];
    for (let y = vy - 60; y <= vy + 60; y++) years.push(y);
    return years;
  });

  onYearScroll(container: HTMLElement) {
    const idx = Math.round(container.scrollTop / ITEM_HEIGHT);
    const y = this.yearRange()[idx];
    if (y !== undefined) {
      this.selectedYearList.set(y);
      this.viewYear.set(y);
      this.selectedYear.set(y);
      this.emitValue();
    }
  }

  onYearTap(container: HTMLElement, event: MouseEvent | TouchEvent) {
    const rect = container.getBoundingClientRect();
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
    const offsetY = clientY - rect.top;
    const centerY = rect.height / 2;
    const idxOffset = Math.round((offsetY - centerY) / ITEM_HEIGHT);
    const currentIdx = Math.round(container.scrollTop / ITEM_HEIGHT);
    const targetIdx = Math.max(0, currentIdx + idxOffset);
    container.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: 'smooth' });
  }

  // ===================== Time wheels =====================

  onHourScroll(container: HTMLElement) {
    const idx = Math.round(container.scrollTop / ITEM_HEIGHT);
    const h = this.hours()[idx];
    if (h !== undefined) {
      this.selectedHour.set(h);
      this.emitValue();
    }
  }

  onMinuteScroll(container: HTMLElement) {
    const idx = Math.round(container.scrollTop / ITEM_HEIGHT);
    const m = this.minutes()[idx];
    if (m !== undefined) {
      this.selectedMinute.set(m);
      this.emitValue();
    }
  }

  onAmPmScroll(container: HTMLElement) {
    const idx = Math.round(container.scrollTop / ITEM_HEIGHT);
    this.selectedPeriod.set(idx === 0 ? 'AM' : 'PM');
    this.emitValue();
  }

  onWheelTap(container: HTMLElement, event: MouseEvent | TouchEvent) {
    const rect = container.getBoundingClientRect();
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
    const offsetY = clientY - rect.top;
    const centerY = rect.height / 2;
    const idxOffset = Math.round((offsetY - centerY) / ITEM_HEIGHT);
    const currentIdx = Math.round(container.scrollTop / ITEM_HEIGHT);
    const totalItems = Math.round(this.columnHeight() / ITEM_HEIGHT);
    const targetIdx = Math.max(0, Math.min(currentIdx + idxOffset, totalItems - 1));
    container.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: 'smooth' });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ===================== Value emission =====================

  private emitValue() {
    let hour24: number;
    if (this.hourCycle() === 'h12') {
      hour24 = from12Hour(this.selectedHour(), this.selectedPeriod());
    } else {
      hour24 = this.selectedHour();
    }

    if (this.multiple()) {
      this.value.set(Array.from(this.selectedDates()));
      return;
    }

    if (this.isWeek()) {
      const w = this.weekDates();
      if (w.length > 0) {
        this.value.set(w);
      }
      return;
    }

    const date: PickerDate = {
      year: this.selectedYear(),
      month: this.selectedMonth(),
      day: this.selectedDay(),
      hour: hour24,
      minute: this.selectedMinute(),
    };
    this.value.set(formatPickerValue(date, this.presentation()));
  }

  private syncScrollToValue() {
    requestAnimationFrame(() => {
      if (this.hasTime()) {
        if (this.hourCycle() === 'h12') {
          const hIdx = this.hours().indexOf(this.selectedHour());
          this.scrollWheelToIndex('hour', hIdx >= 0 ? hIdx : 0);
          const pIdx = this.selectedPeriod() === 'AM' ? 0 : 1;
          this.scrollWheelToIndex('ampm', pIdx);
        } else {
          const hIdx = this.hours().indexOf(this.selectedHour());
          this.scrollWheelToIndex('hour', hIdx >= 0 ? hIdx : 0);
        }
        const mIdx = this.minutes().indexOf(this.selectedMinute());
        this.scrollWheelToIndex('minute', mIdx >= 0 ? mIdx : 0);
      }
      if (this.hasYear()) {
        const yIdx = this.yearRange().indexOf(this.selectedYear());
        this.scrollWheelToIndex('year', yIdx >= 0 ? yIdx : 60);
      }
    });
  }

  private scrollWheelToIndex(column: 'hour' | 'minute' | 'ampm' | 'year', index: number) {
    const map: Record<string, () => ElementRef<HTMLElement> | undefined> = {
      hour: () => this.hourColumns()?.[0],
      minute: () => this.minuteColumns()?.[0],
      ampm: () => this.ampmColumns()?.[0],
      year: () => this.yearColumns()?.[0],
    };
    const el = map[column]();
    if (!el) return;
    el.nativeElement.scrollTop = index * ITEM_HEIGHT;
  }

  // ===================== Template helpers =====================

  isValueArray(val: string | string[] | null | undefined): val is string[] {
    return Array.isArray(val);
  }

  formatDisplayValue(val: string | string[] | null | undefined): string {
    if (!val) return '';
    return Array.isArray(val) ? val.join(', ') : val;
  }

  isDayInRange(year: number, month: number, day: number): boolean {
    return isInRange(year, month, day, this.min(), this.max());
  }

  // ===================== Actions =====================

  clearValue() {
    this.value.set(undefined);
    this.selectedDates.set(new Set());
    this.weekDates.set([]);
  }
}