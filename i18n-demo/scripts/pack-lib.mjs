import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 从 i18n-demo 侧构建 i18n 库、注入 build 版本、打包为固定名并重装。
// 源 projects/i18n/package.json 的 version 不会被修改；
// 版本里程碑请手动修改它（例如 0.0.1 -> 0.1.0 -> 1.0.0）。

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, '..');
const libDir = join(demoDir, '..', 'i18n');
const libDistDir = join(libDir, 'dist', 'i18n');
const distPkgPath = join(libDistDir, 'package.json');
const fixedTgz = join(demoDir, 'i18n-local.tgz');
const noInstall = process.argv.includes('--no-install');

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

function gitShort() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: libDir }).toString().trim();
  } catch {
    return '';
  }
}

function findPackedTgz(expected) {
  if (existsSync(expected)) return expected;
  const candidates = readdirSync(demoDir)
    .filter((f) => /^i18n-.*\.tgz$/.test(f) && f !== 'i18n-local.tgz')
    .map((f) => join(demoDir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0];
}

try {
  run('npx ng build i18n', libDir);

  const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
  const base = pkg.version;
  const hash = gitShort();
  pkg.version = `${base}-build.${stamp()}${hash ? `.${hash}` : ''}`;
  writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`[lib:pack] 版本: ${base} -> ${pkg.version}`);

  run(`npm pack --pack-destination "${demoDir}"`, libDistDir);

  const packed = findPackedTgz(join(demoDir, `i18n-${pkg.version}.tgz`));
  if (!packed) throw new Error('未找到 npm pack 产物（i18n-*.tgz）');
  rmSync(fixedTgz, { force: true });
  renameSync(packed, fixedTgz);
  console.log(`[lib:pack] 产物: ${fixedTgz}`);

  if (noInstall) {
    console.log(`\n[lib:pack] 完成（--no-install，未安装到 node_modules）: ${pkg.version}`);
    process.exit(0);
  }

  rmSync(join(demoDir, 'node_modules', 'i18n'), { recursive: true, force: true });
  run('npm install ./i18n-local.tgz', demoDir);

  console.log(`\n[lib:pack] 完成: ${pkg.version}`);
} catch (err) {
  console.error(`\n[lib:pack] 失败: ${err.message}`);
  process.exit(1);
}
