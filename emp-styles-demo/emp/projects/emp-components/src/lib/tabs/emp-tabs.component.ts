import { Component, input, output } from '@angular/core';

export interface EmpTab {
  label: string;
  value: string;
}

@Component({
  selector: 'emp-tabs',
  standalone: true,
  template: `
    <div class="emp-tabs" role="tablist">
      @for (tab of tabs(); track tab.value) {
        <button
          type="button"
          role="tab"
          class="emp-tabs__item"
          [class.emp-tabs__item--active]="tab.value === active()"
          [attr.aria-selected]="tab.value === active()"
          (click)="activeChange.emit(tab.value)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
  `,
  styleUrls: ['./emp-tabs.component.less'],
})
export class EmpTabsComponent {
  readonly tabs = input<EmpTab[]>([]);
  readonly active = input('');
  readonly activeChange = output<string>();
}
