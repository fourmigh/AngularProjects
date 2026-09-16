import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// 编译时方案：把源文件的译文注入 extract-i18n 产出的 messages.xlf，生成每语言 xlf。
// 目录结构由参数提供，脚本不写死项目路径。

const DEFAULT_SOURCE = 'i18n-source';
const DEFAULT_XLF_DIR = 'src/locale';
const DEFAULT_SOURCE_LANG = 'en';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    const match = /^--([^=]+)(?:=(.*))?$/.exec(token);
    if (!match) continue;
    if (match[2] !== undefined) {
      args[match[1]] = match[2];
    } else if (i + 1 < argv.length) {
      args[match[1]] = argv[++i];
    }
  }
  return args;
}

function usage() {
  console.log(
    `用法: node make-xlf.mjs [选项]\n\n` +
      `  --source <目录>        源目录（含 lang.json），默认 ${DEFAULT_SOURCE}\n` +
      `  --xlf-dir <目录>       xlf 目录，默认 ${DEFAULT_XLF_DIR}\n` +
      `  --source-lang <语言>   源语言（不参与 target 注入），默认 ${DEFAULT_SOURCE_LANG}\n` +
      `  --help                 显示帮助`,
  );
}

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

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const cwd = process.cwd();
  const sourceDir = resolve(cwd, args.source ?? DEFAULT_SOURCE);
  const xlfDir = resolve(cwd, args['xlf-dir'] ?? DEFAULT_XLF_DIR);
  const sourceLang = args['source-lang'] ?? DEFAULT_SOURCE_LANG;
  const sourceFile = join(sourceDir, 'lang.json');
  const xlfFile = join(xlfDir, 'messages.xlf');

  let data;
  try {
    data = JSON.parse(readFileSync(sourceFile, 'utf8'));
  } catch (err) {
    fail(`无法读取或解析源文件 ${sourceFile}: ${err.message}`);
  }

  let sourceXlf;
  try {
    sourceXlf = readFileSync(xlfFile, 'utf8');
  } catch (err) {
    fail(`未找到提取产物 ${xlfFile}，请先运行 npm run i18n:extract`);
  }

  const keys = Object.keys(data).filter((k) => k !== '_languagesOrder');
  const locales = Array.isArray(data._languagesOrder)
    ? data._languagesOrder.filter((l) => l !== sourceLang)
    : [];
  if (locales.length === 0) fail('_languagesOrder 中无 target locale');

  for (const locale of locales) {
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
    writeFileSync(join(xlfDir, `messages.${locale}.xlf`), out);
    console.log(`[i18n:make:xl] 已生成 messages.${locale}.xlf（注入 ${injected} 个 target）`);
  }
}

main();
