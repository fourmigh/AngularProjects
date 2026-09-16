import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

// 校验：源文件里的翻译键是否齐全、是否都在源码中被使用。
// 目录结构由参数提供，脚本不写死项目路径。

const DEFAULT_SOURCE = 'i18n-source';
const DEFAULT_SCAN = 'src';
const DEFAULT_OUT = 'src/assets/i18n';
const SKIP_DIRS = new Set(['node_modules', '.angular', 'dist']);

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
    `用法: node check-i18n-keys.mjs [选项]\n\n` +
      `  --source <目录>   源目录（含 lang.json），默认 ${DEFAULT_SOURCE}\n` +
      `  --scan <目录>     扫描源码的目录，默认 ${DEFAULT_SCAN}\n` +
      `  --out <目录>      生成物目录（扫描时排除），默认 ${DEFAULT_OUT}\n` +
      `  --help            显示帮助`,
  );
}

function collectFiles(dir, excluded) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      if (excluded.some((e) => full === e || full.startsWith(e + sep))) continue;
      files.push(...collectFiles(full, excluded));
    } else if (extname(full) === '.ts' || extname(full) === '.html') {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const cwd = process.cwd();
  const sourceDir = resolve(cwd, args.source ?? DEFAULT_SOURCE);
  const scanDir = resolve(cwd, args.scan ?? DEFAULT_SCAN);
  const outDir = resolve(cwd, args.out ?? DEFAULT_OUT);
  const sourceFile = join(sourceDir, 'lang.json');

  let data;
  try {
    data = JSON.parse(readFileSync(sourceFile, 'utf8'));
  } catch (err) {
    console.error(`[i18n:check] 无法读取或解析源文件 ${sourceFile}: ${err.message}`);
    process.exit(1);
  }

  const validKeys = new Set(Object.keys(data).filter((k) => k !== '_languagesOrder'));

  const idRegex = /@@([A-Za-z0-9._-]+)/g;
  const labelRegex = /\b(?:label|t)\s*\(\s*['"`]([^'"`]+)['"`]/g;

  const usedKeys = new Set();
  const errors = [];

  for (const file of collectFiles(scanDir, [outDir])) {
    const relativePath = relative(cwd, file);
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const report = (line, text, key) => {
      if (validKeys.has(key)) {
        usedKeys.add(key);
      } else {
        errors.push(`${relativePath}:${line} → "${text}" 中的 key 不存在: ${key}`);
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

  const languages = Array.isArray(data._languagesOrder) ? data._languagesOrder : [];
  const missingErrors = [];
  for (const key of usedKeys) {
    const entry = data[key];
    for (const lang of languages) {
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
  if (orphan.length > 0) {
    console.warn(
      `[i18n:check] 警告: 以下 ${orphan.length} 个 key 在源文件中但源码未使用: ${orphan.join(', ')}`,
    );
  }
  console.log(
    `[i18n:check] 通过: ${validKeys.size} 个 key，源码使用 ${usedKeys.size} 个` +
      `${orphan.length > 0 ? `，孤儿 ${orphan.length} 个` : ''}`,
  );
}

main();
