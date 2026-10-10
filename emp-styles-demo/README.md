# emp-styles-demo

用于验证 **emp-components 共享样式方案** 的独立 demo：一个小型库工作区（`emp`，含库组件与宿主 app）
和一个消费方应用（`bike-tower`，通过本地 tarball 安装该库）。全部代码都在本目录内，
**不依赖、也不修改**真实仓库 `emp/`、`bike-tower/`。

## 目录结构

```
emp-styles-demo/
  build.sh                    # 统一脚本：lib / serve / all / stop / help
  emp/                        # 库工作区（对应 emp/UI/emp-ui）
    projects/emp-components/  # 库：@tikmac/emp-components（仅含共享样式 + demo-card）
      src/lib/styles/         # 共享样式：tokens.less + theme.less
      src/lib/demo-card/      # 示例组件（引用共享令牌）
    src/                      # emp-ui 宿主 app（源码方式引入主题）
      app/pages/theme-editor/ # 主题可视化编辑器（demo 内置，不在库中）+「一键应用到项目」
  bike-tower/                 # 消费方（对应 bike-tower/UI）
    src/                      # 通过 node_modules 引入“已发布”主题
    scripts/                  # pack-lib.mjs / bootstrap.mjs
```

## 快速开始

脚本依赖 `nohup`/`fuser`/`curl` 等 Linux 工具：

- **Windows 推荐用 Git Bash**（与本机 Windows Node 同平台，`node_modules` 已按 win32 安装）：
  ```bash
  cd /f/Github/AngularProjects/emp-styles-demo
  bash build.sh lib                 # 构建 emp-components -> 打包 -> 装进 bike-tower
  bash build.sh serve emp-ui        # 起 emp-ui（http://localhost:4201，含主题编辑器）
  bash build.sh serve bike-tower    # 起 bike-tower（http://localhost:4200）
  bash build.sh serve all           # 两个一起起
  # Ctrl-C 停止
  ```
- 也可在 **WSL** 下运行，但需在 WSL 内重新 `npm install`（避免 win32/linux 原生依赖不匹配）。

### 命令

| 命令 | 说明 |
| --- | --- |
| `lib` | 构建库、`npm pack`、安装进 bike-tower |
| `serve [bike-tower\|emp-ui\|all]` | 后台启动 dev server（默认 bike-tower，端口 4200/4201） |
| `all [--serve=<target>]` | 先 `lib` 再 `serve` |
| `stop` | 停止后台服务 |
| `help` | 帮助 |

## 共享样式方案

- **`tokens.less`**：语义设计令牌（唯一来源），色板沿用 bike-tower 命名（`@color-primary` 等）。
- **`theme.less`**：`@import ./tokens.less`，输出 `:root` 上的 `--emp-*` CSS 变量 + `html,body`
  字体 + `body` 背景；并提供 `.emp-app-frame` 应用外框。
- **引入方式**：
  - 同工作区（emp-ui）：`@import 'projects/emp-components/src/lib/styles/theme.less';`
  - 已发布（bike-tower）：`@import '@tikmac/emp-components/styles/theme.less';`
    （或相对路径 `../node_modules/@tikmac/emp-components/styles/theme.less`）
- **背景形状**：默认矩形（`--emp-radius-app:0px`、`--emp-bg-inset:0px`）。改为圆角卡片只需覆盖：
  ```css
  :root {
    --emp-bg-inset: 16px;
    --emp-radius-app: 12px;
    --emp-bg-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
  ```
  > 注意：形状令牌**必须带单位**（`0px` 而非 `0`）。`.emp-app-frame` 用
  > `height: calc(100% - 2 * var(--emp-bg-inset))`，若变量是纯数字 `0`，
  > `calc(100% - 2*0)`（百分比减纯数字）在 CSS 中非法，会导致整条 `height` 失效、
  > 应用外框退化为内容高度、整页出现滚动。

## 消费方如何覆盖（bike-tower）

bike-tower 用**两层**：**基座** + **令牌覆盖**。

```
bike-tower/src/
  styles.less            # 全局入口（angular.json 指向它）
  styles/
    theme.less           # 库主题基座 + 基础布局（body / .emp-app-frame / .theme-compact）
    overrides.less       # 令牌覆盖（主题编辑器「一键应用到项目」生成，用库变量名）
```

```less
// bike-tower/src/styles.less（顺序：先基座，后覆盖）
@import './styles/theme.less';       // 1) 库主题基座
@import './styles/overrides.less';   // 2) 令牌覆盖（须在基座之后）

// bike-tower/src/styles/overrides.less（编辑器生成，使用库的 LESS 变量名）
@color-primary: #4f11df;
@emp-bg-app: #603db3;
@emp-radius-app: 0px;
@emp-bg-inset: 0px;
@emp-bg-shadow: none;
```

- **覆盖方式**：在 `overrides.less` 里写**库的 LESS 变量**（`@color-*` / `@emp-*`）。该文件本身不输出 CSS，
  它改变的是库主题那条 `:root` 的取值；因此**必须在 `@import theme.less` 之后**引入才生效
  （Less 同作用域「后定义者胜」）。
- 该文件通常由主题编辑器右上角 **「一键应用到项目」** 自动生成：选择项目根目录 → 写入
  `src/styles/overrides.less` 并在 `src/styles.less` 幂等追加 `@import './styles/overrides.less';`。
- 只对使用 `var(--emp-*)` 的样式生效（含库 `theme.less` 与改造过的 `emp-demo-card`）。
- 基础布局覆盖（如 `body{}` / `.emp-app-frame{}`）放在 `theme.less`；局部/多主题可在容器 class 里覆盖 `--emp-*`。

## 主题编辑器（demo 内置）

位于 `emp/src/app/pages/theme-editor/`（`emp-theme-editor` 组件 + 服务 + 令牌元数据），
**仅存在于 demo（emp-ui），不随 `@tikmac/emp-components` 发布**；路由 `/theme-editor`。

- 覆盖 `tokens.less` 全部令牌（颜色 / 排版 / 形状 / 背景）。
- **排版令牌（刻度制）**：family 角色（正文 `--emp-font-family`、标题 `--emp-font-family-heading`、
  代码 `--emp-font-family-code`）+ 字号刻度（`xs/sm/base/lg/xl/2xl`）+ 字重刻度（`regular/medium/semibold/bold`）
  + 行高刻度（`tight/base/loose`）。**只在 `:root` 暴露变量、不自动应用到标签**，由消费方/组件用 `var(--emp-*)` 取用。
- 右侧每个选项行也在末尾直接显示该令牌的 LESS 键值（如 `@color-text-primary: #333;`），与左侧示例一一对应。
- 字体下拉提供常用**西文（英文/德文）字体栈**，选项文字即完整 `font-family` 值（不做中文翻译）。
- 左侧「样式样板」为**每个令牌**都提供可见示例（外框/形状、品牌色、文字、黑/白、背景、边框、字体），
  并在示例旁直接显示对应 LESS 代码（如 `@color-text-primary: #333;`，**实时反映当前值**）；
  **鼠标悬停或聚焦右侧某行时，左侧对应示例会高亮描边**。
- **整页实时预览**：写入 `document.documentElement` 的内联 `--emp-*`，优先级高于 `theme.less`。
- 持久化到 `localStorage`，并提供「重置」回到默认。
- **「一键应用到项目」按钮**（编辑器头部，demo 内置）：用浏览器 File System Access API 让用户
  **选择项目根目录并授权**后，自动写入 `src/styles/overrides.less` 并在 `src/styles.less`（库主题行之后）
  幂等追加 `@import './styles/overrides.less';`。**仅 Chrome/Edge**，需 `localhost` 等安全上下文；
  不支持的浏览器会提示改用 Chrome/Edge。写文件逻辑在 demo 内，**库本身不含该能力**。
- 布局：编辑页整页不滚动，右侧选项列表独立上下滚动，左侧预览与代码区固定。
- 提示：该组件需宿主页提供有界高度（demo 的 emp-ui 已保证）。

## 已核实的验证结论

1. `ng build emp-components` 会把 `src/lib/styles/*.less` 拷贝到产物 `dist/emp-components/styles/`。✅
2. 产物 `package.json` 保留自定义 `exports: { "./styles/*": "./styles/*" }` 与 `sideEffects`。✅
3. emp-ui 以**源码路径**引入主题、bike-tower 以**打包包名/相对路径**引入主题，均构建成功，
   且编译出的 `styles-*.css` 哈希一致（= 主题完全相同）。✅
4. 裸标识符 `@import '@tikmac/emp-components/styles/theme.less'` 也能被 less 经 `exports` 解析。✅
5. 组件样式 `@import '../styles/tokens.less'`（编译期）+ `var(--emp-*)`（运行期）混合使用可编译。✅
6. 编辑页布局（用无头浏览器量测）：整页 `scrollHeight == innerHeight`（不滚动），
   右栏 `.theme-editor__controls` 内容高于可视区、独立滚动。✅
7. 修复了一个真实缺陷：形状令牌原先为无单位 `0`，导致 `calc(100% - 2*0)` 非法、
   整页随内容增高；改为 `0px` 后应用外框正确撑满视口。✅
8. 样板覆盖全部令牌并用无头浏览器逐项校验：17/17 个右侧选项悬停都能高亮左侧对应示例。✅
