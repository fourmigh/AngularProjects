import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-demo-card',
  standalone: true,
  templateUrl: './emp-demo-card.component.html',
  styleUrls: ['./emp-demo-card.component.less'],
})
export class EmpDemoCardComponent {
  readonly title = input('示例卡片');
}
