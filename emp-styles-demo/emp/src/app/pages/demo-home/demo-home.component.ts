import { Component } from '@angular/core';
import { EmpDemoCardComponent } from 'emp-components';

interface DemoCardConfig {
  title: string;
  variant: 'default' | 'plain' | 'accent';
  showButton: boolean;
  body: string | null;
  /** 该配置对应的用法代码（HTML 片段） */
  code: string;
}

@Component({
  selector: 'app-demo-home',
  standalone: true,
  imports: [EmpDemoCardComponent],
  template: `
    <h2 class="home-title">共享样式组件示例</h2>
    <p class="home-desc">
      同一个库组件 <code>emp-demo-card</code> 的两种配置；字体、颜色、圆角均取自共享令牌。
      切到「主题编辑器」可实时调整并观察整页效果。
    </p>
    <div class="home-cards">
      @for (card of cards; track card.title) {
        <div class="home-item">
          <emp-demo-card
            [title]="card.title"
            [variant]="card.variant"
            [showButton]="card.showButton"
            [body]="card.body"
          ></emp-demo-card>
          <pre class="home-code"><code>{{ card.code }}</code></pre>
        </div>
      }
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
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        align-items: start;
      }
      .home-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }
      .home-code {
        margin: 0;
        padding: 10px 12px;
        background: var(--emp-color-bg-page, #f5f7fa);
        border: 1px solid var(--emp-color-border, #e0e0e0);
        border-radius: 8px;
        font-family: var(--emp-font-family-code, ui-monospace, monospace);
        font-size: var(--emp-font-size-xs, 12px);
        line-height: 1.5;
        color: var(--emp-color-text-secondary, #666);
        white-space: pre-wrap;
        word-break: break-word;
        overflow: auto;
      }
    `,
  ],
})
export class DemoHomeComponent {
  readonly cards: DemoCardConfig[] = [
    {
      title: '默认卡片',
      variant: 'default',
      showButton: true,
      body: null,
      code: `<emp-demo-card title="默认卡片"></emp-demo-card>`,
    },
    {
      title: '简洁变体',
      variant: 'plain',
      showButton: false,
      body: '这个变体隐藏按钮、使用浅色底与虚线边框，演示组件的可配置性（variant / showButton / body）。',
      code: `<emp-demo-card
  [variant]="'plain'"
  [showButton]="false"
  title="简洁变体"
  body="这个变体隐藏按钮、使用浅色底与虚线边框，演示组件的可配置性（variant / showButton / body）。"
></emp-demo-card>`,
    },
    {
      title: '品牌实底',
      variant: 'accent',
      showButton: true,
      body: '品牌色实底、反白文字、等宽字体，演示不同样式与字体组合。',
      code: `<emp-demo-card
  [variant]="'accent'"
  title="品牌实底"
  body="品牌色实底、反白文字、等宽字体，演示不同样式与字体组合。"
></emp-demo-card>`,
    },
  ];
}
