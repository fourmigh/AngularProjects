import { Component, input } from '@angular/core';

@Component({
  selector: 'bt-device-card',
  standalone: true,
  template: `
    <div class="bt-device-card">
      <div class="bt-device-card__header">
        <div class="bt-device-card__title">{{ name() }}</div>
        <span class="bt-device-card__status">{{ status() }}</span>
      </div>
      <div class="bt-device-card__meta">{{ code() }} · {{ location() }}</div>
      <div class="bt-device-card__battery">
        <span class="bt-device-card__battery-label">电量</span>
        <span class="bt-device-card__battery-value">{{ battery() }}%</span>
        <span class="bt-device-card__battery-track">
          <span
            class="bt-device-card__battery-fill"
            [style.width.%]="battery()"
          ></span>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./bt-device-card.component.less'],
})
export class BtDeviceCardComponent {
  readonly name = input('');
  readonly code = input('');
  readonly status = input('');
  readonly battery = input(0);
  readonly location = input('');
}
