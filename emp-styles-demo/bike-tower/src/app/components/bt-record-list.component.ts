import { Component, input } from '@angular/core';

export interface BtRecordItem {
  title: string;
  meta: string;
  status: string;
}

@Component({
  selector: 'bt-record-list',
  standalone: true,
  template: `
    <div class="bt-record-list">
      @for (item of items(); track item.title) {
        <div class="bt-record-list__row">
          <div class="bt-record-list__main">
            <div class="bt-record-list__title">{{ item.title }}</div>
            <div class="bt-record-list__meta">{{ item.meta }}</div>
          </div>
          <span class="bt-record-list__status">{{ item.status }}</span>
        </div>
      }
    </div>
  `,
  styleUrls: ['./bt-record-list.component.less'],
})
export class BtRecordListComponent {
  readonly items = input<BtRecordItem[]>([]);
}
