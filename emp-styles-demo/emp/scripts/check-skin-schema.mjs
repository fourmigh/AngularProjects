#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const empRoot = resolve(scriptDir, '..');
const schemaFile = resolve(
  empRoot,
  'src/app/pages/skin-editor/skin-schema.ts',
);
const baseFile = resolve(
  empRoot,
  'projects/emp-components/src/lib/styles/base.less',
);

const schema = readFileSync(schemaFile, 'utf8');
const base = readFileSync(baseFile, 'utf8');

const keyPattern = /'(--emp-[\w-]+)'/g;
const schemaKeys = new Set();
for (const match of schema.matchAll(keyPattern)) {
  if (
    !match[1].startsWith('--emp-bt-') &&
    !match[1].startsWith('--emp-custom-')
  ) {
    schemaKeys.add(match[1]);
  }
}

const baseKeys = new Set();
for (const match of base.matchAll(/(--emp-[\w-]+)\s*:/g)) {
  baseKeys.add(match[1]);
}

const missingInBase = [...schemaKeys].filter((key) => !baseKeys.has(key));
const missingInSchema = [...baseKeys].filter((key) => !schemaKeys.has(key));

if (missingInBase.length || missingInSchema.length) {
  if (missingInBase.length) {
    console.error('base.less 缺少键值:');
    for (const key of missingInBase) {
      console.error(`  - ${key}`);
    }
  }
  if (missingInSchema.length) {
    console.error('skin-schema.ts 缺少键值:');
    for (const key of missingInSchema) {
      console.error(`  - ${key}`);
    }
  }
  process.exit(1);
}

console.log(
  `皮肤键值一致：schema ${schemaKeys.size} 项，base.less ${baseKeys.size} 项`,
);
