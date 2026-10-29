import { Component, input, output } from '@angular/core';

export interface EmpSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'emp-select',
  standalone: true,
  template: `
    <label class="emp-field">
      @if (label()) {
        <span class="emp-field__label">{{ label() }}</span>
      }
      <select
        class="emp-select"
        [value]="value()"
        [disabled]="disabled()"
        (change)="onChange($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  styleUrls: ['./emp-select.component.less'],
})
export class EmpSelectComponent {
  readonly label = input('');
  readonly options = input<EmpSelectOption[]>([]);
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
