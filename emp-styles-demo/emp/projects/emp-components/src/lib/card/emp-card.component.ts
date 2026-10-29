import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-card',
  standalone: true,
  template: `
    <div class="emp-card" [class.emp-card--interactive]="interactive()">
      @if (title()) {
        <div class="emp-card__title">{{ title() }}</div>
      }
      <div class="emp-card__body">
        <ng-content />
      </div>
    </div>
  `,
  styleUrls: ['./emp-card.component.less'],
})
export class EmpCardComponent {
  readonly title = input('');
  readonly interactive = input(false);
}
