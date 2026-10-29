import { Component, input } from '@angular/core';

export type EmpAlertTone = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'emp-alert',
  standalone: true,
  template: `
    <div class="emp-alert" [class]="'emp-alert--' + tone()">
      <div class="emp-alert__body">
        @if (title()) {
          <div class="emp-alert__title">{{ title() }}</div>
        }
        <div class="emp-alert__text"><ng-content /></div>
      </div>
    </div>
  `,
  styleUrls: ['./emp-alert.component.less'],
})
export class EmpAlertComponent {
  readonly title = input('');
  readonly tone = input<EmpAlertTone>('info');
}
