/**
 * 主题令牌元数据。
 *
 * 覆盖 ./styles/tokens.less 里定义的全部令牌；theme-editor 组件据此渲染控件。
 * 新增令牌时，同步在 tokens.less 与 theme.less 以及这里登记即可。
 */
export type ThemeTokenType =
  | 'color'
  | 'length'
  | 'font'
  | 'shadow'
  | 'gradient'
  | 'text';

export interface ThemeTokenOption {
  label: string;
  value: string;
}

export interface ThemeTokenDef {
  /** CSS 自定义属性名，如 --emp-color-primary */
  key: string;
  /** 对应的 LESS 变量名，如 @color-primary */
  lessName: string;
  /** 界面显示名 */
  label: string;
  type: ThemeTokenType;
  /** 分组名 */
  group: string;
  /** 默认值（与 tokens.less 保持一致） */
  default: string;
  /** 下拉选项（type 为 font / shadow 时使用） */
  options?: ThemeTokenOption[];
  /** length 类型的范围 */
  min?: number;
  max?: number;
  step?: number;
  /** 不在通用分组里渲染（由专门控件处理），如背景渐变 */
  hidden?: boolean;
}

const FONT_STACKS: ThemeTokenOption[] = [
  {
    label: '系统默认',
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  { label: '无衬线', value: 'Arial, Helvetica, sans-serif' },
  { label: '衬线', value: "Georgia, 'Times New Roman', serif" },
  {
    label: '等宽',
    value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  },
  {
    label: '中文优先',
    value: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
  },
];

const SHADOWS: ThemeTokenOption[] = [
  { label: '无', value: 'none' },
  { label: '轻微', value: '0 1px 2px rgba(0, 0, 0, 0.08)' },
  { label: '中等', value: '0 4px 12px rgba(0, 0, 0, 0.12)' },
  { label: '明显', value: '0 12px 32px rgba(0, 0, 0, 0.18)' },
];

export const DEFAULT_BG_APP =
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

export const THEME_TOKENS: ThemeTokenDef[] = [
  // Brand
  {
    key: '--emp-color-primary',
    lessName: '@color-primary',
    label: '主色',
    type: 'color',
    group: '品牌色',
    default: '#667eea',
  },
  {
    key: '--emp-color-primary-dark',
    lessName: '@color-primary-dark',
    label: '主色（深）',
    type: 'color',
    group: '品牌色',
    default: '#764ba2',
  },

  // Text
  {
    key: '--emp-color-text-primary',
    lessName: '@color-text-primary',
    label: '主要文字',
    type: 'color',
    group: '文字',
    default: '#333',
  },
  {
    key: '--emp-color-text-secondary',
    lessName: '@color-text-secondary',
    label: '次要文字',
    type: 'color',
    group: '文字',
    default: '#666',
  },
  {
    key: '--emp-color-text-muted',
    lessName: '@color-text-muted',
    label: '弱化文字',
    type: 'color',
    group: '文字',
    default: '#999',
  },
  {
    key: '--emp-color-black',
    lessName: '@color-black',
    label: '黑',
    type: 'color',
    group: '文字',
    default: '#000',
  },
  {
    key: '--emp-color-white',
    lessName: '@color-white',
    label: '白',
    type: 'color',
    group: '文字',
    default: '#fff',
  },

  // Background
  {
    key: '--emp-color-bg-body',
    lessName: '@color-bg-body',
    label: 'body 背景色',
    type: 'color',
    group: '背景',
    default: '#f0f2f5',
  },
  {
    key: '--emp-color-bg-page',
    lessName: '@color-bg-page',
    label: '页面背景色',
    type: 'color',
    group: '背景',
    default: '#f5f7fa',
  },
  {
    key: '--emp-bg-outer',
    lessName: '@emp-bg-outer',
    label: '外层背景（圆角留白处）',
    type: 'color',
    group: '背景',
    default: '#f0f2f5',
  },
  {
    key: '--emp-bg-app',
    lessName: '@emp-bg-app',
    label: '应用背景（--emp-bg-app）',
    type: 'gradient',
    group: '背景',
    default: DEFAULT_BG_APP,
    hidden: true,
  },

  // Border
  {
    key: '--emp-color-border',
    lessName: '@color-border',
    label: '边框',
    type: 'color',
    group: '边框',
    default: '#e0e0e0',
  },

  // Typography
  {
    key: '--emp-font-family',
    lessName: '@emp-font-family',
    label: '字体',
    type: 'font',
    group: '字体排版',
    default: FONT_STACKS[0].value,
    options: FONT_STACKS,
  },
  {
    key: '--emp-font-size-base',
    lessName: '@emp-font-size-base',
    label: '基础字号(px)',
    type: 'length',
    group: '字体排版',
    default: '14px',
    min: 12,
    max: 20,
    step: 1,
  },

  // Shape
  {
    key: '--emp-radius-app',
    lessName: '@emp-radius-app',
    label: '圆角(px)',
    type: 'length',
    group: '形状',
    default: '0px',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: '--emp-bg-inset',
    lessName: '@emp-bg-inset',
    label: '外边距(px)',
    type: 'length',
    group: '形状',
    default: '0px',
    min: 0,
    max: 32,
    step: 1,
  },
  {
    key: '--emp-bg-shadow',
    lessName: '@emp-bg-shadow',
    label: '阴影',
    type: 'shadow',
    group: '形状',
    default: 'none',
    options: SHADOWS,
  },
];

export interface ThemeTokenGroup {
  name: string;
  tokens: ThemeTokenDef[];
}

export function groupTokens(tokens: ThemeTokenDef[]): ThemeTokenGroup[] {
  const groups: ThemeTokenGroup[] = [];
  for (const token of tokens) {
    if (token.hidden) continue;
    let group = groups.find((g) => g.name === token.group);
    if (!group) {
      group = { name: token.group, tokens: [] };
      groups.push(group);
    }
    group.tokens.push(token);
  }
  return groups;
}
