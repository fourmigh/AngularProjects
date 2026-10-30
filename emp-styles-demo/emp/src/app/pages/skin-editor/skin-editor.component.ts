import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SkinField, SkinGroup } from './skin-schema';
import { skinFileName } from './skin-serializer';
import {
  PREVIEW_CLASS,
  SkinEditorService,
} from './skin-editor.service';

interface DirHandle {
  readonly name: string;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<DirHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileHandle>;
}

interface FileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<{
    write(data: string): Promise<void>;
    close(): Promise<void>;
  }>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
    }) => Promise<DirHandle>;
  }
}

async function readTextFile(
  dir: DirHandle,
  name: string,
): Promise<string | null> {
  try {
    const handle = await dir.getFileHandle(name);
    const file = await handle.getFile();
    return file.text();
  } catch {
    return null;
  }
}

async function writeTextFile(
  dir: DirHandle,
  name: string,
  content: string,
): Promise<void> {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

@Component({
  selector: 'app-skin-editor',
  standalone: true,
  templateUrl: './skin-editor.component.html',
  styleUrls: ['./skin-editor.component.less'],
})
export class SkinEditorComponent {
  protected readonly svc = inject(SkinEditorService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly frame =
    viewChild<ElementRef<HTMLIFrameElement>>('previewFrame');

  protected readonly exportOpen = signal(false);
  protected readonly exportName = signal('current');
  protected readonly exportMessage = signal('');

  private readonly bikeHost =
    window.location.hostname === 'localhost'
      ? '127.0.0.1'
      : window.location.hostname;
  protected readonly bikeOrigin = `http://${this.bikeHost}:4210`;

  protected readonly iframeSrc = computed(() =>
    this.svc.previewTarget() === 'emp'
      ? '/showcase?embed=1'
      : `${this.bikeOrigin}/showcase`,
  );

  protected readonly safeSrc = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeSrc()),
  );

  constructor() {
    effect(() => {
      this.svc.previewCss();
      this.applyPreview();
    });

    const onMessage = (event: MessageEvent): void => {
      if (event.data?.type === 'emp-skin-ready') {
        this.applyPreview();
        this.highlightSelected();
      }
    };
    window.addEventListener('message', onMessage);
    this.destroyRef.onDestroy(() =>
      window.removeEventListener('message', onMessage),
    );
  }

  protected selectGroup(group: SkinGroup): void {
    this.svc.selectGroup(group.id);
    this.highlightSelected();
  }

  protected onPresetChange(event: Event): void {
    this.svc.loadPreset((event.target as HTMLSelectElement).value);
  }

  protected onTargetChange(event: Event): void {
    this.svc.previewTarget.set(
      (event.target as HTMLSelectElement).value === 'emp'
        ? 'emp'
        : 'bike-tower',
    );
    this.svc.ensureSelectedGroupVisible();
  }

  protected onFormatChange(event: Event): void {
    this.svc.exportFormat.set(
      (event.target as HTMLSelectElement).value === 'variables'
        ? 'variables'
        : 'classes',
    );
  }

  protected onScopeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.svc.exportScope.set(
      value === 'scoped' ||
        value === 'exclude' ||
        value === 'global'
        ? value
        : 'combined',
    );
  }

  protected onText(field: SkinField, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.svc.setValue(field.key, target.value);
  }

  protected onRange(field: SkinField, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.svc.setValue(field.key, `${value}px`);
  }

  protected pxValue(value: string): number {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  protected swatch(value: string): string {
    if (/^#[0-9a-f]{6}$/i.test(value)) {
      return value;
    }
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    return '#ffffff';
  }

  protected resetGroup(): void {
    for (const field of this.svc.selectedGroup().fields) {
      this.svc.resetField(field.key);
    }
  }

  protected deleteCurrentPreset(): void {
    const name = this.svc.name();
    this.svc.deletePreset(name);
    this.exportMessage.set(`已删除皮肤「${name}」`);
  }

  protected async onImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const text = await file.text();
    const count = this.svc.importLess(text, file.name);
    this.exportMessage.set(`已从 ${file.name} 导入 ${count} 个键值`);
  }

  protected async loadDarkExample(): Promise<void> {
    try {
      const response = await fetch('/skins/dark.less');
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      const count = this.svc.importLess(text, 'dark');
      this.exportMessage.set(`已载入 dark 示例（${count} 个键值）`);
    } catch (error) {
      const err = error as { message?: string };
      this.exportMessage.set(`载入示例失败：${err.message ?? String(error)}`);
    }
  }

  protected openExport(): void {
    this.exportName.set('current');
    this.exportMessage.set('');
    this.exportOpen.set(true);
  }

  protected downloadSkin(): void {
    const content = this.svc.exportContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${skinFileName(this.exportName())}.less`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected async writeToProject(target: 'emp' | 'bike-tower'): Promise<void> {
    const picker = window.showDirectoryPicker;
    if (!picker) {
      this.exportMessage.set(
        '当前浏览器不支持写入文件，请使用 Chrome / Edge，或先下载 .less。',
      );
      return;
    }
    try {
      const root = await picker.call(window, { mode: 'readwrite' });
      const content = this.svc.exportContent();
      const fileName = `${skinFileName(this.exportName())}.less`;
      const src = await root.getDirectoryHandle('src', { create: true });
      const styles = await src.getDirectoryHandle('styles', { create: true });
      const skins = await styles.getDirectoryHandle('skins', { create: true });
      await writeTextFile(skins, fileName, content);

      const importLine = `@import './styles/skins/${fileName}';`;
      const entry = (await readTextFile(src, 'styles.less')) ?? '';
      if (!entry.includes(importLine)) {
        const next = entry.trim()
          ? `${entry.trimEnd()}\n${importLine}\n`
          : `${importLine}\n`;
        await writeTextFile(src, 'styles.less', next);
      }
      this.exportMessage.set(
        `已写入 ${target}：src/styles/skins/${fileName}，并维护 src/styles.less`,
      );
    } catch (error) {
      const err = error as { name?: string; message?: string };
      if (err.name === 'AbortError') {
        this.exportMessage.set('已取消目录选择。');
        return;
      }
      this.exportMessage.set(`写入失败：${err.message ?? String(error)}`);
    }
  }

  protected reloadPreview(): void {
    const frame = this.frame()?.nativeElement;
    if (!frame) {
      return;
    }
    const separator = this.iframeSrc().includes('?') ? '&' : '?';
    frame.src = `${this.iframeSrc()}${separator}r=${Date.now()}`;
  }

  protected highlightSelected(): void {
    this.highlight(this.svc.selectedGroup().selector ?? '');
  }

  protected onFrameLoad(): void {
    this.applyPreview();
    this.highlightSelected();
  }

  private applyPreview(): void {
    const frame = this.frame()?.nativeElement;
    if (!frame) {
      return;
    }
    const css = this.svc.previewCss();
    if (this.svc.previewTarget() === 'emp') {
      try {
        const doc = frame.contentDocument;
        if (!doc) {
          return;
        }
        doc.body.setAttribute('data-skin-off', '');
        doc.body.classList.add(PREVIEW_CLASS);
        let style = doc.getElementById(
          'emp-skin-preview',
        ) as HTMLStyleElement | null;
        if (!style) {
          style = doc.createElement('style');
          style.id = 'emp-skin-preview';
          doc.head.appendChild(style);
        }
        style.textContent = css;
      } catch {
        /* ignore */
      }
      return;
    }
    frame.contentWindow?.postMessage(
      {
        type: 'emp-skin-preview',
        css,
        scopeClass: PREVIEW_CLASS,
        disableBuiltSkin: true,
      },
      this.bikeOrigin,
    );
  }

  private highlight(selector: string): void {
    if (!selector) {
      return;
    }
    if (this.svc.previewTarget() === 'emp') {
      this.highlightSameOrigin(selector);
      return;
    }
    this.frame()?.nativeElement.contentWindow?.postMessage(
      { type: 'emp-skin-highlight', selector },
      this.bikeOrigin,
    );
  }

  private highlightSameOrigin(selector: string): void {
    const doc = this.frame()?.nativeElement.contentDocument;
    if (!doc) {
      return;
    }
    let style = doc.getElementById(
      'emp-skin-highlight',
    ) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement('style');
      style.id = 'emp-skin-highlight';
      style.textContent =
        '.emp-skin-highlighted { outline: 2px solid #ff6b00 !important; outline-offset: 2px !important; }';
      doc.head.appendChild(style);
    }
    doc
      .querySelectorAll('.emp-skin-highlighted')
      .forEach((element) => element.classList.remove('emp-skin-highlighted'));
    try {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((element) =>
        element.classList.add('emp-skin-highlighted'),
      );
      elements[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      /* ignore invalid selector */
    }
  }
}
