import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-empty',
  standalone: true,
  template: `
    <div class="emp-empty">
      <div class="emp-empty__icon">{{ icon() }}</div>
      @if (title()) {
        <div class="emp-empty__title">{{ title() }}</div>
      }
      @if (description()) {
        <div class="emp-empty__text">{{ description() }}</div>
      }
      <div class="emp-empty__extra">
        <ng-content />
      </div>
    </div>
  `,
  styleUrls: ['./emp-empty.component.less'],
})
export class EmpEmptyComponent {
  readonly icon = input('∅');
  readonly title = input('');
  readonly description = input('');
}
