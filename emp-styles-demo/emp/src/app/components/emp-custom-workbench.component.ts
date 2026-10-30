import { Component } from '@angular/core';

@Component({
  selector: 'emp-custom-workbench',
  standalone: true,
  template: `
    <div class="emp-custom-workbench">
      <header class="emp-custom-workbench__header">
        <span class="emp-custom-workbench__brand">EMP Workspace</span>
        <span class="emp-custom-workbench__actions">
          <ng-content select="[workbenchActions]" />
        </span>
      </header>
      <div class="emp-custom-workbench__body">
        <aside class="emp-custom-workbench__sidebar">
          <span
            class="emp-custom-workbench__nav emp-custom-workbench__nav--active"
            >概览</span
          >
          <span class="emp-custom-workbench__nav">工单</span>
          <span class="emp-custom-workbench__nav">设备</span>
          <span class="emp-custom-workbench__nav">报表</span>
        </aside>
        <main class="emp-custom-workbench__content">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./emp-custom-workbench.component.less'],
})
export class EmpCustomWorkbenchComponent {}
