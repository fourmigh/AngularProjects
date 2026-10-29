import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'emp-pagination',
  standalone: true,
  template: `
    <nav class="emp-pagination" aria-label="分页">
      <button
        type="button"
        class="emp-pagination__item"
        [disabled]="page() <= 1"
        (click)="pageChange.emit(page() - 1)"
      >
        ‹
      </button>
      @for (item of pageNumbers(); track item) {
        <button
          type="button"
          class="emp-pagination__item"
          [class.emp-pagination__item--active]="item === page()"
          (click)="pageChange.emit(item)"
        >
          {{ item }}
        </button>
      }
      <button
        type="button"
        class="emp-pagination__item"
        [disabled]="page() >= totalPages()"
        (click)="pageChange.emit(page() + 1)"
      >
        ›
      </button>
    </nav>
  `,
  styleUrls: ['./emp-pagination.component.less'],
})
export class EmpPaginationComponent {
  readonly total = input(0);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))),
  );

  readonly pageNumbers = computed(() => {
    const count = this.totalPages();
    const current = Math.min(Math.max(1, this.page()), count);
    const start = Math.max(1, Math.min(current - 2, count - 4));
    const end = Math.min(count, start + 4);
    const result: number[] = [];
    for (let index = start; index <= end; index += 1) {
      result.push(index);
    }
    return result;
  });
}
