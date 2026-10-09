import { Injectable, effect, inject, isDevMode, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  THEME_TOKENS,
  ThemeTokenDef,
  ThemeTokenGroup,
  groupTokens,
} from './theme-tokens';

const STORAGE_KEY = 'emp-theme-overrides';

/**
 * 主题编辑状态服务。
 *
 * - 把用户改动写入 document.documentElement 的内联样式（覆盖 :root 上的
 *   --emp-* 变量），因此**整页实时生效**，且优先级高于 theme.less。
 * - 变更持久化到 localStorage，刷新后恢复。
 * - 支持导出 CSS / LESS 覆盖片段。
 */
@Injectable({ providedIn: 'root' })
export class ThemeEditorService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser =
    typeof window !== 'undefined' && !!this.document?.documentElement;

  readonly allTokens: ThemeTokenDef[] = THEME_TOKENS;
  readonly groups: ThemeTokenGroup[] = groupTokens(THEME_TOKENS);

  /** 当前用户覆盖：CSS 变量名 -> 值 */
  readonly overrides = signal<Record<string, string>>({});

  constructor() {
    if (this.isBrowser) {
      this.overrides.set(this.readStorage());
      effect(() => this.apply(this.overrides()));
    }
  }

  /** 当前生效值（含默认回退） */
  valueOf(key: string): string {
    const overrides = this.overrides();
    if (key in overrides) {
      return overrides[key];
    }
    return this.defaultOf(key) ?? '';
  }

  isOverridden(key: string): boolean {
    return key in this.overrides();
  }

  set(key: string, value: string): void {
    this.overrides.update((o) => ({ ...o, [key]: value }));
  }

  /** 清除全部覆盖，回到 theme.less 默认 */
  reset(): void {
    const root = this.rootEl();
    if (root) {
      for (const token of this.allTokens) {
        root.style.removeProperty(token.key);
      }
    }
    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    this.overrides.set({});
  }

  exportCss(): string {
    const overrides = this.overrides();
    const lines = this.allTokens
      .filter((t) => t.key in overrides)
      .map((t) => `  ${t.key}: ${overrides[t.key]};`);
    if (!lines.length) {
      return '/* 暂无覆盖，当前使用 theme.less 默认值 */';
    }
    return `:root {\n${lines.join('\n')}\n}`;
  }

  exportLess(): string {
    const overrides = this.overrides();
    const lines = this.allTokens
      .filter((t) => t.key in overrides)
      .map((t) => `${t.lessName}: ${overrides[t.key]};`);
    if (!lines.length) {
      return '// 暂无覆盖，当前使用 tokens.less 默认值';
    }
    return lines.join('\n');
  }

  private defaultOf(key: string): string | undefined {
    return this.allTokens.find((t) => t.key === key)?.default;
  }

  private rootEl(): HTMLElement | null {
    return this.isBrowser ? this.document.documentElement : null;
  }

  private apply(overrides: Record<string, string>): void {
    const root = this.rootEl();
    if (!root) {
      return;
    }
    for (const token of this.allTokens) {
      const value = overrides[token.key];
      if (value === undefined) {
        root.style.removeProperty(token.key);
      } else {
        root.style.setProperty(token.key, value);
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (err) {
      if (isDevMode()) {
        console.warn('[emp-theme-editor] 无法持久化主题覆盖', err);
      }
    }
  }

  private readStorage(): Record<string, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
}
