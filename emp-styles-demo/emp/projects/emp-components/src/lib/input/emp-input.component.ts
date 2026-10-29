import { Component, input, output } from '@angular/core';

@Component({
  selector: 'emp-input',
  standalone: true,
  template: `
    <label class="emp-field">
      @if (label()) {
        <span class="emp-field__label">{{ label() }}</span>
      }
      <input
        class="emp-input"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
      />
      @if (hint()) {
        <span class="emp-field__hint">{{ hint() }}</span>
      }
    </label>
  `,
  styleUrls: ['./emp-input.component.less'],
})
export class EmpInputComponent {
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly type = input<'text' | 'password' | 'email' | 'search'>('text');
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
