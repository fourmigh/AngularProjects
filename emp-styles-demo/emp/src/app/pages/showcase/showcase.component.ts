import { Component, signal } from '@angular/core';
import {
  EmpAlertComponent,
  EmpBadgeComponent,
  EmpButtonComponent,
  EmpCardComponent,
  EmpCheckComponent,
  EmpDialogComponent,
  EmpEmptyComponent,
  EmpInputComponent,
  EmpPaginationComponent,
  EmpSelectComponent,
  EmpTableComponent,
  EmpTabsComponent,
  EmpToolbarComponent,
  type EmpSelectOption,
  type EmpTab,
} from 'emp-components';
import {
  EmpCustomRecordListComponent,
  type EmpCustomRecordItem,
} from '../../components/emp-custom-record-list.component';
import { EmpCustomStatCardComponent } from '../../components/emp-custom-stat-card.component';
import { EmpCustomWorkbenchComponent } from '../../components/emp-custom-workbench.component';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [
    EmpToolbarComponent,
    EmpBadgeComponent,
    EmpButtonComponent,
    EmpCardComponent,
    EmpInputComponent,
    EmpSelectComponent,
    EmpCheckComponent,
    EmpTabsComponent,
    EmpTableComponent,
    EmpAlertComponent,
    EmpDialogComponent,
    EmpPaginationComponent,
    EmpEmptyComponent,
    EmpCustomWorkbenchComponent,
    EmpCustomStatCardComponent,
    EmpCustomRecordListComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.less'],
})
export class ShowcaseComponent {
  protected readonly projectName = signal('EMP 项目');
  protected readonly owner = signal('alice');
  protected readonly notify = signal(true);
  protected readonly autoSync = signal(false);
  protected readonly tab = signal('overview');
  protected readonly page = signal(1);
  protected readonly dialogOpen = signal(false);

  protected readonly owners: EmpSelectOption[] = [
    { label: 'Alice', value: 'alice' },
    { label: 'Bob', value: 'bob' },
    { label: 'Carol', value: 'carol' },
  ];

  protected readonly tabs: EmpTab[] = [
    { label: '概览', value: 'overview' },
    { label: '工单', value: 'orders' },
    { label: '设置', value: 'settings' },
  ];

  protected readonly columns = ['名称', '负责人', '状态'];
  protected readonly rows = [
    ['工单同步', 'Alice', '运行中'],
    ['数据导出', 'Bob', '已完成'],
    ['权限校验', 'Carol', '待处理'],
  ];

  protected readonly records: EmpCustomRecordItem[] = [
    { title: '任务 EMP-201', meta: '数据同步 · 10 分钟前', status: '执行中' },
    { title: '任务 EMP-198', meta: '权限校验 · 32 分钟前', status: '已完成' },
    { title: '任务 EMP-195', meta: '报表导出 · 1 小时前', status: '待开始' },
  ];
}
