export type SkinFieldType =
  | 'color'
  | 'length'
  | 'font'
  | 'shadow'
  | 'text'
  | 'select';

export interface SkinFieldOption {
  label: string;
  value: string;
}

export interface SkinField {
  key: string;
  label: string;
  type: SkinFieldType;
  default: string;
  options?: SkinFieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export type SkinGroupKind = 'base' | 'page' | 'component' | 'custom';

export interface SkinGroup {
  id: string;
  label: string;
  kind: SkinGroupKind;
  selector?: string;
  fields: SkinField[];
}

export const FONT_STACKS: SkinFieldOption[] = [
  {
    label: 'Nextcloud / System UI',
    value:
      "system-ui, -apple-system, 'Segoe UI', Roboto, Oxygen-Sans, Cantarell, Ubuntu, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  { label: 'Segoe UI', value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
  { label: 'Open Sans', value: "'Open Sans', Arial, sans-serif" },
  { label: 'Noto Sans', value: "'Noto Sans', Arial, sans-serif" },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
];

export const MONO_STACKS: SkinFieldOption[] = [
  {
    label: 'System Mono',
    value: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
  { label: 'Menlo', value: 'Menlo, Monaco, Consolas, monospace' },
  { label: 'Monospace', value: 'monospace' },
];

export const SHADOWS: SkinFieldOption[] = [
  { label: '无', value: 'none' },
  { label: '轻微', value: '0 1px 2px rgba(0, 0, 0, 0.08)' },
  { label: '柔和', value: '0 1px 3px rgba(0, 0, 0, 0.06)' },
  { label: '中等', value: '0 4px 12px rgba(0, 0, 0, 0.12)' },
  { label: '明显', value: '0 12px 32px rgba(0, 0, 0, 0.18)' },
];

const WEIGHTS: SkinFieldOption[] = [
  { label: 'Regular 400', value: '400' },
  { label: 'Medium 500', value: '500' },
  { label: 'Semibold 600', value: '600' },
  { label: 'Bold 700', value: '700' },
];

const color = (key: string, label: string, value: string): SkinField => ({
  key,
  label,
  type: 'color',
  default: value,
});

const length = (
  key: string,
  label: string,
  value: string,
  min = 0,
  max = 64,
  step = 1,
): SkinField => ({
  key,
  label,
  type: 'length',
  default: value,
  min,
  max,
  step,
});

const text = (key: string, label: string, value: string): SkinField => ({
  key,
  label,
  type: 'text',
  default: value,
});

const font = (
  key: string,
  label: string,
  value: string,
  options: SkinFieldOption[],
): SkinField => ({
  key,
  label,
  type: 'font',
  default: value,
  options,
});

const shadow = (
  key: string,
  label: string,
  value: string,
): SkinField => ({
  key,
  label,
  type: 'shadow',
  default: value,
  options: SHADOWS,
});

const weight = (key: string, label: string, value: string): SkinField => ({
  key,
  label,
  type: 'select',
  default: value,
  options: WEIGHTS,
});

export const SKIN_GROUPS: SkinGroup[] = [
  {
    id: 'global',
    label: '全局配色',
    kind: 'base',
    selector: 'html',
    fields: [
      color('--emp-color-primary', '主色', '#00679e'),
      color('--emp-color-primary-hover', '主色悬停', '#3285b1'),
      color('--emp-color-primary-active', '主色按下', '#00507a'),
      color('--emp-color-primary-soft', '主色浅底', '#e5eff5'),
      color('--emp-color-primary-soft-text', '主色浅底文字', '#00293f'),
      color('--emp-color-on-primary', '主色上的文字', '#ffffff'),
      color('--emp-color-text', '正文文字', '#222222'),
      color('--emp-color-text-secondary', '次要文字', '#6b6b6b'),
      color('--emp-color-text-muted', '弱化文字', '#7d7d7d'),
      color('--emp-color-surface', '基础表面', '#ffffff'),
      color('--emp-color-surface-hover', '表面悬停', '#f5f5f5'),
      color('--emp-color-surface-dark', '深一档表面', '#ededed'),
      color('--emp-color-surface-darker', '深两档表面', '#dbdbdb'),
      color('--emp-color-border', '边框', '#ededed'),
      color('--emp-color-border-dark', '深边框', '#dbdbdb'),
      color('--emp-color-border-strong', '强边框', '#7d7d7d'),
      color('--emp-color-success', '成功元素色', '#099f05'),
      color('--emp-color-success-bg', '成功底色', '#d8f3da'),
      color('--emp-color-success-text', '成功文字', '#005416'),
      color('--emp-color-info', '信息元素色', '#0077c7'),
      color('--emp-color-info-bg', '信息底色', '#d5f1fa'),
      color('--emp-color-info-text', '信息文字', '#0066ac'),
      color('--emp-color-warning', '警告元素色', '#bf7900'),
      color('--emp-color-warning-bg', '警告底色', '#ffeec5'),
      color('--emp-color-warning-text', '警告文字', '#664700'),
      color('--emp-color-danger', '危险元素色', '#c90000'),
      color('--emp-color-danger-bg', '危险底色', '#ffe7e7'),
      color('--emp-color-danger-text', '危险文字', '#8a0000'),
    ],
  },
  {
    id: 'typography',
    label: '字体与圆角',
    kind: 'base',
    selector: 'html',
    fields: [
      font(
        '--emp-font-family',
        '正文字体',
        FONT_STACKS[0].value,
        FONT_STACKS,
      ),
      font(
        '--emp-font-family-mono',
        '等宽字体',
        MONO_STACKS[0].value,
        MONO_STACKS,
      ),
      length('--emp-font-size-base', '正文尺寸', '15px', 11, 20),
      length('--emp-font-size-sm', '小号尺寸', '13px', 10, 18),
      length('--emp-font-size-lg', '大号尺寸', '16px', 12, 24),
      length('--emp-font-size-xl', '标题尺寸', '20px', 14, 36),
      weight('--emp-font-weight-regular', '常规字重', '400'),
      weight('--emp-font-weight-medium', '中等字重', '500'),
      weight('--emp-font-weight-semibold', '标题字重', '600'),
      text('--emp-line-height', '行高', '1.5'),
      length('--emp-radius-sm', '小圆角', '4px', 0, 32),
      length('--emp-radius-md', '中圆角', '8px', 0, 40),
      length('--emp-radius-lg', '大圆角', '12px', 0, 48),
      length('--emp-radius-xl', '超大圆角', '16px', 0, 64),
      length('--emp-radius-pill', '胶囊圆角', '100px', 0, 200),
    ],
  },
  {
    id: 'page',
    label: '页面与应用框架',
    kind: 'page',
    selector: '.emp-app-frame, .emp-page',
    fields: [
      color('--emp-app-outer-bg', '外层背景', '#111426'),
      color('--emp-app-bg', '应用背景', '#ffffff'),
      length('--emp-app-inset', '外层内缩', '8px', 0, 32),
      length('--emp-app-radius', '应用圆角', '16px', 0, 48),
      shadow('--emp-app-shadow', '应用阴影', 'none'),
      color('--emp-page-bg', '页面背景', '#ffffff'),
      color('--emp-page-text', '页面文字', '#222222'),
      length('--emp-page-padding', '页面内边距', '24px', 0, 64),
      length('--emp-page-radius', '页面圆角', '12px', 0, 48),
      length('--emp-header-height', '顶栏高度', '50px', 32, 80),
      length('--emp-nav-width', '侧栏宽度', '300px', 160, 480),
    ],
  },
  {
    id: 'card',
    label: '卡片',
    kind: 'component',
    selector: 'emp-card, .emp-card',
    fields: [
      color('--emp-card-bg', '背景', '#ffffff'),
      color('--emp-card-border-color', '边框颜色', '#dbdbdb'),
      length('--emp-card-border-width', '边框宽度', '1px', 0, 8),
      length('--emp-card-radius', '圆角', '12px', 0, 40),
      shadow('--emp-card-shadow', '阴影', '0 1px 3px rgba(0, 0, 0, 0.06)'),
      length('--emp-card-padding', '内边距', '16px', 0, 40),
      color('--emp-card-title', '标题颜色', '#222222'),
      color('--emp-card-text', '正文颜色', '#6b6b6b'),
      color('--emp-card-hover-bg', '悬停背景', '#f5f5f5'),
    ],
  },
  {
    id: 'button',
    label: '按钮',
    kind: 'component',
    selector: 'emp-button, .emp-button',
    fields: [
      color('--emp-button-bg', '主按钮背景', '#00679e'),
      color('--emp-button-text', '主按钮文字', '#ffffff'),
      length('--emp-button-border-width', '边框宽度', '1px', 0, 6),
      color('--emp-button-border-color', '边框颜色', 'transparent'),
      length('--emp-button-radius', '圆角', '8px', 0, 32),
      length('--emp-button-padding-y', '纵向内边距', '7px', 0, 24),
      length('--emp-button-padding-x', '横向内边距', '16px', 0, 48),
      length('--emp-button-font-size', '字号', '15px', 11, 20),
      weight('--emp-button-font-weight', '字重', '500'),
      color('--emp-button-hover-bg', '主按钮悬停', '#00507a'),
      color('--emp-button-secondary-bg', '次按钮背景', '#ffffff'),
      color('--emp-button-secondary-text', '次按钮文字', '#222222'),
      color('--emp-button-secondary-border', '次按钮边框', '#dbdbdb'),
      color('--emp-button-secondary-hover-bg', '次按钮悬停', '#f5f5f5'),
      color('--emp-button-danger-bg', '危险按钮背景', '#c90000'),
      color('--emp-button-danger-text', '危险按钮文字', '#ffffff'),
      color('--emp-button-danger-hover-bg', '危险按钮悬停', '#a80000'),
      text('--emp-button-disabled-opacity', '禁用透明度', '0.5'),
    ],
  },
  {
    id: 'input',
    label: '输入框',
    kind: 'component',
    selector: 'emp-input, .emp-input',
    fields: [
      color('--emp-input-bg', '背景', '#ffffff'),
      color('--emp-input-text', '文字', '#222222'),
      color('--emp-input-placeholder', '占位文字', '#7d7d7d'),
      color('--emp-input-border-color', '边框颜色', '#dbdbdb'),
      length('--emp-input-border-width', '边框宽度', '1px', 0, 6),
      length('--emp-input-radius', '圆角', '8px', 0, 32),
      length('--emp-input-padding-y', '纵向内边距', '8px', 0, 24),
      length('--emp-input-padding-x', '横向内边距', '12px', 0, 32),
      length('--emp-input-font-size', '字号', '15px', 11, 20),
      color('--emp-input-focus-border-color', '聚焦边框', '#00679e'),
      shadow('--emp-input-focus-shadow', '聚焦阴影', '0 0 0 2px rgba(0, 103, 158, 0.2)'),
      color('--emp-input-disabled-bg', '禁用背景', '#ededed'),
    ],
  },
  {
    id: 'select',
    label: '选择框',
    kind: 'component',
    selector: 'emp-select, .emp-select',
    fields: [
      color('--emp-select-bg', '背景', '#ffffff'),
      color('--emp-select-text', '文字', '#222222'),
      color('--emp-select-border-color', '边框颜色', '#dbdbdb'),
      length('--emp-select-border-width', '边框宽度', '1px', 0, 6),
      length('--emp-select-radius', '圆角', '8px', 0, 32),
      length('--emp-select-padding-y', '纵向内边距', '8px', 0, 24),
      length('--emp-select-padding-x', '横向内边距', '12px', 0, 32),
      color('--emp-select-focus-border-color', '聚焦边框', '#00679e'),
      color('--emp-select-arrow', '箭头颜色', '#6b6b6b'),
    ],
  },
  {
    id: 'check',
    label: '勾选与开关',
    kind: 'component',
    selector: 'emp-check, .emp-check, .emp-switch',
    fields: [
      length('--emp-check-size', '勾选框尺寸', '18px', 12, 32),
      color('--emp-check-bg', '勾选框背景', '#ffffff'),
      color('--emp-check-border-color', '勾选框边框', '#dbdbdb'),
      length('--emp-check-border-width', '边框宽度', '1px', 0, 6),
      length('--emp-check-radius', '勾选框圆角', '4px', 0, 16),
      color('--emp-check-checked-bg', '选中背景', '#00679e'),
      color('--emp-check-checked-border-color', '选中边框', '#00679e'),
      color('--emp-check-mark', '勾选标记', '#ffffff'),
      color('--emp-check-label', '标签文字', '#222222'),
      length('--emp-switch-width', '开关宽度', '38px', 24, 72),
      length('--emp-switch-height', '开关高度', '22px', 14, 48),
      color('--emp-switch-track', '开关轨道', '#dbdbdb'),
      color('--emp-switch-track-checked', '开关选中轨道', '#00679e'),
      color('--emp-switch-thumb', '开关滑块', '#ffffff'),
    ],
  },
  {
    id: 'table',
    label: '表格',
    kind: 'component',
    selector: 'emp-table, .emp-table',
    fields: [
      color('--emp-table-bg', '背景', '#ffffff'),
      color('--emp-table-text', '文字', '#222222'),
      color('--emp-table-border-color', '边框', '#ededed'),
      length('--emp-table-radius', '圆角', '12px', 0, 40),
      color('--emp-table-header-bg', '表头背景', '#ededed'),
      color('--emp-table-header-text', '表头文字', '#222222'),
      color('--emp-table-row-hover-bg', '行悬停背景', '#f5f5f5'),
      length('--emp-table-cell-padding-y', '单元格纵向内边距', '10px', 0, 32),
      length('--emp-table-cell-padding-x', '单元格横向内边距', '12px', 0, 40),
      length('--emp-table-font-size', '字号', '15px', 11, 20),
    ],
  },
  {
    id: 'tabs',
    label: '标签页',
    kind: 'component',
    selector: 'emp-tabs, .emp-tabs',
    fields: [
      color('--emp-tabs-bg', '背景', 'transparent'),
      color('--emp-tabs-text', '文字', '#6b6b6b'),
      color('--emp-tabs-active-text', '选中文字', '#00679e'),
      color('--emp-tabs-active-border', '选中下划线', '#00679e'),
      color('--emp-tabs-hover-text', '悬停文字', '#222222'),
      color('--emp-tabs-border-color', '分隔线', '#ededed'),
      length('--emp-tabs-radius', '圆角', '8px', 0, 32),
      length('--emp-tabs-padding-y', '纵向内边距', '8px', 0, 24),
      length('--emp-tabs-padding-x', '横向内边距', '14px', 0, 40),
      length('--emp-tabs-font-size', '字号', '15px', 11, 20),
    ],
  },
  {
    id: 'badge',
    label: '徽标',
    kind: 'component',
    selector: 'emp-badge, .emp-badge',
    fields: [
      color('--emp-badge-bg', '默认背景', '#e5eff5'),
      color('--emp-badge-text', '默认文字', '#00293f'),
      length('--emp-badge-radius', '圆角', '100px', 0, 200),
      length('--emp-badge-padding-y', '纵向内边距', '2px', 0, 12),
      length('--emp-badge-padding-x', '横向内边距', '8px', 0, 24),
      length('--emp-badge-font-size', '字号', '13px', 10, 18),
      color('--emp-badge-success-bg', '成功背景', '#d8f3da'),
      color('--emp-badge-success-text', '成功文字', '#005416'),
      color('--emp-badge-warning-bg', '警告背景', '#ffeec5'),
      color('--emp-badge-warning-text', '警告文字', '#664700'),
      color('--emp-badge-danger-bg', '危险背景', '#ffe7e7'),
      color('--emp-badge-danger-text', '危险文字', '#8a0000'),
      color('--emp-badge-info-bg', '信息背景', '#d5f1fa'),
      color('--emp-badge-info-text', '信息文字', '#0066ac'),
    ],
  },
  {
    id: 'alert',
    label: '提示',
    kind: 'component',
    selector: 'emp-alert, .emp-alert',
    fields: [
      color('--emp-alert-bg', '信息背景', '#d5f1fa'),
      color('--emp-alert-text', '信息文字', '#0066ac'),
      color('--emp-alert-border-color', '信息边框', '#0077c7'),
      length('--emp-alert-radius', '圆角', '8px', 0, 32),
      length('--emp-alert-padding', '内边距', '12px', 0, 40),
      color('--emp-alert-title', '标题颜色', '#0066ac'),
      color('--emp-alert-success-bg', '成功背景', '#d8f3da'),
      color('--emp-alert-success-text', '成功文字', '#005416'),
      color('--emp-alert-success-border', '成功边框', '#099f05'),
      color('--emp-alert-warning-bg', '警告背景', '#ffeec5'),
      color('--emp-alert-warning-text', '警告文字', '#664700'),
      color('--emp-alert-warning-border', '警告边框', '#bf7900'),
      color('--emp-alert-danger-bg', '危险背景', '#ffe7e7'),
      color('--emp-alert-danger-text', '危险文字', '#8a0000'),
      color('--emp-alert-danger-border', '危险边框', '#c90000'),
    ],
  },
  {
    id: 'dialog',
    label: '弹窗',
    kind: 'component',
    selector: 'emp-dialog, .emp-dialog',
    fields: [
      color('--emp-dialog-bg', '背景', '#ffffff'),
      color('--emp-dialog-text', '文字', '#222222'),
      color('--emp-dialog-border-color', '边框', '#dbdbdb'),
      length('--emp-dialog-radius', '圆角', '16px', 0, 48),
      shadow('--emp-dialog-shadow', '阴影', '0 12px 32px rgba(0, 0, 0, 0.18)'),
      length('--emp-dialog-padding', '内边距', '20px', 0, 48),
      color('--emp-dialog-title', '标题颜色', '#222222'),
      color('--emp-dialog-overlay-bg', '遮罩背景', 'rgba(17, 20, 38, 0.5)'),
    ],
  },
  {
    id: 'toolbar',
    label: '工具栏与侧栏',
    kind: 'component',
    selector: 'emp-toolbar, .emp-toolbar, .emp-nav',
    fields: [
      color('--emp-toolbar-bg', '顶栏背景', '#111426'),
      color('--emp-toolbar-text', '顶栏文字', '#ffffff'),
      color('--emp-toolbar-border-color', '顶栏分隔线', 'rgba(255, 255, 255, 0.12)'),
      length('--emp-toolbar-height', '顶栏高度', '50px', 32, 80),
      length('--emp-toolbar-padding-x', '顶栏横向内边距', '20px', 0, 48),
      color('--emp-nav-bg', '侧栏背景', '#ffffff'),
      color('--emp-nav-text', '侧栏文字', '#222222'),
      color('--emp-nav-active-bg', '侧栏选中背景', '#e5eff5'),
      color('--emp-nav-active-text', '侧栏选中文字', '#00293f'),
      color('--emp-nav-border-color', '侧栏分隔线', '#ededed'),
      length('--emp-nav-width', '侧栏宽度', '300px', 160, 480),
    ],
  },
  {
    id: 'pagination',
    label: '分页',
    kind: 'component',
    selector: 'emp-pagination, .emp-pagination',
    fields: [
      color('--emp-pagination-bg', '背景', '#ffffff'),
      color('--emp-pagination-text', '文字', '#222222'),
      color('--emp-pagination-border-color', '边框', '#dbdbdb'),
      length('--emp-pagination-radius', '圆角', '8px', 0, 32),
      color('--emp-pagination-active-bg', '当前页背景', '#00679e'),
      color('--emp-pagination-active-text', '当前页文字', '#ffffff'),
      color('--emp-pagination-hover-bg', '悬停背景', '#f5f5f5'),
      length('--emp-pagination-size', '按钮尺寸', '34px', 24, 56),
    ],
  },
  {
    id: 'empty',
    label: '空状态',
    kind: 'component',
    selector: 'emp-empty, .emp-empty',
    fields: [
      color('--emp-empty-bg', '背景', 'transparent'),
      color('--emp-empty-text', '描述文字', '#6b6b6b'),
      color('--emp-empty-title', '标题文字', '#222222'),
      color('--emp-empty-icon', '图标颜色', '#7d7d7d'),
      color('--emp-empty-border-color', '虚线边框', '#dbdbdb'),
      length('--emp-empty-radius', '圆角', '12px', 0, 40),
      length('--emp-empty-padding', '内边距', '32px', 0, 80),
    ],
  },
  {
    id: 'custom-workbench',
    label: '自定义 · 工作台',
    kind: 'custom',
    selector: 'bt-workbench, .bt-workbench',
    fields: [
      color('--emp-bt-workbench-bg', '背景', '#ffffff'),
      color('--emp-bt-workbench-header-bg', '顶栏背景', '#111426'),
      color('--emp-bt-workbench-header-text', '顶栏文字', '#ffffff'),
      color('--emp-bt-workbench-sidebar-bg', '侧栏背景', '#ffffff'),
      color('--emp-bt-workbench-sidebar-text', '侧栏文字', '#222222'),
      color('--emp-bt-workbench-sidebar-active-bg', '侧栏选中背景', '#e5eff5'),
      color('--emp-bt-workbench-sidebar-active-text', '侧栏选中文字', '#00293f'),
      color('--emp-bt-workbench-content-bg', '内容背景', '#ffffff'),
      color('--emp-bt-workbench-border-color', '分隔线', '#ededed'),
      length('--emp-bt-workbench-radius', '圆角', '16px', 0, 48),
    ],
  },
  {
    id: 'custom-stat',
    label: '自定义 · 指标卡',
    kind: 'custom',
    selector: 'bt-stat-card, .bt-stat-card',
    fields: [
      color('--emp-bt-stat-bg', '背景', '#ffffff'),
      color('--emp-bt-stat-border-color', '边框', '#dbdbdb'),
      length('--emp-bt-stat-radius', '圆角', '12px', 0, 40),
      shadow('--emp-bt-stat-shadow', '阴影', '0 1px 3px rgba(0, 0, 0, 0.06)'),
      color('--emp-bt-stat-label', '标签文字', '#6b6b6b'),
      color('--emp-bt-stat-value', '数值文字', '#222222'),
      color('--emp-bt-stat-up', '上升颜色', '#099f05'),
      color('--emp-bt-stat-down', '下降颜色', '#c90000'),
    ],
  },
  {
    id: 'custom-record',
    label: '自定义 · 记录列表',
    kind: 'custom',
    selector: 'bt-record-list, .bt-record-list',
    fields: [
      color('--emp-bt-record-bg', '背景', '#ffffff'),
      color('--emp-bt-record-border-color', '边框', '#ededed'),
      length('--emp-bt-record-radius', '圆角', '12px', 0, 40),
      color('--emp-bt-record-title', '标题文字', '#222222'),
      color('--emp-bt-record-meta', '次要文字', '#6b6b6b'),
      color('--emp-bt-record-row-hover-bg', '行悬停背景', '#f5f5f5'),
      color('--emp-bt-record-status-bg', '状态背景', '#e5eff5'),
      color('--emp-bt-record-status-text', '状态文字', '#00293f'),
    ],
  },
];

export const ALL_FIELDS: SkinField[] = SKIN_GROUPS.flatMap(
  (group) => group.fields,
);

export const DEFAULT_SKIN: Record<string, string> = Object.fromEntries(
  ALL_FIELDS.map((field) => [field.key, field.default]),
);

export const FIELD_BY_KEY = new Map(
  ALL_FIELDS.map((field) => [field.key, field]),
);

export function groupFields(group: SkinGroup, search: string): SkinField[] {
  const term = search.trim().toLowerCase();
  if (!term) {
    return group.fields;
  }
  return group.fields.filter(
    (field) =>
      field.label.toLowerCase().includes(term) ||
      field.key.toLowerCase().includes(term),
  );
}
