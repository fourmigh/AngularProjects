import { Component, input } from '@angular/core';

export type EmpBadgeTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

@Component({
  selector: 'emp-badge',
  standalone: true,
  template: `<span class="emp-badge" [class]="'emp-badge--' + tone()"><ng-content /></span>`,
  styleUrls: ['./emp-badge.component.less'],
})
export class EmpBadgeComponent {
  readonly tone = input<EmpBadgeTone>('default');
}
