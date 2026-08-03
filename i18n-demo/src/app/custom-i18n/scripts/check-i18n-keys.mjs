import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(MODULE, 'i18n', 'translations.json');
const PROJECT_ROOT = join(MODULE, '..', '..', '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');
const SKIP_DIRS = new Set(['node_modules', '.angular', 'dist']);

function collectFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      files.push(...collectFiles(full));
    } else if (extname(full) === '.ts' || extname(full) === '.html') {
      files.push(full);
    }
  }
  return files;
}

let data;
try {
  data = JSON.parse(readFileSync(SOURCE, 'utf8'));
} catch (err) {
  console.error(`[i18n:check] 无法读取或解析主文件 ${SOURCE}: ${err.message}`);
  process.exit(1);
}

const validKeys = new Set(Object.keys(data).filter((k) => k !== '$languages'));

const idRegex = /@@([A-Za-z0-9._-]+)/g;
const labelRegex = /\b(?:label|t)\s*\(\s*['"`]([^'"`]+)['"`]/g;

const usedKeys = new Set();
const errors = [];

for (const file of collectFiles(SRC_DIR)) {
  const relative = file.slice(PROJECT_ROOT.length + 1);
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const report = (line, text, key) => {
    if (validKeys.has(key)) {
      usedKeys.add(key);
    } else {
      errors.push(`${relative}:${line} → "${text}" 中的 key 不存在: ${key}`);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let match;
    idRegex.lastIndex = 0;
    while ((match = idRegex.exec(lines[i])) !== null) {
      report(i + 1, lines[i].trim(), match[1]);
    }
    labelRegex.lastIndex = 0;
    while ((match = labelRegex.exec(lines[i])) !== null) {
      report(i + 1, lines[i].trim(), match[1]);
    }
  }
}

if (errors.length > 0) {
  for (const err of errors) console.error(`[i18n:check] ${err}`);
  console.error(`[i18n:check] 发现 ${errors.length} 个错误 key，请修复后重试`);
  process.exit(1);
}

const LANGUAGES = ['zh', 'en', 'de'];
const missingErrors = [];
for (const key of usedKeys) {
  const entry = data[key];
  for (const lang of LANGUAGES) {
    if (typeof entry?.[lang] !== 'string' || entry[lang].trim() === '') {
      missingErrors.push(`key "${key}" 缺少语言 "${lang}" 的翻译`);
    }
  }
}
if (missingErrors.length > 0) {
  for (const e of missingErrors) console.error(`[i18n:check] 错误: ${e}`);
  console.error(`[i18n:check] 发现 ${missingErrors.length} 处缺失翻译，请补齐后重试`);
  process.exit(1);
}

const orphan = [...validKeys].filter((k) => !usedKeys.has(k));
const countLabel = validKeys.size;
const usedLabel = usedKeys.size;
if (orphan.length > 0) {
  console.warn(`[i18n:check] 警告: 以下 ${orphan.length} 个 key 在 translations.json 中但源码未使用: ${orphan.join(', ')}`);
}
console.log(`[i18n:check] 通过: ${countLabel} 个 key，源码使用 ${usedLabel} 个${orphan.length > 0 ? `，孤儿 ${orphan.length} 个` : ''}`);
