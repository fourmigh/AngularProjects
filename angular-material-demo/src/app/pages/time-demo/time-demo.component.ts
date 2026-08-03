import { Component, signal, computed, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatOptionModule } from '@angular/material/core';
import { TimePlusComponent } from '../../components/time-plus/time-plus.component';
import {
  Appearance, APPEARANCES, COLORS, INTERVAL_PRESETS, LOCALES,
} from '../../components/time-plus/time-plus.constants';

@Component({
  selector: 'app-time-demo',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [
    FormsModule,
    MatToolbarModule, MatCardModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatInputModule, MatFormFieldModule, MatSlideToggleModule,
    MatChipsModule, MatDividerModule, MatSliderModule, MatOptionModule,
    TimePlusComponent,
  ],
  templateUrl: './time-demo.component.html',
  styleUrl: './time-demo.component.scss',
})
export class TimeDemoComponent {
  isLandscape = signal(window.innerWidth > window.innerHeight);

  @HostListener('window:resize')
  onResize() {
    this.isLandscape.set(window.innerWidth > window.innerHeight);
  }

  // Time component inputs
  value = signal<Date | null>(null);
  label = signal('Select time');
  placeholder = signal('HH:mm');
  appearance = signal<Appearance>('fill');
  color = signal<'primary' | 'accent' | 'warn'>('primary');
  interval = signal<string | number>('30m');
  min = signal<Date | null>(null);
  max = signal<Date | null>(null);
  disabled = signal(false);
  readonly = signal(false);
  required = signal(false);

  // Min/Max string inputs for user editing
  minStr = signal('');
  maxStr = signal('');

  APPEARANCES = APPEARANCES;
  COLORS = COLORS;
  INTERVAL_PRESETS = INTERVAL_PRESETS;
  LOCALES = LOCALES;

  get formattedValue(): string {
    const v = this.value();
    if (!v) return '';
    return v.toLocaleTimeString(this.locale(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  locale = signal('en-US');

  onClear() {
    this.value.set(null);
  }

  onMinChange(value: string) {
    this.minStr.set(value);
    if (value) {
      const [h, m] = value.split(':');
      const d = new Date();
      d.setHours(+h, +m, 0, 0);
      this.min.set(d);
    } else {
      this.min.set(null);
    }
  }

  onMaxChange(value: string) {
    this.maxStr.set(value);
    if (value) {
      const [h, m] = value.split(':');
      const d = new Date();
      d.setHours(+h, +m, 0, 0);
      this.max.set(d);
    } else {
      this.max.set(null);
    }
  }

  nowStr = signal('');
  onNowChange(value: string) {
    this.nowStr.set(value);
    if (value) {
      const [h, m] = value.split(':');
      const d = new Date();
      d.setHours(+h, +m, 0, 0);
      this.value.set(d);
    } else {
      this.value.set(null);
    }
  }
}