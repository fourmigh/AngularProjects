import { Component } from '@angular/core';
import { EmpDemoCardComponent } from 'emp-components';

@Component({
  selector: 'app-demo-home',
  standalone: true,
  imports: [EmpDemoCardComponent],
  template: `
    <h2 class="home-title">共享样式组件示例</h2>
    <p class="home-desc">
      以下卡片来自库组件 <code>emp-demo-card</code>，其字体、颜色、圆角均取自共享令牌。
      切到「主题编辑器」可实时调整并观察整页效果。
    </p>
    <div class="home-cards">
      <emp-demo-card title="卡片 A"></emp-demo-card>
      <emp-demo-card title="卡片 B"></emp-demo-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        box-sizing: border-box;
        padding: 20px;
      }
      .home-title {
        margin: 0 0 8px;
        font-size: 18px;
      }
      .home-desc {
        color: var(--emp-color-text-secondary, #666);
        margin-bottom: 16px;
      }
      .home-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    `,
  ],
})
export class DemoHomeComponent {}
