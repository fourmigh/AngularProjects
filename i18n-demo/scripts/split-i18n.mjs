import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LANGUAGES = ['zh', 'en', 'de'];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'src', 'i18n', 'translations.json');
const OUT_DIR = join(ROOT, 'src', 'assets', 'locale');

function fail(message) {
  console.error(`[i18n:split] ${message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(SOURCE, 'utf8'));
} catch (err) {
  fail(`无法读取或解析主文件 ${SOURCE}: ${err.message}`);
}

if (typeof data !== 'object' || data === null || Array.isArray(data)) {
  fail(`主文件顶层必须是对象: ${SOURCE}`);
}

const selected = data.$languages ?? LANGUAGES;
if (!Array.isArray(selected) || selected.some((l) => !LANGUAGES.includes(l))) {
  fail(`"$languages" 必须是 ${LANGUAGES.join('/')} 的子集数组`);
}
const targets = [...new Set(selected)];

const result = Object.fromEntries(targets.map((lang) => [lang, {}]));
let warned = false;

for (const [key, entry] of Object.entries(data)) {
  if (key === '$languages') continue;
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    fail(`翻译键 "${key}" 的值必须是对象（{ 语言: 文本 }）`);
  }
  for (const lang of targets) {
    const value = entry[lang];
    if (value === undefined) {
      console.warn(`[i18n:split] 警告: "${key}" 缺少语言 "${lang}"，已跳过`);
      warned = true;
      continue;
    }
    if (typeof value !== 'string') {
      fail(`翻译键 "${key}" 的语言 "${lang}" 的值必须是字符串`);
    }
    result[lang][key] = value;
  }
}

mkdirSync(OUT_DIR, { recursive: true });
for (const file of readdirSync(OUT_DIR)) {
  if (!file.endsWith('.json')) continue;
  const lang = file.slice(0, -'.json'.length);
  if (!targets.includes(lang)) {
    rmSync(join(OUT_DIR, file));
    console.log(`[i18n:split] 已删除多余文件: ${file}`);
  }
}

for (const lang of targets) {
  writeFileSync(join(OUT_DIR, `${lang}.json`), JSON.stringify(result[lang], null, 2) + '\n');
}

console.log(`[i18n:split] 已生成 ${targets.length} 个语言文件: ${targets.join(', ')}`);
if (warned) console.warn('[i18n:split] 存在缺失语言键的警告，请检查主文件');
