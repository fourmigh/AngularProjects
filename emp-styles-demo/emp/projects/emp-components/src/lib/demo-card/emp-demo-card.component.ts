import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-demo-card',
  standalone: true,
  templateUrl: './emp-demo-card.component.html',
  styleUrls: ['./emp-demo-card.component.less'],
})
export class EmpDemoCardComponent {
  readonly title = input('示例卡片');
  /** 自定义正文文案（不传则使用内置说明） */
  readonly body = input<string | null>(null);
  /** 变体：default（白底/阴影/主色标题） | plain（浅底/虚线/弱化标题） | accent（品牌实底/反白/等宽） */
  readonly variant = input<'default' | 'plain' | 'accent'>('default');
  /** 是否显示主色按钮 */
  readonly showButton = input(true);
}
