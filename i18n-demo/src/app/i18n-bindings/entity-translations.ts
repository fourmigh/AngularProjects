const METADATA_URL = '/api/metadata/entities';

export interface MetadataField {
  name: string;
  label?: string;
}

export interface MetadataEntity {
  name: string;
  fields?: MetadataField[];
}

export interface MetadataResponse {
  data?: MetadataEntity[];
  success?: boolean;
  error?: unknown;
}

/**
 * 从服务端实体元数据抽取字段标签，生成运行时翻译表：
 * key = `${entity.name}.${field.name}`，仅取非空 label。
 */
export function extractEntityLabels(res: MetadataResponse): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const entity of res.data ?? []) {
    if (!entity?.name) continue;
    for (const field of entity.fields ?? []) {
      if (!field?.name) continue;
      if (typeof field.label === 'string' && field.label.length > 0) {
        entries[`${entity.name}.${field.name}`] = field.label;
      }
    }
  }
  return entries;
}

/** 拉取指定语言的实体元数据并抽取字段标签。 */
export async function fetchEntityTranslations(lang: string): Promise<Record<string, string>> {
  const res = await fetch(`${METADATA_URL}?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return extractEntityLabels((await res.json()) as MetadataResponse);
}
