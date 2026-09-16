# i18n

Angular 运行时国际化模块：在 `@angular/localize` 的 `$localize` + `loadTranslations` 之上，
提供**免刷新切换语言**、**Intl 日期/数字/货币格式化**，以及可选的 **Monaco 翻译编辑器**。

## 构成

| 入口 | 内容 |
| --- | --- |
| `i18n` | `provideI18n()`、`LocaleService`、`I18nService`、`FormatService`、类型与配置 token |
| `i18n/editor` | `EditorComponent`（Monaco JSON 编辑器）、`I18N_EDITOR_TRANSLATE` |
| `scripts/split-i18n.mjs` | codegen（**随包发布**）：读取源目录，生成输出目录的 json / 类型 / 源消息 |
| `scripts/check-i18n-keys.mjs`、`scripts/make-xlf.mjs` | 仓库内工具（不进 npm 包），供本项目/联调使用 |

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
2. 建源目录（建议 `i18n-source/`），放入 `lang.json` 与 `languages-meta.json`：

   ```json
   // i18n-source/lang.json
   {
     "_languagesOrder": ["zh", "en", "de"],
     "demo.title": { "zh": "…", "en": "…", "de": "…" }
   }
   // i18n-source/languages-meta.json（值可为字符串或富对象，取 label → nativeName → name）
   { "zh": "中文", "en": "English", "de": "Deutsch" }
   ```
3. 运行 codegen（目录结构由参数指定，脚本不写死；`split-i18n.mjs` 随包发布）：

   ```bash
   node node_modules/i18n/scripts/split-i18n.mjs --source i18n-source --out src/assets/i18n
   # 生成 {lang}.json、languages-meta.json、i18n-keys.ts、source-messages.ts
   node ../i18n/projects/i18n/scripts/check-i18n-keys.mjs --source i18n-source --scan src --out src/assets/i18n
   ```

   参数：`--source`（默认 `i18n-source`）、`--out`（默认 `src/assets/i18n`）、`--source-lang`（默认 `en`）。
4. `angular.json` 的 assets 增加（只拷生成的 json，避免把生成 `.ts` 当静态资源）：

   ```json
   { "glob": "*.json", "input": "src/assets/i18n", "output": "/assets/i18n" }
   ```
5. 注册 provider：

   ```ts
   import { provideI18n } from 'i18n';
   import { SOURCE_MESSAGES } from './assets/i18n/source-messages';

   providers: [
     provideI18n({
       config: { manifestUrl: 'assets/i18n/languages-meta.json', localesBasePath: 'assets/i18n', defaultLocale: 'zh' },
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
| `manifestUrl` | `i18n/translations.json` | 语言清单/标签来源（推荐生成物 `assets/i18n/languages-meta.json`） |
| `localesBasePath` | `assets/locale` | 每语言译文目录（推荐 `assets/i18n`） |
| `defaultLocale` | `en` | 默认语言 |
| `storagePrefix` | `i18n` | localStorage key 前缀 |
| `defaultCurrency` | `EUR` | 默认货币代码 |
