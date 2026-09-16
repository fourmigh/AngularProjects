# i18n

Angular 运行时国际化模块：在 `@angular/localize` 的 `$localize` + `loadTranslations` 之上，
提供**免刷新切换语言**、**Intl 日期/数字/货币格式化**，以及可选的 **Monaco 翻译编辑器**。

## 构成

| 入口 | 内容 |
| --- | --- |
| `i18n` | `provideI18n()`、`LocaleService`、`I18nService`、`FormatService`、类型与配置 token |
| `i18n/editor` | `EditorComponent`（Monaco JSON 编辑器）、`I18N_EDITOR_TRANSLATE` |
| `scripts/*.mjs` | codegen：`check-i18n-keys` / `split-i18n` / `make-xlf` |

## 重要：如何被消费

**必须从 `node_modules` 解析**（`npm install` 或本地 `npm pack` 后安装）。
Angular 的库链接器（linker）只处理 `node_modules` 下的库产物；
若用 `tsconfig` 的 `paths` 直接指向库源码或工作区外目录，组件在 production 下会因缺少注入上下文报 `NG0203`。

本地联调流程（在消费工程里执行）：

- **首次 / 新环境**：`npm start` 会自动引导（装库工程依赖 → 构建打包 → 装消费工程依赖 → 启动）。
- **改了库代码后**：`npm run lib:pack`，再 `npm start`。
- 强制跳过引导：`I18N_SKIP_BOOTSTRAP=1 npm start`。

`lib:pack` 会：构建库 → 在 `dist` 注入 `0.0.1-build.<时间戳>` 版本 → 打包为固定名 `i18n-local.tgz` → 安装到消费工程。
消费工程的依赖写 `"i18n": "file:i18n-local.tgz"`（路径不含版本号）；
需要发布里程碑版本时，手动修改 `i18n/projects/i18n/package.json` 的 `version`。

> 注意：tarball 内容变化会更新消费工程 `package-lock.json` 中该依赖的 integrity，属预期。

## 接入步骤（以一个消费工程为例）

1. 让工程依赖上本包（`npm install` / `file:` / 本地 tgz）。
2. 建绑定目录（默认 `src/app/i18n-bindings/`），放入 `translations.json`：

   ```json
   {
     "$languages": ["zh", "en", "de"],
     "$languageLabels": { "zh": "中文", "en": "English", "de": "Deutsch" },
     "demo.title": { "zh": "…", "en": "…", "de": "…" }
   }
   ```
3. 运行 codegen（脚本通过 `I18N_DIR` 定位绑定目录，默认 `src/app/i18n-bindings`）：

   ```bash
   node node_modules/i18n/scripts/split-i18n.mjs      # 生成 i18n-keys.ts / source-messages.ts / locale/*.json
   node node_modules/i18n/scripts/check-i18n-keys.mjs # 校验键与译文齐全
   ```
4. `angular.json` 的 assets 增加：

   ```json
   { "glob": "**/*", "input": "src/app/i18n-bindings/locale", "output": "/assets/locale" },
   { "glob": "translations.json", "input": "src/app/i18n-bindings", "output": "/i18n" }
   ```
5. 注册 provider：

   ```ts
   import { provideI18n } from 'i18n';
   import { SOURCE_MESSAGES } from './i18n-bindings/source-messages';

   providers: [
     provideI18n({
       config: { manifestUrl: 'i18n/translations.json', localesBasePath: 'assets/locale', defaultLocale: 'zh' },
       sourceMessages: SOURCE_MESSAGES,
     }),
   ]
   ```
6. 启动时加载译文（`APP_INITIALIZER`，需在路由前完成语言清单加载）：

   ```ts
   {
     provide: APP_INITIALIZER, multi: true, deps: [LocaleService, I18nService],
     useFactory: (locale: LocaleService, i18n: I18nService) => async () => {
       await locale.fetchLanguages();
       await i18n.init();
     },
   }
   ```
7. 页面用强类型门面（可在应用侧用生成类型收窄 `t()`）：

   ```ts
   export type AppI18n = Omit<I18nService, 't' | 'label' | 'lookup'> & {
     t(key: TranslationKey, params?: Record<string, string | number>): string;
     label(key: TranslationKey): string;
   };
   export const APP_I18N = new InjectionToken<AppI18n>('APP_I18N');
   // providers: { provide: APP_I18N, useFactory: (i18n: I18nService) => i18n as AppI18n, deps: [I18nService] }
   ```

## API 摘要

- `LocaleService`：`locale`、`availableLanguages`、`languageLabels`、`setLocale`、`fetchLanguages`、`isRouteLang`
- `I18nService`：`init`、`t/label/lookup`、`setLocale/switchLanguage`、`locale/current`、`ready`、`renderTick`、编辑器方法（`getMergedContent/applyEdited/resetMerged/downloadMerged`）
  - `importTranslations(locale, entries)` / `clearRuntimeTranslations(locale?)`：导入运行期翻译（`{ key: 文案 }`），
    供服务端等动态来源使用。`t/label/lookup` 在源消息缺失时按「当前语言 → defaultLocale」回退查询该表。
    运行时表与 `$localize` 的 `loadTranslations` 相互独立，`clearTranslations()` 不会清除它；导入后自动触发一次视图刷新。
- `FormatService`（`i18n.format`）：`date / number / currency / percent / relative / list / plural`
  - `currency(value, { currency?, withSymbol? })`：默认货币取配置，`withSymbol:false` 输出纯数字但保留该货币小数位
- 文案切换机制：`applyLocale` 会 `clearTranslations()` + `loadTranslations()` 并让 `renderTick + 1`；
  模板用 `@for (bounce of [i18n.renderTick()]; track bounce)` 包裹需要刷新的内容以重建视图。

## 可选编辑器

```ts
import { EditorComponent, I18N_EDITOR_TRANSLATE } from 'i18n/editor';

// 宿主需提供翻译函数；Monaco worker 由宿主设置（推荐在只在运行时加载的模块里）
providers: [
  { provide: I18N_EDITOR_TRANSLATE, useFactory: (i18n: I18nService) => (k: string) => i18n.t(k), deps: [I18nService] },
]
```

`monaco-editor` 是可选 peer 依赖；不引入 `i18n/editor` 就不会带入 Monaco。

## 配置项（`provideI18n({ config })`）

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `manifestUrl` | `i18n/translations.json` | 语言清单/标签来源 |
| `localesBasePath` | `assets/locale` | 每语言译文目录 |
| `defaultLocale` | `en` | 默认语言 |
| `storagePrefix` | `i18n` | localStorage key 前缀 |
| `defaultCurrency` | `EUR` | 默认货币代码 |
