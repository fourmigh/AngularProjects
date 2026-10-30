import { Component, input } from '@angular/core';

export interface EmpCustomRecordItem {
  title: string;
  meta: string;
  status: string;
}

@Component({
  selector: 'emp-custom-record-list',
  standalone: true,
  template: `
    <div class="emp-custom-record-list">
      @for (item of items(); track item.title) {
        <div class="emp-custom-record-list__row">
          <div class="emp-custom-record-list__main">
            <div class="emp-custom-record-list__title">{{ item.title }}</div>
            <div class="emp-custom-record-list__meta">{{ item.meta }}</div>
          </div>
          <span class="emp-custom-record-list__status">{{ item.status }}</span>
        </div>
      }
    </div>
  `,
  styleUrls: ['./emp-custom-record-list.component.less'],
})
export class EmpCustomRecordListComponent {
  readonly items = input<EmpCustomRecordItem[]>([]);
}
