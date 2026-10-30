import { Component } from '@angular/core';
import {
  EmpCustomRecordListComponent,
  type EmpCustomRecordItem,
} from './emp-custom-record-list.component';
import { EmpCustomStatCardComponent } from './emp-custom-stat-card.component';
import { EmpCustomWorkbenchComponent } from './emp-custom-workbench.component';

@Component({
  selector: 'emp-custom-workbench-demo',
  standalone: true,
  imports: [
    EmpCustomWorkbenchComponent,
    EmpCustomStatCardComponent,
    EmpCustomRecordListComponent,
  ],
  template: `
    <emp-custom-workbench>
      <span workbenchActions class="emp-custom-workbench-demo__action">
        同步中
      </span>

      <div class="emp-custom-workbench-demo__stats">
        <emp-custom-stat-card
          label="本月任务"
          value="286"
          delta="+9.2%"
          trend="up"
        />
        <emp-custom-stat-card
          label="平均耗时"
          value="3.1h"
          delta="-4.5%"
          trend="down"
        />
        <emp-custom-stat-card
          label="在线成员"
          value="42"
          delta="持平"
          trend="flat"
        />
      </div>

      <div class="emp-custom-workbench-demo__records">
        <emp-custom-record-list [items]="records" />
      </div>
    </emp-custom-workbench>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .emp-custom-workbench-demo__action {
        font-size: var(--emp-font-size-sm, 13px);
        opacity: 0.8;
      }

      .emp-custom-workbench-demo__stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .emp-custom-workbench-demo__records {
        margin-top: 16px;
      }
    `,
  ],
})
export class EmpCustomWorkbenchDemoComponent {
  protected readonly records: EmpCustomRecordItem[] = [
    { title: '任务 EMP-201', meta: '数据同步 · 10 分钟前', status: '执行中' },
    { title: '任务 EMP-198', meta: '权限校验 · 32 分钟前', status: '已完成' },
    { title: '任务 EMP-195', meta: '报表导出 · 1 小时前', status: '待开始' },
  ];
}
