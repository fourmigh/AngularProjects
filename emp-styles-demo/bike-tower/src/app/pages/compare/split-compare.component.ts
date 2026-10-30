import { Component } from '@angular/core';
import { CompareNavComponent } from './compare-nav.component';
import { ShowcaseComponent } from '../showcase/showcase.component';

@Component({
  selector: 'app-compare-split',
  standalone: true,
  imports: [CompareNavComponent, ShowcaseComponent],
  template: `
    <div class="compare">
      <app-compare-nav />

      <div class="compare__scroll">
        <div class="compare__grid">
          <section class="compare__pane">
            <div class="compare__pane-title">无皮肤</div>
            <div class="emp-raw">
              <app-showcase [embedded]="true" />
            </div>
          </section>

          <section class="compare__pane">
            <div class="compare__pane-title">有皮肤</div>
            <div class="compare__skin emp-skin">
              <app-showcase [embedded]="true" />
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./split-compare.component.less'],
})
export class SplitCompareComponent {}
