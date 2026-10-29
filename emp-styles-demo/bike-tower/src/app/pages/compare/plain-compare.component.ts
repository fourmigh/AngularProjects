import { Component } from '@angular/core';
import { EmpSkinOffDirective } from '@tikmac/emp-components';
import { CompareNavComponent } from './compare-nav.component';
import { ShowcaseComponent } from '../showcase/showcase.component';

@Component({
  selector: 'app-compare-plain',
  standalone: true,
  imports: [CompareNavComponent, ShowcaseComponent, EmpSkinOffDirective],
  template: `
    <div class="compare" empSkinOff>
      <app-compare-nav />
      <div class="compare__body compare__body--scroll emp-raw">
        <app-showcase [embedded]="true" />
      </div>
    </div>
  `,
  styleUrls: ['./compare-page.less'],
})
export class PlainCompareComponent {}
