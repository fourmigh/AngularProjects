import { Component } from '@angular/core';
import { EmpDemoCardComponent } from '@tikmac/emp-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmpDemoCardComponent],
  host: { class: 'emp-app-frame' },
  template: `
    <div class="bt-shell">
      <h1 class="bt-title">bike-tower 消费方 · 共享样式验证</h1>
      <p class="bt-desc">
        字体与背景来自 <code>@tikmac/emp-components</code> 的全局主题；下方卡片由库组件渲染。
      </p>
      <emp-demo-card title="来自 emp-components 的卡片"></emp-demo-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .bt-shell {
        padding: 24px;
      }
      .bt-title {
        margin: 0 0 8px;
        font-size: 20px;
      }
      .bt-desc {
        color: var(--emp-color-text-secondary, #666);
        margin-bottom: 16px;
      }
    `,
  ],
})
export class AppComponent {}
