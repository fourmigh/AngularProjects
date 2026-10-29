import { Component, input } from '@angular/core';

@Component({
  selector: 'bt-stat-card',
  standalone: true,
  template: `
    <div class="bt-stat-card">
      <div class="bt-stat-card__label">{{ label() }}</div>
      <div class="bt-stat-card__value">{{ value() }}</div>
      <div class="bt-stat-card__delta" [class]="'bt-stat-card__delta--' + trend()">
        {{ delta() }}
      </div>
    </div>
  `,
  styleUrls: ['./bt-stat-card.component.less'],
})
export class BtStatCardComponent {
  readonly label = input('');
  readonly value = input('');
  readonly delta = input('');
  readonly trend = input<'up' | 'down' | 'flat'>('flat');
}
