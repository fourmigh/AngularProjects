import { SKIN_GROUPS } from './skin-schema';

const VARIABLE_PATTERN = /(--emp-[\w-]+)\s*:\s*([^;]+);/g;

export function parseSkinLess(source: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pattern = new RegExp(VARIABLE_PATTERN.source, 'g');
  let match = pattern.exec(source);
  while (match) {
    result[match[1].trim()] = match[2].trim();
    match = pattern.exec(source);
  }
  return result;
}

export function skinFileName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'skin';
}

export function buildPreviewCss(
  values: Record<string, string>,
  selector = ':root',
): string {
  const declarations = Object.entries(values)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

export function serializeSkin(
  name: string,
  values: Record<string, string>,
): string {
  const lines: string[] = [`/* emp skin: ${name.trim() || 'skin'} */`, ':root {'];
  for (const group of SKIN_GROUPS) {
    lines.push(`  /* ${group.label} */`);
    for (const field of group.fields) {
      const value = values[field.key] ?? field.default;
      lines.push(`  ${field.key}: ${value};`);
    }
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}
