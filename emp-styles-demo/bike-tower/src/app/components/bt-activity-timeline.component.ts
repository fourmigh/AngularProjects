import { Component, input } from '@angular/core';

export interface BtActivityItem {
  title: string;
  meta: string;
  active?: boolean;
}

@Component({
  selector: 'bt-activity-timeline',
  standalone: true,
  template: `
    <div class="bt-activity-timeline">
      <div class="bt-activity-timeline__title">{{ title() }}</div>
      <ul class="bt-activity-timeline__list">
        @for (item of items(); track item.title) {
          <li class="bt-activity-timeline__item">
            <span
              class="bt-activity-timeline__dot"
              [class.is-active]="item.active"
            ></span>
            <div class="bt-activity-timeline__body">
              <div class="bt-activity-timeline__item-title">
                {{ item.title }}
              </div>
              <div class="bt-activity-timeline__meta">{{ item.meta }}</div>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrls: ['./bt-activity-timeline.component.less'],
})
export class BtActivityTimelineComponent {
  readonly title = input('');
  readonly items = input<BtActivityItem[]>([]);
}
