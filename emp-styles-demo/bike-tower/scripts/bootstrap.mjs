import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 由 `npm start` 的 prestart 调用：把「装库工程依赖 → 构建打包库 → 装 demo 依赖」自动补齐，
// 使首次/新环境也能一条 `npm start` 跑起来。已就绪时秒过。
// 设置 EMP_SKIP_BOOTSTRAP=1 可跳过。

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const libDir = join(appDir, '..', 'emp');
const packLib = join(here, 'pack-lib.mjs');

const cliManifest = (dir) =>
  join(dir, 'node_modules', '@angular', 'cli', 'package.json');
const libInstalled = () =>
  existsSync(
    join(appDir, 'node_modules', '@tikmac', 'emp-components', 'package.json'),
  );

function run(cmd, cwd) {
  console.log(`\n> ${cmd}\n  (cwd: ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

if (process.env.EMP_SKIP_BOOTSTRAP === '1') {
  console.log('[bootstrap] EMP_SKIP_BOOTSTRAP=1，跳过引导');
  process.exit(0);
}

try {
  const needApp = !existsSync(cliManifest(appDir));
  const needLib = !existsSync(cliManifest(libDir));

  if (!needApp && libInstalled()) {
    console.log('[bootstrap] 依赖已就绪，跳过引导');
    process.exit(0);
  }

  console.log('[bootstrap] 检测到需要引导，开始自动安装/构建...');

  if (needLib) {
    console.log('[bootstrap] 安装 emp 工程依赖...');
    run('npm install', libDir);
  }

  console.log('[bootstrap] 构建 emp-components 库并生成 emp-components-local.tgz ...');
  run(`node "${packLib}" --no-install`, appDir);

  if (needApp) {
    console.log('[bootstrap] 安装 bike-tower 依赖...');
    run('npm install --ignore-scripts', appDir);
  }

  console.log('[bootstrap] 安装最新 emp-components 包...');
  run('npm install ./emp-components-local.tgz', appDir);

  console.log('[bootstrap] 引导完成');
} catch (err) {
  console.error(`\n[bootstrap] 失败: ${err.message}`);
  process.exit(1);
}
