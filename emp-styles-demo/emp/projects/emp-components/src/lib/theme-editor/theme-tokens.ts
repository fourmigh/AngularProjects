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
  | 'weight'
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
    label: 'System UI',
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  {
    label: 'Trebuchet MS',
    value: "'Trebuchet MS', 'Lucida Grande', sans-serif",
  },
  {
    label: 'Segoe UI',
    value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  { label: 'Calibri', value: "Calibri, 'Segoe UI', sans-serif" },
  { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
  { label: 'Open Sans', value: "'Open Sans', Arial, sans-serif" },
  { label: 'Noto Sans', value: "'Noto Sans', Arial, sans-serif" },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Cambria', value: 'Cambria, Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
];

const MONO_STACKS: ThemeTokenOption[] = [
  {
    label: 'System Mono',
    value: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
  { label: 'Menlo', value: 'Menlo, Monaco, Consolas, monospace' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Monospace', value: 'monospace' },
];

const WEIGHTS: ThemeTokenOption[] = [
  { label: 'Regular 400', value: '400' },
  { label: 'Medium 500', value: '500' },
  { label: 'Semibold 600', value: '600' },
  { label: 'Bold 700', value: '700' },
];

const SHADOWS: ThemeTokenOption[] = [  { label: '无', value: 'none' },
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

  // Typography —— family 角色
  {
    key: '--emp-font-family',
    lessName: '@emp-font-family',
    label: '正文字体',
    type: 'font',
    group: '字体排版',
    default: FONT_STACKS[0].value,
    options: FONT_STACKS,
  },
  {
    key: '--emp-font-family-heading',
    lessName: '@emp-font-family-heading',
    label: '标题字体',
    type: 'font',
    group: '字体排版',
    default: FONT_STACKS[0].value,
    options: FONT_STACKS,
  },
  {
    key: '--emp-font-family-code',
    lessName: '@emp-font-family-code',
    label: '代码字体',
    type: 'font',
    group: '字体排版',
    default: MONO_STACKS[0].value,
    options: MONO_STACKS,
  },

  // Typography —— 字号刻度
  {
    key: '--emp-font-size-xs',
    lessName: '@emp-font-size-xs',
    label: '字号 xs(px)',
    type: 'length',
    group: '字体排版',
    default: '12px',
    min: 10,
    max: 48,
    step: 1,
  },
  {
    key: '--emp-font-size-sm',
    lessName: '@emp-font-size-sm',
    label: '字号 sm(px)',
    type: 'length',
    group: '字体排版',
    default: '13px',
    min: 10,
    max: 48,
    step: 1,
  },
  {
    key: '--emp-font-size-base',
    lessName: '@emp-font-size-base',
    label: '字号 base(px)',
    type: 'length',
    group: '字体排版',
    default: '14px',
    min: 10,
    max: 48,
    step: 1,
  },
  {
    key: '--emp-font-size-lg',
    lessName: '@emp-font-size-lg',
    label: '字号 lg(px)',
    type: 'length',
    group: '字体排版',
    default: '16px',
    min: 10,
    max: 48,
    step: 1,
  },
  {
    key: '--emp-font-size-xl',
    lessName: '@emp-font-size-xl',
    label: '字号 xl(px)',
    type: 'length',
    group: '字体排版',
    default: '20px',
    min: 10,
    max: 64,
    step: 1,
  },
  {
    key: '--emp-font-size-2xl',
    lessName: '@emp-font-size-2xl',
    label: '字号 2xl(px)',
    type: 'length',
    group: '字体排版',
    default: '24px',
    min: 10,
    max: 72,
    step: 1,
  },

  // Typography —— 字重刻度
  {
    key: '--emp-font-weight-regular',
    lessName: '@emp-font-weight-regular',
    label: '字重 regular',
    type: 'weight',
    group: '字体排版',
    default: '400',
    options: WEIGHTS,
  },
  {
    key: '--emp-font-weight-medium',
    lessName: '@emp-font-weight-medium',
    label: '字重 medium',
    type: 'weight',
    group: '字体排版',
    default: '500',
    options: WEIGHTS,
  },
  {
    key: '--emp-font-weight-semibold',
    lessName: '@emp-font-weight-semibold',
    label: '字重 semibold',
    type: 'weight',
    group: '字体排版',
    default: '600',
    options: WEIGHTS,
  },
  {
    key: '--emp-font-weight-bold',
    lessName: '@emp-font-weight-bold',
    label: '字重 bold',
    type: 'weight',
    group: '字体排版',
    default: '700',
    options: WEIGHTS,
  },

  // Typography —— 行高刻度
  {
    key: '--emp-line-height-tight',
    lessName: '@emp-line-height-tight',
    label: '行高 tight',
    type: 'text',
    group: '字体排版',
    default: '1.25',
  },
  {
    key: '--emp-line-height-base',
    lessName: '@emp-line-height-base',
    label: '行高 base',
    type: 'text',
    group: '字体排版',
    default: '1.5',
  },
  {
    key: '--emp-line-height-loose',
    lessName: '@emp-line-height-loose',
    label: '行高 loose',
    type: 'text',
    group: '字体排版',
    default: '1.75',
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
