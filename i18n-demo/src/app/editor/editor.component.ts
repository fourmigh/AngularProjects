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
import { I18nService, LocaleId, TranslationMap } from '../i18n.service';

(globalThis as { MonacoEnvironment?: { getWorker: (moduleId: string, label: string) => Worker } }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    if (label === 'json') {
      return new Worker(
        new URL('../../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
        { type: 'module' },
      );
    }
    return new Worker(
      new URL('../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
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
  readonly selected = signal<LocaleId>('zh');
  readonly status = signal('');
  readonly isError = signal(false);

  readonly fileStats = computed(() => {
    const n = Object.keys(this.i18n.activeMap()).length;
    return this.i18n.label('demo.editor.keys').replace('{N}', String(n));
  });

  ngAfterViewInit(): void {
    const el = this.container()?.nativeElement;
    if (!el) return;
    this.editor = monaco.editor.create(el, {
      value: this.i18n.getContent(this.selected()),
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      tabSize: 2,
      scrollBeyondLastLine: false,
    });
    this.editor.onDidChangeModelContent(() => this.status.set(''));
  }

  label(key: string): string {
    return this.i18n.label(key);
  }

  onSelect(event: Event): void {
    this.selected.set((event.target as HTMLSelectElement).value as LocaleId);
    this.status.set('');
    this.editor?.setValue(this.i18n.getContent(this.selected()));
  }

  apply(): void {
    const text = this.editor?.getValue() ?? '';
    try {
      const map = this.validateMap(JSON.parse(text));
      this.i18n.setConfig(this.selected(), map);
      this.status.set(
        this.i18n.label('demo.editor.valid').replace('{N}', String(Object.keys(map).length)),
      );
      this.isError.set(false);
    } catch (err) {
      this.status.set(this.i18n.label('demo.editor.invalid') + ' ' + (err as Error).message);
      this.isError.set(true);
    }
  }

  reset(): void {
    this.i18n.resetConfig(this.selected());
    this.status.set('');
    this.isError.set(false);
    this.editor?.setValue(this.i18n.getContent(this.selected()));
  }

  download(): void {
    this.i18n.download(this.selected());
  }

  private validateMap(parsed: unknown): TranslationMap {
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('expected a flat object of string values');
    }
    const map: TranslationMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') {
        throw new Error(`value of "${key}" must be a string`);
      }
      map[key] = value;
    }
    return map;
  }
}
