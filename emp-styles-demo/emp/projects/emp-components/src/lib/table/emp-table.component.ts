import { Component, input } from '@angular/core';

@Component({
  selector: 'emp-table',
  standalone: true,
  template: `
    <div class="emp-table-wrap">
      <table class="emp-table">
        @if (caption()) {
          <caption class="emp-table__caption">{{ caption() }}</caption>
        }
        <thead>
          <tr>
            @for (column of columns(); track $index) {
              <th>{{ column }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr>
              @for (cell of row; track $index) {
                <td>{{ cell }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./emp-table.component.less'],
})
export class EmpTableComponent {
  readonly caption = input('');
  readonly columns = input<string[]>([]);
  readonly rows = input<string[][]>([]);
}
