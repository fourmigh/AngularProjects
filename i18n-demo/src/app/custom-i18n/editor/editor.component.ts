import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import * as monaco from 'monaco-editor';
import { I18nService } from '../i18n.service';
import type { LocaleId, TranslationKey } from '../i18n-keys';

(globalThis as { MonacoEnvironment?: { getWorker: (moduleId: string, label: string) => Worker } }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === 'json') {
      return new Worker(
        new URL('../../../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
        { type: 'module' },
      );
    }
    return new Worker(
      new URL('../../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' },
    );
  },
};

@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements AfterViewInit {
  private readonly i18n = inject(I18nService);
  private readonly container = viewChild<ElementRef<HTMLDivElement>>('monacoContainer');
  private editor: monaco.editor.IStandaloneCodeEditor | undefined;

  readonly languages = this.i18n.languages;
  readonly checked = signal<Record<LocaleId, boolean>>(
    Object.fromEntries(this.i18n.languages.map((l) => [l.id, true])) as Record<LocaleId, boolean>,
  );
  readonly status = signal('');
  readonly isError = signal(false);

  readonly fileStats = computed(() => {
    const n = this.i18n.keyCount();
    return this.i18n.label('demo.editor.keys').replace('{N}', String(n));
  });

  ngAfterViewInit(): void {
    const el = this.container()?.nativeElement;
    if (!el) return;
    this.editor = monaco.editor.create(el, {
      value: this.i18n.getMergedContent(),
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      tabSize: 2,
      scrollBeyondLastLine: false,
    });
    this.syncCheckedFromText(this.i18n.getMergedContent());
    this.editor.onDidChangeModelContent(() => {
      this.status.set('');
      const text = this.editor?.getValue() ?? '';
      this.i18n.saveDraft(text);
      this.syncCheckedFromText(text);
    });
  }

  label(key: TranslationKey): string {
    return this.i18n.label(key);
  }

  onToggle(lang: LocaleId): void {
    const next: Record<LocaleId, boolean> = { ...this.checked(), [lang]: !this.checked()[lang] };
    this.checked.set(next);
    const selected = this.languages.filter((l) => next[l.id]).map((l) => l.id);
    this.updateLanguagesInEditor(selected);
  }

  apply(): void {
    const text = this.editor?.getValue() ?? '';
    const err = this.i18n.applyEdited(text);
    if (err) {
      this.status.set(this.i18n.label('demo.editor.invalid') + ' ' + err);
      this.isError.set(true);
    } else {
      this.status.set(
        this.i18n.label('demo.editor.valid').replace('{N}', String(this.i18n.keyCount())),
      );
      this.isError.set(false);
    }
  }

  reset(): void {
    this.i18n.resetMerged();
    this.status.set('');
    this.isError.set(false);
    this.editor?.setValue(this.i18n.getMergedContent());
    this.syncCheckedFromText(this.i18n.getMergedContent());
  }

  download(): void {
    this.i18n.downloadMerged();
  }

  private updateLanguagesInEditor(selected: LocaleId[]): void {
    const text = this.editor?.getValue() ?? this.i18n.getMergedContent();
    try {
      const merged = JSON.parse(text) as Record<string, unknown>;
      merged['$languages'] = selected;
      this.editor?.setValue(JSON.stringify(merged, null, 2) + '\n');
    } catch {
      // 非法 JSON 时仅更新勾选，不改动编辑内容
    }
  }

  private syncCheckedFromText(text: string): void {
    try {
      const langs = (JSON.parse(text) as { $languages?: unknown }).$languages;
      if (!Array.isArray(langs)) return;
      const next = Object.fromEntries(
        this.languages.map((l) => [l.id, langs.includes(l.id)]),
      ) as Record<LocaleId, boolean>;
      if (JSON.stringify(next) !== JSON.stringify(this.checked())) {
        this.checked.set(next);
      }
    } catch {
      // 忽略非法 JSON
    }
  }
}
