import { Component, HostListener, inject, signal } from '@angular/core';
import { ThemeEditorService } from './theme-editor.service';
import { ThemeTokenDef } from './theme-tokens';

// File System Access API 的 showDirectoryPicker 尚未进入 lib.dom 标准类型，这里补充声明。
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'write' | 'readwrite';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

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

async function fileExists(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(name);
    return true;
  } catch {
    return false;
  }
}

async function readFile(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<string | null> {
  try {
    const handle = await dir.getFileHandle(name);
    const file = await handle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

async function writeFile(
  dir: FileSystemDirectoryHandle,
  name: string,
  content: string,
): Promise<void> {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

type ApplyStepState = 'pending' | 'running' | 'done' | 'error' | 'skipped';

interface ApplyStep {
  label: string;
  state: ApplyStepState;
  detail?: string;
}

interface ApplyResult {
  project: string;
  files: string[];
  importAdded: boolean;
  overrides: string;
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
  /** 当前鼠标/焦点所在的令牌，用于在左侧高亮对应预览 */
  protected readonly highlight = signal<string | null>(null);
  /** “一键应用到项目”进行中 */
  protected readonly applying = signal(false);
  /** 应用对话框是否打开 */
  protected readonly applyOpen = signal(false);
  /** 应用步骤（进度） */
  protected readonly applySteps = signal<ApplyStep[]>([]);
  /** 应用结果（成功时） */
  protected readonly applyResult = signal<ApplyResult | null>(null);
  /** 应用错误信息（失败/取消时） */
  protected readonly applyError = signal<string | null>(null);

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

  /**
   * 一键应用：用 File System Access API 让用户选择“项目根目录”，
   * 自动写入 src/styles/overrides.less 并在 src/styles.less（库主题之后）追加引入。
   * 过程与结果通过对话框展示。
   */
  protected async pickAndApply(): Promise<void> {
    this.applyOpen.set(true);
    this.applyError.set(null);
    this.applyResult.set(null);
    this.applying.set(false);

    const picker = window.showDirectoryPicker;
    if (!picker) {
      this.applySteps.set([]);
      this.applyError.set(
        '当前浏览器不支持文件写入，请用 Chrome/Edge 打开本页。',
      );
      return;
    }

    const steps: ApplyStep[] = [
      { label: '选择项目根目录', state: 'running' },
      { label: '校验 Angular 项目（angular.json）', state: 'pending' },
      { label: '写入 src/styles/overrides.less', state: 'pending' },
      { label: '更新 src/styles.less 的引入', state: 'pending' },
    ];
    this.applySteps.set(steps);

    const update = (i: number, state: ApplyStepState, detail?: string): void => {
      this.applySteps.update((list) =>
        list.map((s, idx) => (idx === i ? { ...s, state, detail } : s)),
      );
    };

    let root: FileSystemDirectoryHandle;
    try {
      root = await picker.call(window, { mode: 'readwrite' });
      update(0, 'done', `项目：${root.name}`);
    } catch (e) {
      const err = e as { name?: string };
      if (err?.name === 'AbortError') {
        update(0, 'skipped', '已取消选择');
        this.applyError.set('已取消。');
      } else {
        update(0, 'error', err?.name ?? '选择失败');
        this.applyError.set('选择目录失败：' + (err?.name ?? '未知错误'));
      }
      return;
    }

    this.applying.set(true);
    try {
      update(1, 'running');
      if (!(await fileExists(root, 'angular.json'))) {
        update(1, 'error', '未找到 angular.json');
        throw new Error('所选目录看起来不是 Angular 项目（缺 angular.json）。');
      }
      update(1, 'done', 'angular.json 已找到');

      const src = await root.getDirectoryHandle('src', { create: true });
      const styles = await src.getDirectoryHandle('styles', { create: true });

      const overrides = this.svc.exportLess();
      update(2, 'running');
      await writeFile(styles, 'overrides.less', overrides + '\n');
      update(2, 'done', 'src/styles/overrides.less');

      const importLine = `@import './styles/overrides.less';`;
      const entry = (await readFile(src, 'styles.less')) ?? '';
      update(3, 'running');
      let importAdded = false;
      if (!entry.includes(importLine)) {
        let updated: string;
        if (/@import[^\n]*theme\.less[^\n]*;/.test(entry)) {
          updated = entry.replace(
            /(@import[^\n]*theme\.less[^\n]*;)/,
            `$1\n${importLine}`,
          );
        } else {
          updated =
            (entry.trimEnd() ? entry.trimEnd() + '\n\n' : '') + importLine + '\n';
        }
        await writeFile(src, 'styles.less', updated);
        importAdded = true;
        update(3, 'done', '已新增引入');
      } else {
        update(3, 'done', '已存在引入，未改动');
      }

      this.applyResult.set({
        project: root.name,
        files: [
          'src/styles/overrides.less',
          ...(importAdded ? ['src/styles.less'] : []),
        ],
        importAdded,
        overrides,
      });
    } catch (e) {
      const err = e as { name?: string; message?: string };
      this.applySteps.update((list) => {
        let marked = false;
        return list.map((s) => {
          if (!marked && s.state === 'running') {
            marked = true;
            return {
              ...s,
              state: 'error' as ApplyStepState,
              detail: err?.message ?? '失败',
            };
          }
          return s;
        });
      });
      this.applyError.set(err?.message ?? '写入失败：未知错误');
    } finally {
      this.applying.set(false);
    }
  }

  protected closeApply(): void {
    this.applyOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    if (this.applyOpen()) {
      this.applyOpen.set(false);
    }
  }
}
