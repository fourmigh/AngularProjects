# emp-styles-demo

验证 **emp-components 共享皮肤方案** 的工作区：

- `emp/`：库工作区（`@tikmac/emp-components`）+ emp-ui 宿主应用 + 皮肤编辑器
- `bike-tower/`：消费方应用，包含全部组件的展示页和 3 个自定义业务组件
- `design/`：默认皮肤配色的来源（Nextcloud 页面）

## 核心概念

**一套皮肤 = 一个 `.less` 文件**。皮肤文件只包含 CSS 变量：

```less
/* emp skin: nextcloud */
:root {
  --emp-color-primary: #00679e;
  --emp-card-bg: #ffffff;
  --emp-card-border-color: #dbdbdb;
  --emp-card-radius: 12px;
  /* ... */
}
```

组件和页面样式引用这些变量，因此：

- 替换皮肤文件即可整体换肤
- emp 与 bike-tower 可以共用同一份皮肤文件
- 同一类组件只维护一组键值，例如所有卡片共用 `--emp-card-*`

编辑器也支持导出 **Class 属性格式**：每个组件一个 class，使用普通
`background` / `border` / `border-radius` 等属性，便于阅读和给自定义组件复用。

默认皮肤（Nextcloud 配色）直接内联在库的 `base.less` 中，所以不引入任何皮肤文件也能正常显示。

## 目录结构

```
emp-styles-demo/
  build.sh
  emp/
    projects/emp-components/src/lib/
      styles/
        base.less                 # 全部 --emp-* 默认值 + html/body + .emp-app-frame
        index.less                # @import './base.less'
      card/ button/ input/ select/ check/ table/ tabs/
      badge/ alert/ dialog/ toolbar/ pagination/ empty/
    src/
      app/components/             # emp-ui 自定义组件 emp-custom-*
      app/pages/showcase/         # emp 侧组件展示页
      app/pages/skin-editor/      # 皮肤编辑器（路由懒加载）
        skin-schema.ts            # 静态键值 + 导入生成的 custom groups
        skin-serializer.ts        # 导入/导出变量格式 .less
        skin-classes.ts           # 根据 classRules 生成 Class 属性格式 .less
        custom-skin.generated.ts  # 自动扫描生成的自定义组件清单
        skin-editor.service.ts    # 皮肤状态、草稿、预设
        skin-editor.component.*
      styles/skins/current.less   # 唯一皮肤文件（global + scoped）
      styles.less                 # @import 库基础样式 + current.less
    public/skins/dark.less        # 第二套皮肤示例
    scripts/
      check-skin-schema.mjs       # 校验 schema 与 base.less 键值一致
      generate-custom-skin-manifest.mjs
      skin-properties.json        # 属性名 -> label/type
      custom-skin-overrides.json  # 组件 label/selector/额外规则
  bike-tower/
    src/app/components/           # bike-tower 自定义组件 bt-device-card / bt-activity-timeline
    src/app/pages/home/           # 皮肤系统教学首页
    src/app/pages/showcase/       # 全部组件 + 自定义组件的展示页（编辑器预览）
    src/app/pages/compare/        # 并排对比 / 无皮肤 / 有皮肤
    src/styles/skins/current.less # 唯一皮肤文件（global + scoped，当前 dark）
    src/styles/raw.less           # plain 页视觉重置
    src/styles/theme.less         # @import '@tikmac/emp-components/styles/index.less'
    src/skin-bridge.ts            # 接收编辑器 postMessage，注入皮肤与高亮
    src/styles.less
```

## 皮肤键值

键值按组件/页面分组，每项包含背景、边框、圆角、颜色、内边距、阴影等：

| 分组 | 示例键值 |
| --- | --- |
| 全局配色 | `--emp-color-primary`、`--emp-color-text`、`--emp-color-border`、状态色 |
| 字体与圆角 | `--emp-font-family`、`--emp-font-size-base`、`--emp-radius-md` |
| 页面与应用框架 | `--emp-app-outer-bg`、`--emp-app-inset`、`--emp-page-bg` |
| 卡片 | `--emp-card-bg`、`--emp-card-border-color`、`--emp-card-radius` |
| 按钮 | `--emp-button-bg`、`--emp-button-radius`、`--emp-button-hover-bg` |
| 输入框 / 选择框 / 勾选开关 | `--emp-input-*`、`--emp-select-*`、`--emp-check-*` |
| 表格 / 标签页 / 徽标 / 提示 / 弹窗 / 工具栏 / 分页 / 空状态 | `--emp-<component>-*` |
| emp-ui 自定义组件 | `--emp-custom-<component>--<property>` |
| bike-tower 自定义组件 | `--emp-bt-<component>--<property>` |

完整清单见 `emp/src/app/pages/skin-editor/skin-schema.ts`；默认值见 `base.less`。
运行 `cd emp && npm run check:skin` 可校验两者是否一致。

## 启动

推荐在 **WSL（Ubuntu）** 中开发：

```bash
cd /mnt/f/Github/AngularProjects/emp-styles-demo
./build.sh all --serve=all        # 构建库 + 启动 emp-ui 与 bike-tower
```

或分开执行：

```bash
./build.sh lib                    # 构建库、打包并安装进 bike-tower
./build.sh serve emp-ui           # http://127.0.0.1:4201
./build.sh serve bike-tower       # http://127.0.0.1:4210
./build.sh serve all
```

`serve` 在前台运行，按 `Ctrl-C` 停止全部服务。

启动脚本会轮询端口，只有两个服务都返回 HTTP 200 后才打印
`Stack is up`。首次在 `/mnt/f` 上编译可能需要几分钟，默认等待 300 秒，可通过
`EMP_WAIT_TIMEOUT` 调整：

```bash
EMP_WAIT_TIMEOUT=600 ./build.sh all --serve=all
```

Windows 浏览器建议使用 `127.0.0.1`，避免 `localhost` 优先解析到 IPv6 `::1`。

> 部分 Windows 环境中 4200 被系统服务 `iphlpsvc` 占用，因此 bike-tower 使用 **4210**。

### Windows / WSL 依赖不能共用

Angular 22 使用 `rolldown`、`oxc-parser`、`esbuild`、`lightningcss` 等原生模块。
Windows 和 WSL 的 `node_modules` 平台不兼容，直接复用会报
`Cannot find native binding`。

`build.sh` 会检测当前平台的原生模块是否可用；不可用时会自动删除
`node_modules` 并执行 `npm ci`。也可以手动执行：

```bash
cd emp && rm -rf node_modules && npm ci
cd ../bike-tower && rm -rf node_modules && npm ci
```

不要在两个平台之间来回共用同一份 `node_modules`。

## 皮肤编辑器

打开 `http://127.0.0.1:4201/skin-editor`。

- 左栏：按页面/组件/自定义组件分组，显示已修改数量，支持搜索
- 中间：iframe 实时预览 `bike-tower /showcase`（也可切换到 `emp /showcase`）
- 右栏：编辑当前分组的背景、边框、圆角、颜色、尺寸、阴影、字体等
- 顶部：
  - 切换内置默认皮肤或已保存皮肤
  - 保存 / 删除本地皮肤草稿（`localStorage`）
  - 导入 `.less` 皮肤文件
  - 载入 `public/skins/dark.less` 示例
  - 切换预览目标
  - 导出

编辑即时生效：同源（emp）直接注入 `<style>`，跨域（bike-tower）通过 `postMessage` 由 `skin-bridge.ts` 注入。

## 导出到项目

导出格式有两种，可在导出弹窗中切换：

- **Class 属性（默认）**：每个组件一个 class，里面是普通 CSS 属性
  （`background`、`border`、`border-radius`、`box-shadow` 等）
- **分组变量**：按组件分块的 `--emp-*` CSS 变量，输出 `:root`，始终全局生效

Class 格式示例：

```less
.emp-card {
  background: #ffffff !important;
  border: 1px solid #dbdbdb !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
  padding: 16px !important;
  color: #6b6b6b !important;
}

.emp-card__title {
  color: #222222 !important;
}

.emp-card:hover {
  background: #f5f5f5 !important;
}
```

Class 格式使用 `!important` 覆盖组件默认样式，因此基础组件不需要改动，自定义组件只要加对应
class 即可复用。

点击「导出」后：

- **下载 .less**：生成 `<name>.less`
- **写入 emp / 写入 bike-tower**：用 File System Access API 选择项目根目录，写入
  `src/styles/skins/<文件名>.less`，并幂等维护 `src/styles.less` 中的
  `@import './styles/skins/<文件名>.less';`

写入后需要重启对应的 dev server（Less 在构建期编译）。需要 Chrome / Edge 且通过 `localhost` 访问。

Class 格式支持四种「作用域」：

- **单文件（global + scoped，默认）**：同一个文件同时生成排除段和 `.emp-skin` 段
- **仅全局（排除 `data-skin-off`）**：默认页面应用皮肤，路由 `data.skin === false` 的页面跳过
- **仅 `.emp-skin`**：只作用于带 `emp-skin` class 的容器
- **全局（无排除）**：不带任何排除条件

单文件模式示例：

```less
/* 正常页面 */
body:not([data-skin-off]) .emp-card {
  background: #ffffff !important;
  ...
}

/* 并排页右栏 */
.emp-skin .emp-card {
  background: #ffffff !important;
  ...
}
```

单文件模式导出一次，正常页面和并排页右栏都会同步。

页面跳过皮肤：

```ts
{
  path: 'compare/plain',
  component: PlainCompareComponent,
  data: { skin: false },
}
```

`skinGuard` 在路由激活前给 `<body>` 切换 `data-skin-off`。
页面组件不需要 import 任何指令。

## 样式对比页面

bike-tower 首页是皮肤系统教学页，提供编辑器入口和对比页入口：

- 首页：`http://127.0.0.1:4210/`
- 组件展示：`http://127.0.0.1:4210/showcase`
- 并排对比：`http://127.0.0.1:4210/compare`
- 无皮肤：`http://127.0.0.1:4210/compare/plain`
- 有皮肤：`http://127.0.0.1:4210/compare/skinned`
- 编辑器：`http://127.0.0.1:4201/skin-editor`

首页路由使用 `data: { skin: false }`，保持稳定的教学页样式。

无皮肤页面使用 `.emp-raw` 做视觉重置：背景、边框、圆角、阴影、颜色、字体
回到浏览器默认，保留基本布局，页面由外层滚动容器滚动。

默认皮肤是 `current.less` 中的 **dark**（global + scoped 两段）。
编辑器默认加载**浅色 Nextcloud** 值。导出浅色并重启 dev server 后，
`/compare/skinned`、`/compare` 右栏和 `/showcase` 会从 dark 切换到浅色。

并排对比页左右两栏复用同一个 `<app-showcase />`，共用一个纵向滚动容器，
滚动时两栏天然同步。左栏使用 `.emp-raw`，右栏使用 `current.less` 中的
`.emp-skin` 段：

```html
<div class="compare">
  <app-compare-nav />
  <div class="compare__scroll">
    <div class="compare__grid">
      <section class="compare__pane">
        <div class="compare__pane-title">无皮肤</div>
        <div class="emp-raw">
          <app-showcase [embedded]="true" />
        </div>
      </section>
      <section class="compare__pane">
        <div class="compare__pane-title">有皮肤</div>
        <div class="emp-skin">
          <app-showcase [embedded]="true" />
        </div>
      </section>
    </div>
  </div>
</div>
```

- 该路由配置 `data: { skin: false }`，避免全局皮肤影响左栏
- 右栏加 `.emp-skin`，使用 `current.less` 中的 scoped 段
- 左栏 `.emp-raw`，使用浏览器默认样式

单独的无皮肤 / 有皮肤页面仍然保留，代码差异只体现在路由 data：

```html
<!-- plain：路由 data.skin = false + 视觉重置 -->
<div class="compare">
  <div class="compare__body compare__body--scroll emp-raw">
    <app-showcase [embedded]="true" />
  </div>
</div>

<!-- skinned：默认应用皮肤 -->
<div class="compare">
  <div class="compare__body">
    <app-showcase />
  </div>
</div>
```

一套皮肤只有一个文件：`bike-tower/src/styles/skins/current.less`。
它同时包含 `body:not([data-skin-off])` 和 `.emp-skin` 两段。

当前默认是 dark。编辑器默认浅色；导出时选择「单文件（global + scoped）」
并覆盖 `current.less`，重启 dev server 后，深色会变成浅色，并排页右栏也会同步。

相关文件：

```
bike-tower/src/app/pages/compare/
  compare-nav.component.*
  compare-page.less
  split-compare.component.*
  plain-compare.component.ts
  skinned-compare.component.ts
```

## 项目接入

```less
// emp/src/styles.less
@import '../projects/emp-components/src/lib/styles/index.less';
@import './styles/skins/current.less';

// bike-tower/src/styles.less
@import './styles/theme.less'; // 内含 '@tikmac/emp-components/styles/index.less'
@import './styles/skins/current.less';
@import './styles/raw.less';
```

要新增一套皮肤：复制一份 `current.less` 为新的 `skins/<name>.less`，修改其中的值，然后把
`styles.less` 中的 import 指向新文件。

## 自定义组件如何参与皮肤

### 方式一：复用基础组件的 class（Class 格式）

在自定义组件中直接使用基础组件的 class：

```html
<div class="my-card emp-card">
  <div class="emp-card__title">标题</div>
  <div class="emp-card__body">正文</div>
</div>
```

- `.emp-card` 提供背景、边框、圆角、阴影、内边距、文字颜色
- `.emp-card__title` / `.emp-card__body` 提供子元素样式
- `class` 要放在真正绘制背景的元素上；如果放在组件宿主上，内部元素的背景可能遮住它
- Class 格式带 `!important`，会覆盖自定义组件自身的冲突样式

### 方式二：读取变量（分组变量格式）

自定义组件样式只需引用 `--emp-*` 变量：

```less
:host {
  background: var(--emp-card-bg);
  border: var(--emp-card-border-width) solid var(--emp-card-border-color);
  border-radius: var(--emp-card-radius);
}
```

这种方式不需要加 class，但需要导出「分组变量」格式。

### 新增自定义组件皮肤分组

自定义组件通过约定 + 自动扫描进入编辑器，不再手工修改 `skin-schema.ts`。

#### 命名约定

```text
bike-tower：--emp-bt-<component>--<property>
emp-ui：    --emp-custom-<component>--<property>
```

对于组件根类：

```text
bike-tower：.bt-<component>
emp-ui：    .emp-custom-<component>
```

#### 新增步骤

1. 在 `bike-tower/src/app/components/` 或
   `emp/src/app/components/` 新增组件
2. 组件 LESS 使用约定变量，并提供 fallback
3. 在对应 showcase 页面使用该组件
4. 运行自动扫描：

```bash
cd emp
npm run skins:manifest
```

5. 重新导出 `current.less`

#### 自动生成内容

扫描结果写入：

```text
emp/src/app/pages/skin-editor/custom-skin.generated.ts
```

生成内容包括：

- 自定义组件分组
- 字段 label/type/default
- Class 规则（在组件根类上设置 CSS 变量）

属性 label/type 来自：

```text
emp/scripts/skin-properties.json
```

组件中文名、特殊选择器、额外 Class 规则来自：

```text
emp/scripts/custom-skin-overrides.json
```

如果自动扫描无法表达复杂变体，可在 overrides 里补充 `classRules`。

Class 格式的 global、scoped、预览和 combined 段都会自动生成，不需要修改
`skin-classes.ts`。编辑器中点击 emp-ui 自定义组件会自动切换到 emp 预览，
点击 bike-tower 自定义组件会自动切换到 bike-tower 预览。

当前示例：

- `emp/src/app/components/`：工作台、指标卡、记录列表
- `bike-tower/src/app/components/`：设备卡片、活动时间线

首页「自定义组件如何接入皮肤」也包含同样流程。
