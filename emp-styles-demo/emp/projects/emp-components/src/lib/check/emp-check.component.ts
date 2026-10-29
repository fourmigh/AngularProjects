import { Component, input, output } from '@angular/core';

@Component({
  selector: 'emp-check',
  standalone: true,
  template: `
    <label class="emp-check" [class.emp-check--switch]="variant() === 'switch'">
      <input
        class="emp-check__input"
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onChange($event)"
      />
      <span class="emp-check__control"></span>
      @if (label()) {
        <span class="emp-check__label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrls: ['./emp-check.component.less'],
})
export class EmpCheckComponent {
  readonly label = input('');
  readonly variant = input<'checkbox' | 'switch'>('checkbox');
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly checkedChange = output<boolean>();

  onChange(event: Event): void {
    this.checkedChange.emit((event.target as HTMLInputElement).checked);
  }
}
