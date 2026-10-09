import { execSync } from 'node:child_process';
import {
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 从 bike-tower 侧构建 emp-components 库、注入 build 版本、打包为固定名并安装。
// 源 projects/emp-components/package.json 的 version 不会被修改。

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const libDir = join(appDir, '..', 'emp');
const libDistDir = join(libDir, 'dist', 'emp-components');
const distPkgPath = join(libDistDir, 'package.json');
const fixedTgz = join(appDir, 'emp-components-local.tgz');
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

try {
  run('npx ng build emp-components', libDir);

  const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
  const base = pkg.version;
  pkg.version = `${base}-build.${stamp()}`;
  writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`[lib:pack] 版本: ${base} -> ${pkg.version}`);

  run(`npm pack --pack-destination "${appDir}"`, libDistDir);

  const candidates = readdirSync(appDir)
    .filter((f) => /^tikmac-emp-components-.*\.tgz$/.test(f))
    .map((f) => join(appDir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  const packed = candidates[0];
  if (!packed) {
    throw new Error('未找到 npm pack 产物（tikmac-emp-components-*.tgz）');
  }
  rmSync(fixedTgz, { force: true });
  renameSync(packed, fixedTgz);
  console.log(`[lib:pack] 产物: ${fixedTgz}`);

  if (noInstall) {
    console.log(`\n[lib:pack] 完成（--no-install，未安装到 node_modules）`);
    process.exit(0);
  }

  rmSync(join(appDir, 'node_modules', '@tikmac'), {
    recursive: true,
    force: true,
  });
  run('npm install ./emp-components-local.tgz', appDir);

  console.log(`\n[lib:pack] 完成: ${pkg.version}`);
} catch (err) {
  console.error(`\n[lib:pack] 失败: ${err.message}`);
  process.exit(1);
}
