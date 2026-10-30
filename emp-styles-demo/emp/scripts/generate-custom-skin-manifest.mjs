#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const empRoot = resolve(scriptDir, '..');
const repoRoot = resolve(empRoot, '..');
const bikeRoot = join(repoRoot, 'bike-tower');
const propertiesFile = join(scriptDir, 'skin-properties.json');
const overridesFile = join(scriptDir, 'custom-skin-overrides.json');
const outputFile = join(
  empRoot,
  'src/app/pages/skin-editor/custom-skin.generated.ts',
);

const readJson = (file, fallback) => {
  if (!existsSync(file)) {
    return fallback;
  }
  return JSON.parse(readFileSync(file, 'utf8'));
};

const properties = readJson(propertiesFile, {});
const overrides = readJson(overridesFile, {});

const scanRoots = [
  {
    dir: join(empRoot, 'src/app/components'),
    namespace: 'emp',
    keyNamespace: 'custom',
    prefix: '--emp-custom-',
  },
  {
    dir: join(bikeRoot, 'src/app/components'),
    namespace: 'bt',
    keyNamespace: 'bt',
    prefix: '--emp-bt-',
  },
];

const keyPattern = /^--emp-(bt|custom)-([a-z0-9-]+)--([a-z0-9-]+)$/;
const declarationPattern =
  /(--emp-(?:bt|custom)-[a-z0-9-]+--[a-z0-9-]+)\s*:\s*([^;]+);/g;

function walkLess(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.angular') {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkLess(full, files);
    } else if (entry.endsWith('.less')) {
      files.push(full);
    }
  }
  return files;
}

function splitFirstTopLevelComma(value) {
  let depth = 0;
  let quote = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === '\\') {
        index += 1;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      return [value.slice(0, index), value.slice(index + 1)];
    }
  }
  return null;
}

function collectVariables(source) {
  const result = new Map();

  let searchFrom = 0;
  while ((searchFrom = source.indexOf('var(', searchFrom)) !== -1) {
    let depth = 1;
    let quote = '';
    let index = searchFrom + 4;
    for (; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') {
          index += 1;
        } else if (char === quote) {
          quote = '';
        }
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }
    const inner = source.slice(searchFrom + 4, index);
    const parts = splitFirstTopLevelComma(inner);
    if (parts) {
      const key = parts[0].trim();
      const fallback = parts[1].trim();
      if (!result.has(key)) {
        result.set(key, fallback);
      }
    }
    searchFrom = index + 1;
  }

  for (const match of source.matchAll(declarationPattern)) {
    const key = match[1];
    if (!result.has(key)) {
      result.set(key, match[2].trim());
    }
  }

  return result;
}

function inferType(property) {
  if (property === 'shadow') {
    return 'shadow';
  }
  if (
    /(radius|width|height|padding|margin|gap|size|length|font-size|line-height)/.test(
      property,
    )
  ) {
    return 'length';
  }
  if (
    /(background|text|title|label|value|meta|up|down|color|fill|status|line|dot|active)/.test(
      property,
    )
  ) {
    return 'color';
  }
  return 'text';
}

function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

const groups = new Map();

for (const root of scanRoots) {
  const files = walkLess(root.dir).sort();

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const variables = collectVariables(source);

    for (const [key, fallback] of variables) {
      const match = keyPattern.exec(key);
      if (!match || match[1] !== root.keyNamespace) {
        continue;
      }

      const component = match[2];
      const property = match[3];
      const groupId = `${root.namespace}:${component}`;
      const propertyDef = properties[property] ?? {};
      const field = {
        key,
        label: propertyDef.label ?? titleCase(property),
        type: propertyDef.type ?? inferType(property),
        default: fallback || propertyDef.default || '',
      };

      let group = groups.get(groupId);
      if (!group) {
        group = {
          namespace: root.namespace,
          component,
          fields: new Map(),
        };
        groups.set(groupId, group);
      }
      if (!group.fields.has(key)) {
        group.fields.set(key, field);
      }
    }
  }
}

const result = [...groups.values()].map((group) => {
  const overrideKey = `${group.namespace}:${group.component}`;
  const override = overrides[overrideKey] ?? {};
  const defaultSelector =
    group.namespace === 'emp'
      ? `emp-custom-${group.component}, .emp-custom-${group.component}`
      : `bt-${group.component}, .bt-${group.component}`;
  const defaultRootClass =
    group.namespace === 'emp'
      ? `.emp-custom-${group.component}`
      : `.bt-${group.component}`;
  const rootClass = override.rootClass ?? defaultRootClass;
  const fields = [...group.fields.values()];
  const autoRule = {
    selector: rootClass,
    declarations: fields.map((field) => ({
      property: field.key,
      field: field.key,
    })),
  };
  const extraRules = Array.isArray(override.classRules)
    ? override.classRules
    : [];

  return {
    id: `custom-${group.namespace}-${group.component}`,
    label: `自定义 · ${override.label ?? titleCase(group.component)}`,
    kind: 'custom',
    selector: override.selector ?? defaultSelector,
    previewTarget: group.namespace === 'emp' ? 'emp' : 'bike-tower',
    fields,
    classRules: fields.length ? [autoRule, ...extraRules] : extraRules,
  };
});

result.sort((a, b) => a.id.localeCompare(b.id));

const content = `// AUTO-GENERATED by scripts/generate-custom-skin-manifest.mjs
// Run \`npm run skins:manifest\` after adding or changing custom component variables.

import type { SkinGroup } from './skin-schema';

export const GENERATED_CUSTOM_GROUPS: SkinGroup[] = ${JSON.stringify(
  result,
  null,
  2,
)};
`;

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, content);

console.log(
  `Generated ${result.length} custom skin groups (${result.reduce(
    (total, group) => total + group.fields.length,
    0,
  )} fields) -> ${outputFile}`,
);
