import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import * as monaco from 'monaco-editor';
import { I18nService, type LocaleId, type TranslationKey } from 'i18n';

export type EditorTranslateFn = (key: string) => string;

/** 编辑器文案的翻译函数；宿主默认应提供 `(key) => i18n.t(key)`。 */
export const I18N_EDITOR_TRANSLATE = new InjectionToken<EditorTranslateFn>('I18N_EDITOR_TRANSLATE', {
  providedIn: 'root',
  factory: () => (key: string) => key,
});

export const EDITOR_KEYS = {
  title: 'i18n.editor.title',
  hint: 'i18n.editor.hint',
  apply: 'i18n.editor.apply',
  reset: 'i18n.editor.reset',
  download: 'i18n.editor.download',
  valid: 'i18n.editor.valid',
  invalid: 'i18n.editor.invalid',
  keys: 'i18n.editor.keys',
} as const satisfies Record<string, TranslationKey>;

@Component({
  selector: 'lib-i18n-editor',
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements AfterViewInit {
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(I18N_EDITOR_TRANSLATE);

  @ViewChild('monacoContainer') container?: ElementRef<HTMLDivElement>;

  private editor: monaco.editor.IStandaloneCodeEditor | undefined;

  readonly languages = this.i18n.languages;
  readonly checked = signal<Record<LocaleId, boolean>>(
    Object.fromEntries(this.i18n.languages.map((l) => [l.id, true])) as Record<LocaleId, boolean>,
  );
  readonly status = signal('');
  readonly isError = signal(false);

  readonly _keys = EDITOR_KEYS;

  readonly fileStats = computed(() => {
    this.i18n.renderTick();
    const n = this.i18n.keyCount();
    return this.translate(EDITOR_KEYS.keys).replace('{N}', String(n));
  });

  ngAfterViewInit(): void {
    const el = this.container?.nativeElement;
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

  label(key: string): string {
    this.i18n.renderTick();
    return this.translate(key);
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
      this.status.set(this.translate(EDITOR_KEYS.invalid) + ' ' + err);
      this.isError.set(true);
    } else {
      this.status.set(
        this.translate(EDITOR_KEYS.valid).replace('{N}', String(this.i18n.keyCount())),
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
