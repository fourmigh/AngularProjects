import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-custom-stat-card',
  standalone: true,
  template: `
    <div class="emp-custom-stat-card">
      <div class="emp-custom-stat-card__label">{{ label() }}</div>
      <div class="emp-custom-stat-card__value">{{ value() }}</div>
      <div
        class="emp-custom-stat-card__delta"
        [class]="'emp-custom-stat-card__delta--' + trend()"
      >
        {{ delta() }}
      </div>
    </div>
  `,
  styleUrls: ['./emp-custom-stat-card.component.less'],
})
export class EmpCustomStatCardComponent {
  readonly label = input('');
  readonly value = input('');
  readonly delta = input('');
  readonly trend = input<'up' | 'down' | 'flat'>('flat');
}
