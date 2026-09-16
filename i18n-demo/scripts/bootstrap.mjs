import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 由 `npm start` 的 prestart 调用：把「装库工程依赖 → 构建打包库 → 装 demo 依赖」自动补齐，
// 使首次/新环境也能一条 `npm start` 跑起来。已就绪时秒过。
// 设置 I18N_SKIP_BOOTSTRAP=1 可跳过本引导。

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = join(here, '..');
const libDir = join(demoDir, '..', 'i18n');
const packLib = join(here, 'pack-lib.mjs');

const cliManifest = (dir) => join(dir, 'node_modules', '@angular', 'cli', 'package.json');
const libInstalled = () => existsSync(join(demoDir, 'node_modules', 'i18n', 'package.json'));

function run(cmd, cwd) {
  console.log(`\n> ${cmd}\n  (cwd: ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

if (process.env.I18N_SKIP_BOOTSTRAP === '1') {
  console.log('[bootstrap] I18N_SKIP_BOOTSTRAP=1，跳过引导');
  process.exit(0);
}

try {
  const needDemo = !existsSync(cliManifest(demoDir));
  const needLib = !existsSync(cliManifest(libDir));

  if (!needDemo && libInstalled()) {
    console.log('[bootstrap] 依赖已就绪，跳过引导');
    process.exit(0);
  }

  console.log('[bootstrap] 检测到需要引导，开始自动安装/构建...');

  if (needDemo) {
    if (needLib) {
      console.log('[bootstrap] 安装 i18n 工程依赖...');
      run('npm install', libDir);
    }
    console.log('[bootstrap] 构建 i18n 库并生成 i18n-local.tgz ...');
    run(`node "${packLib}" --no-install`, demoDir);
    console.log('[bootstrap] 安装 i18n-demo 依赖...');
    run('npm install', demoDir);
    console.log('[bootstrap] 安装最新 i18n 包...');
    run('npm install ./i18n-local.tgz', demoDir);
  } else {
    // demo 依赖已装，但缺少 i18n 包
    if (needLib) {
      console.log('[bootstrap] 安装 i18n 工程依赖...');
      run('npm install', libDir);
    }
    console.log('[bootstrap] 构建 i18n 库并生成 i18n-local.tgz ...');
    run(`node "${packLib}" --no-install`, demoDir);
    run('npm install ./i18n-local.tgz', demoDir);
  }

  console.log('[bootstrap] 引导完成');
} catch (err) {
  console.error(`\n[bootstrap] 失败: ${err.message}`);
  process.exit(1);
}
