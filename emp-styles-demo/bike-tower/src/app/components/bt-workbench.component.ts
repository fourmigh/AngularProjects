import { Component } from '@angular/core';

@Component({
  selector: 'bt-workbench',
  standalone: true,
  template: `
    <div class="bt-workbench">
      <header class="bt-workbench__header">
        <span class="bt-workbench__brand">Bike Tower</span>
        <span class="bt-workbench__actions">
          <ng-content select="[workbenchActions]" />
        </span>
      </header>
      <div class="bt-workbench__body">
        <aside class="bt-workbench__sidebar">
          <span class="bt-workbench__nav bt-workbench__nav--active">概览</span>
          <span class="bt-workbench__nav">工单</span>
          <span class="bt-workbench__nav">设备</span>
          <span class="bt-workbench__nav">报表</span>
        </aside>
        <main class="bt-workbench__content">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./bt-workbench.component.less'],
})
export class BtWorkbenchComponent {}
