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
import {
  BtActivityTimelineComponent,
  type BtActivityItem,
} from '../../components/bt-activity-timeline.component';
import { BtDeviceCardComponent } from '../../components/bt-device-card.component';

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
    BtDeviceCardComponent,
    BtActivityTimelineComponent,
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

  protected readonly activities: BtActivityItem[] = [
    { title: '工单 BT-1042 已分配', meta: '共享单车 A-18 · 10 分钟前', active: true },
    { title: '设备 C-07 完成检修', meta: '东门站点 · 32 分钟前' },
    { title: '调度车 D-02 出发', meta: '中心仓库 · 1 小时前' },
  ];
}
