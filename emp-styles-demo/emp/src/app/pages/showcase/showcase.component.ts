import { NgComponentOutlet } from '@angular/common';
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
import { GENERATED_SHOWCASE_ENTRIES } from './custom-showcase.generated';

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
    NgComponentOutlet,
  ],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.less'],
})
export class ShowcaseComponent {
  protected readonly autoComponents = GENERATED_SHOWCASE_ENTRIES;

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
}
