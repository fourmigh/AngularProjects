import { Component, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DEMOS } from '../../demos/demo-registry';

@Component({
  selector: 'app-demo-detail',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './demo-detail.component.html',
  styleUrl: './demo-detail.component.scss',
})
export class DemoDetailComponent {
  private route = inject(ActivatedRoute);

  private id = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
  );

  readonly demo = computed(() => DEMOS.find((d) => d.id === this.id()));
  readonly prevDemo = computed(() => {
    const idx = DEMOS.findIndex((d) => d.id === this.id());
    return idx > 0 ? DEMOS[idx - 1] : null;
  });
  readonly nextDemo = computed(() => {
    const idx = DEMOS.findIndex((d) => d.id === this.id());
    return idx < DEMOS.length - 1 ? DEMOS[idx + 1] : null;
  });

  readonly lines = computed(() => {
    const code = this.demo()?.code ?? '';
    return code.split('\n');
  });

  protected readonly highlight = (() => {
    if (typeof document !== 'undefined') {
      const hljs = (window as any).hljs;
      if (hljs) return true;
    }
    return false;
  })();

  copyCode(): void {
    const code = this.demo()?.code ?? '';
    navigator.clipboard.writeText(code);
  }
}
