import { computed, effect, Injectable, signal } from '@angular/core';
import {
  ALL_FIELDS,
  DEFAULT_SKIN,
  SKIN_GROUPS,
  type SkinField,
  type SkinGroup,
} from './skin-schema';
import {
  buildPreviewCss,
  parseSkinLess,
  serializeSkin,
  skinFileName,
} from './skin-serializer';
import { serializeSkinClasses } from './skin-classes';

export type SkinExportFormat = 'classes' | 'variables';
export type SkinExportScope = 'global' | 'scoped' | 'exclude' | 'combined';

export const PREVIEW_SCOPE = '.emp-preview-skin';
export const PREVIEW_CLASS = 'emp-preview-skin';

const PRESETS_KEY = 'emp-skin-presets-v1';
const CURRENT_KEY = 'emp-skin-current-v2';

interface StoredCurrent {
  name: string;
  values: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class SkinEditorService {
  readonly groups: SkinGroup[] = SKIN_GROUPS;
  readonly fields: SkinField[] = ALL_FIELDS;

  readonly name = signal('nextcloud');
  readonly values = signal<Record<string, string>>({ ...DEFAULT_SKIN });
  readonly selectedGroupId = signal(SKIN_GROUPS[0].id);
  readonly search = signal('');
  readonly previewTarget = signal<'bike-tower' | 'emp'>('bike-tower');
  readonly exportFormat = signal<SkinExportFormat>('classes');
  readonly exportScope = signal<SkinExportScope>('combined');
  readonly presets = signal<Record<string, Record<string, string>>>(
    this.readPresets(),
  );

  readonly selectedGroup = computed(
    () =>
      this.groups.find((group) => group.id === this.selectedGroupId()) ??
      this.groups[0],
  );

  readonly visibleGroups = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.groups;
    }
    return this.groups.filter(
      (group) =>
        group.label.toLowerCase().includes(term) ||
        group.fields.some(
          (field) =>
            field.label.toLowerCase().includes(term) ||
            field.key.toLowerCase().includes(term),
        ),
    );
  });

  readonly visibleFields = computed(() => {
    const group = this.selectedGroup();
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return group.fields;
    }
    return group.fields.filter(
      (field) =>
        field.label.toLowerCase().includes(term) ||
        field.key.toLowerCase().includes(term),
    );
  });

  readonly previewCss = computed(() =>
    this.exportFormat() === 'classes'
      ? serializeSkinClasses(this.name(), this.values(), {
          scope: PREVIEW_SCOPE,
          includeAppFrame: true,
        })
      : buildPreviewCss(this.values(), PREVIEW_SCOPE),
  );

  readonly exportContent = computed(() => {
    if (this.exportFormat() === 'variables') {
      return serializeSkin(this.name(), this.values());
    }
    const scope = this.exportScope();
    if (scope === 'combined') {
      return serializeSkinClasses(this.name(), this.values(), {
        combined: true,
      });
    }
    return serializeSkinClasses(this.name(), this.values(), {
      scope: scope === 'scoped' ? '.emp-skin' : undefined,
      excludeAttribute: scope === 'exclude' ? 'data-skin-off' : undefined,
    });
  });

  readonly fileName = computed(() => `${skinFileName(this.name())}.less`);

  readonly modifiedCount = computed(
    () =>
      this.fields.filter(
        (field) => this.values()[field.key] !== field.default,
      ).length,
  );

  readonly groupModifiedCounts = computed(() => {
    const values = this.values();
    const result: Record<string, number> = {};
    for (const group of this.groups) {
      result[group.id] = group.fields.filter(
        (field) => values[field.key] !== field.default,
      ).length;
    }
    return result;
  });

  readonly presetNames = computed(() => Object.keys(this.presets()).sort());

  readonly presetValue = computed(() => {
    const name = this.name();
    if (name === 'nextcloud') {
      return '__default__';
    }
    return this.presets()[name] ? name : '__current__';
  });

  constructor() {
    const stored = this.readCurrent();
    if (stored) {
      this.name.set(stored.name);
      this.values.set({ ...DEFAULT_SKIN, ...stored.values });
    }

    effect(() => {
      const payload: StoredCurrent = {
        name: this.name(),
        values: this.values(),
      };
      this.persist(CURRENT_KEY, payload);
    });
  }

  value(key: string): string {
    return this.values()[key] ?? DEFAULT_SKIN[key] ?? '';
  }

  isModified(key: string): boolean {
    return this.values()[key] !== DEFAULT_SKIN[key];
  }

  setValue(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  resetField(key: string): void {
    this.setValue(key, DEFAULT_SKIN[key] ?? '');
  }

  resetAll(): void {
    this.values.set({ ...DEFAULT_SKIN });
  }

  selectGroup(id: string): void {
    this.selectedGroupId.set(id);
  }

  savePreset(): void {
    const name = this.name().trim() || 'skin';
    this.presets.update((current) => ({
      ...current,
      [name]: { ...this.values() },
    }));
    this.persistPresets();
  }

  loadPreset(name: string): void {
    if (name === '__default__') {
      this.name.set('nextcloud');
      this.values.set({ ...DEFAULT_SKIN });
      return;
    }
    const preset = this.presets()[name];
    if (!preset) {
      return;
    }
    this.name.set(name);
    this.values.set({ ...DEFAULT_SKIN, ...preset });
  }

  deletePreset(name: string): void {
    this.presets.update((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
    this.persistPresets();
  }

  duplicate(name: string): void {
    this.name.set(name);
    this.presets.update((current) => ({
      ...current,
      [name]: { ...this.values() },
    }));
    this.persistPresets();
  }

  importLess(source: string, fileName: string): number {
    const parsed = parseSkinLess(source);
    const known = new Set(this.fields.map((field) => field.key));
    const imported = Object.fromEntries(
      Object.entries(parsed).filter(([key]) => known.has(key)),
    );
    this.values.update((current) => ({ ...current, ...imported }));
    this.name.set(fileName.replace(/\.(less|css)$/i, ''));
    return Object.keys(imported).length;
  }

  private readPresets(): Record<string, Record<string, string>> {
    return this.readStorage<Record<string, Record<string, string>>>(
      PRESETS_KEY,
      {},
    );
  }

  private readCurrent(): StoredCurrent | null {
    return this.readStorage<StoredCurrent | null>(CURRENT_KEY, null);
  }

  private persistPresets(): void {
    this.persist(PRESETS_KEY, this.presets());
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private persist(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }
}
