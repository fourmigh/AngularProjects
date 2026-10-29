import { Component, input } from '@angular/core';

export type EmpButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'emp-button',
  standalone: true,
  template: `
    <button
      class="emp-button"
      [class]="'emp-button--' + variant()"
      [type]="type()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
  styleUrls: ['./emp-button.component.less'],
})
export class EmpButtonComponent {
  readonly variant = input<EmpButtonVariant>('primary');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}
