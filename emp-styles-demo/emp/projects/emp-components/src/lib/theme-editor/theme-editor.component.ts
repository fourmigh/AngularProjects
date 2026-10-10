import { Component, inject, signal } from '@angular/core';
import { ThemeEditorService } from './theme-editor.service';
import { ThemeTokenDef } from './theme-tokens';

interface ParsedGradient {
  angle: number;
  from: string;
  to: string;
}

function parseGradient(value: string): ParsedGradient | null {
  if (!/gradient/i.test(value)) {
    return null;
  }
  const angleMatch = value.match(/([\d.]+)deg/);
  const colors = value.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g) ?? [];
  const from = colors[0];
  const to = colors[1];
  if (!from || !to) {
    return null;
  }
  return {
    angle: angleMatch?.[1] ? parseFloat(angleMatch[1]) : 135,
    from: normalizeHex(from),
    to: normalizeHex(to),
  };
}

function normalizeHex(color: string): string {
  return color.startsWith('#') ? color.slice(0, 7) : '#667eea';
}

@Component({
  selector: 'emp-theme-editor',
  standalone: true,
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.less'],
})
export class ThemeEditorComponent {
  protected readonly svc = inject(ThemeEditorService);

  protected readonly bgMode = signal<'gradient' | 'solid'>('gradient');
  protected readonly gradFrom = signal('#667eea');
  protected readonly gradTo = signal('#764ba2');
  protected readonly gradAngle = signal(135);
  protected readonly solidColor = signal('#667eea');
  protected readonly copied = signal('');
  /** 当前鼠标/焦点所在的令牌，用于在左侧高亮对应预览 */
  protected readonly highlight = signal<string | null>(null);

  /** 排版刻度令牌（供样板逐项展示） */
  protected readonly sizeTokens = this.svc.allTokens.filter((t) =>
    t.key.startsWith('--emp-font-size-'),
  );
  protected readonly weightTokens = this.svc.allTokens.filter((t) =>
    t.key.startsWith('--emp-font-weight-'),
  );
  protected readonly lineHeightTokens = this.svc.allTokens.filter((t) =>
    t.key.startsWith('--emp-line-height-'),
  );

  constructor() {
    const current = this.svc.valueOf('--emp-bg-app');
    const parsed = parseGradient(current);
    if (parsed) {
      this.gradFrom.set(parsed.from);
      this.gradTo.set(parsed.to);
      this.gradAngle.set(parsed.angle);
      this.bgMode.set('gradient');
    } else if (current) {
      this.solidColor.set(normalizeHex(current));
      this.bgMode.set('solid');
    }
  }

  protected onRowEnter(key: string): void {
    this.highlight.set(key);
  }

  protected onRowLeave(): void {
    this.highlight.set(null);
  }

  protected isAny(keys: string[]): boolean {
    const current = this.highlight();
    return current !== null && keys.includes(current);
  }

  protected num(key: string): number {
    const value = this.svc.valueOf(key);
    const n = parseFloat(value);
    return Number.isNaN(n) ? 0 : n;
  }

  /** 令牌当前的 LESS 写法（实时值），如 `@color-text-primary: #333;` */
  protected lessOf(key: string): string {
    const token = this.svc.allTokens.find((t) => t.key === key);
    return token ? `${token.lessName}: ${this.svc.valueOf(key)};` : '';
  }

  protected setLength(token: ThemeTokenDef, raw: string): void {
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) {
      this.svc.set(token.key, `${n}px`);
    }
  }

  protected onModeChange(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value as
      | 'gradient'
      | 'solid';
    this.bgMode.set(mode);
    if (mode === 'gradient') {
      this.applyGradient();
    } else {
      this.applySolid();
    }
  }

  protected applyGradient(): void {
    const value = `linear-gradient(${this.gradAngle()}deg, ${this.gradFrom()} 0%, ${this.gradTo()} 100%)`;
    this.svc.set('--emp-bg-app', value);
  }

  protected applySolid(): void {
    this.svc.set('--emp-bg-app', this.solidColor());
  }

  protected reset(): void {
    this.svc.reset();
    this.bgMode.set('gradient');
    this.gradFrom.set('#667eea');
    this.gradTo.set('#764ba2');
    this.gradAngle.set(135);
  }

  protected async copyLess(): Promise<void> {
    await this.copy(this.svc.exportLess(), '已复制 LESS');
  }

  private async copy(text: string, message: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.flash(message);
    } catch {
      this.flash('复制失败，请手动选择内容');
    }
  }

  private flash(message: string): void {
    this.copied.set(message);
    setTimeout(() => this.copied.set(''), 2000);
  }
}
