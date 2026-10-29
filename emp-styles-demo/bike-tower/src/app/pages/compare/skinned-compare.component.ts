import { Component } from '@angular/core';
import { CompareNavComponent } from './compare-nav.component';
import { ShowcaseComponent } from '../showcase/showcase.component';

@Component({
  selector: 'app-compare-skinned',
  standalone: true,
  imports: [CompareNavComponent, ShowcaseComponent],
  template: `
    <div class="compare">
      <app-compare-nav />
      <div class="compare__body">
        <app-showcase />
      </div>
    </div>
  `,
  styleUrls: ['./compare-page.less'],
})
export class SkinnedCompareComponent {}
