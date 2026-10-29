import { Component, input, output } from '@angular/core';

@Component({
  selector: 'emp-dialog',
  standalone: true,
  template: `
    <div
      class="emp-dialog-wrap"
      [class.emp-dialog-wrap--overlay]="overlay()"
      (click)="onOverlayClick($event)"
    >
      <div class="emp-dialog" role="dialog">
        <div class="emp-dialog__header">
          <div class="emp-dialog__title">{{ title() }}</div>
          @if (closable()) {
            <button
              type="button"
              class="emp-dialog__close"
              aria-label="关闭"
              (click)="closed.emit()"
            >
              ×
            </button>
          }
        </div>
        <div class="emp-dialog__body">
          <ng-content />
        </div>
        <div class="emp-dialog__footer">
          <ng-content select="[empDialogFooter]" />
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./emp-dialog.component.less'],
})
export class EmpDialogComponent {
  readonly title = input('');
  readonly overlay = input(false);
  readonly closable = input(false);
  readonly closed = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if (this.overlay() && event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
