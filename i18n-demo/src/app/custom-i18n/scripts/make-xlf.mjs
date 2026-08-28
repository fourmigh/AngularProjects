import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_ROOT = join(MODULE, '..', '..', '..');
const SOURCE = join(MODULE, 'i18n', 'translations.json');
const XLF_DIR = join(PROJECT_ROOT, 'src', 'locale');
const XLF = join(XLF_DIR, 'messages.xlf');
const LOCALES = ['zh', 'de'];

function fail(message) {
  console.error(`[i18n:make:xl] ${message}`);
  process.exit(1);
}

function escXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toTarget(text) {
  let n = 0;
  return text
    .split(/(\{\$[A-Za-z0-9_]+\})/)
    .map((part) => {
      const m = /^\{\$([A-Za-z0-9_]+)\}$/.exec(part);
      if (m) return `<ph id="${n++}" equiv="${m[1]}"/>`;
      return escXml(part);
    })
    .join('');
}

let data;
try {
  data = JSON.parse(readFileSync(SOURCE, 'utf8'));
} catch (err) {
  fail(`无法读取或解析主文件 ${SOURCE}: ${err.message}`);
}

let sourceXlf;
try {
  sourceXlf = readFileSync(XLF, 'utf8');
} catch (err) {
  fail(`未找到提取产物 ${XLF}，请先运行 npm run i18n:extract`);
}

const keys = Object.keys(data).filter((k) => k !== '$languages' && k !== '$languageLabels');
for (const locale of LOCALES) {
  let out = sourceXlf;
  let injected = 0;
  for (const key of keys) {
    const unitRe = new RegExp(`<unit[^>]*\\bid="${key}"[^>]*>[\\s\\S]*?</unit>`);
    const unit = unitRe.exec(out)?.[0];
    if (!unit) continue;
    const value = data[key]?.[locale];
    if (typeof value !== 'string' || value.trim() === '') {
      fail(`key "${key}" 缺少语言 "${locale}" 的翻译`);
    }
    const newUnit = unit.replace('</source>', `</source><target>${toTarget(value)}</target>`);
    out = out.replace(unit, newUnit);
    injected++;
  }
  writeFileSync(join(XLF_DIR, `messages.${locale}.xlf`), out);
  console.log(`[i18n:make:xl] 已生成 messages.${locale}.xlf（注入 ${injected} 个 target）`);
}
