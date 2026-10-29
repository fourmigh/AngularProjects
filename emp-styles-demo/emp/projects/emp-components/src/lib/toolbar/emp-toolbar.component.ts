import { Component } from '@angular/core';

@Component({
  selector: 'emp-toolbar',
  standalone: true,
  template: `
    <header class="emp-toolbar">
      <div class="emp-toolbar__group">
        <ng-content select="[empToolbarStart]" />
      </div>
      <div class="emp-toolbar__group emp-toolbar__group--end">
        <ng-content select="[empToolbarEnd]" />
      </div>
    </header>
  `,
  styleUrls: ['./emp-toolbar.component.less'],
})
export class EmpToolbarComponent {}
