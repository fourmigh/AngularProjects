import { Component, input, signal } from '@angular/core';
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
} from '@tikmac/emp-components';
import { BtRecordListComponent, type BtRecordItem } from '../../components/bt-record-list.component';
import { BtStatCardComponent } from '../../components/bt-stat-card.component';
import { BtWorkbenchComponent } from '../../components/bt-workbench.component';

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
    BtWorkbenchComponent,
    BtStatCardComponent,
    BtRecordListComponent,
  ],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.less'],
})
export class ShowcaseComponent {
  readonly embedded = input(false);

  protected readonly projectName = signal('Bike Tower 项目');
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
    { label: '设备', value: 'devices' },
    { label: '设置', value: 'settings' },
  ];

  protected readonly columns = ['工单号', '设备', '负责人', '状态'];
  protected readonly rows = [
    ['BT-1042', '共享单车 A-18', 'Alice', '处理中'],
    ['BT-1041', '共享单车 C-07', 'Bob', '已完成'],
    ['BT-1039', '调度车 D-02', 'Carol', '待分配'],
    ['BT-1036', '共享单车 B-33', 'Alice', '已完成'],
  ];

  protected readonly records: BtRecordItem[] = [
    { title: '工单 BT-1042', meta: '共享单车 A-18 · 10 分钟前', status: '处理中' },
    { title: '工单 BT-1041', meta: '共享单车 C-07 · 32 分钟前', status: '已完成' },
    { title: '工单 BT-1039', meta: '调度车 D-02 · 1 小时前', status: '待分配' },
  ];
}
