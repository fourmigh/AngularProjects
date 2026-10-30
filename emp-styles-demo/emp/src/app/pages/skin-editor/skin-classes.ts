import {
  SKIN_GROUPS,
  type SkinClassDeclaration,
} from './skin-schema';

type Values = Record<string, string>;

export interface SkinClassOptions {
  scope?: string;
  excludeAttribute?: string;
  combined?: boolean;
  header?: boolean;
  includeAppFrame?: boolean;
}

const value = (values: Values, key: string): string => values[key] ?? '';
const important = (declarations: string[]): string =>
  declarations.map((declaration) => `  ${declaration} !important;`).join('\n');

export function serializeSkinClasses(
  name: string,
  values: Values,
  options: SkinClassOptions = {},
): string {
  if (options.combined) {
    const globalSection = serializeSkinClasses(name, values, {
      excludeAttribute: 'data-skin-off',
    });
    const scopedSection = serializeSkinClasses(name, values, {
      scope: '.emp-skin',
      header: false,
    });
    return `${globalSection.trimEnd()}\n/* Scoped section for the split compare page. */\n${scopedSection}`;
  }

  const v = (key: string) => value(values, key);
  const scope = options.scope?.trim();
  const exclude = options.excludeAttribute?.trim();
  const rootNot = exclude ? `body:not([${exclude}])` : '';
  const selectorFor = (selector: string): string => {
    if (scope) {
      return `${scope} ${selector}`;
    }
    if (exclude) {
      return selector === 'html, body' ? rootNot : `${rootNot} ${selector}`;
    }
    return selector;
  };
  const rule = (selector: string, declarations: string[]): string =>
    `${selectorFor(selector)} {\n${important(declarations)}\n}`;
  const rawRule = (selector: string, declarations: string[]): string =>
    `${selector} {\n${important(declarations)}\n}`;
  const renderDeclaration = (
    declaration: SkinClassDeclaration,
  ): string => {
    const raw = v(declaration.field);
    const value = declaration.template
      ? declaration.template.replace('{value}', raw)
      : raw;
    return `${declaration.property}: ${value}`;
  };
  const customRuleBlocks = SKIN_GROUPS.flatMap((group) =>
    group.classRules?.length
      ? [
          `/* ${group.label} */`,
          ...group.classRules.map((classRule) =>
            rule(
              classRule.selector,
              classRule.declarations.map(renderDeclaration),
            ),
          ),
          '',
        ]
      : [],
  );

  const tokenFields = SKIN_GROUPS.filter(
    (group) => group.id === 'global' || group.id === 'typography',
  ).flatMap((group) => group.fields);
  const tokenSelector = scope ?? (exclude ? rootNot : ':root');
  const tokenBlock = `${tokenSelector} {\n${tokenFields
    .map((field) => `  ${field.key}: ${v(field.key)};`)
    .join('\n')}\n}`;

  const blocks: string[] = [
    ...(options.header === false
      ? []
      : [
          `/* emp skin: ${name.trim() || 'skin'} */`,
          scope
            ? `/* Scoped to ${scope}. The !important flag overrides component defaults. */`
            : exclude
              ? `/* Excluded by [${exclude}]. The !important flag overrides component defaults. */`
              : '/* Class format. The !important flag overrides component defaults. */',
          '',
        ]),
    tokenBlock,
    '',
    ...(scope
      ? options.includeAppFrame
        ? [
            rawRule(scope, [
              `color: ${v('--emp-color-text')}`,
              `background: ${v('--emp-app-outer-bg')}`,
              `font-family: ${v('--emp-font-family')}`,
              `font-size: ${v('--emp-font-size-base')}`,
              `line-height: ${v('--emp-line-height')}`,
            ]),
            '',
            '/* 页面与应用框架 */',
            rule('.emp-app-frame', [
              `margin: ${v('--emp-app-inset')}`,
              `height: calc(100% - 2 * ${v('--emp-app-inset')})`,
              `background: ${v('--emp-app-bg')}`,
              `border-radius: ${v('--emp-app-radius')}`,
              `box-shadow: ${v('--emp-app-shadow')}`,
              'overflow: hidden',
            ]),
          ]
        : ['/* 页面 */']
      : [
          rule('html, body', [
            `color: ${v('--emp-color-text')}`,
            `background: ${v('--emp-app-outer-bg')}`,
            `font-family: ${v('--emp-font-family')}`,
            `font-size: ${v('--emp-font-size-base')}`,
            `line-height: ${v('--emp-line-height')}`,
          ]),
          '',
          '/* 页面与应用框架 */',
          rule('.emp-app-frame', [
            `margin: ${v('--emp-app-inset')}`,
            `height: calc(100% - 2 * ${v('--emp-app-inset')})`,
            `background: ${v('--emp-app-bg')}`,
            `border-radius: ${v('--emp-app-radius')}`,
            `box-shadow: ${v('--emp-app-shadow')}`,
            'overflow: hidden',
          ]),
        ]),
    rule('.emp-page', [
      `padding: ${v('--emp-page-padding')}`,
      `background: ${v('--emp-page-bg')}`,
      `color: ${v('--emp-page-text')}`,
      `border-radius: ${v('--emp-page-radius')}`,
    ]),
    '',
    '/* 卡片 */',
    rule('.emp-card', [
      `background: ${v('--emp-card-bg')}`,
      `border: ${v('--emp-card-border-width')} solid ${v('--emp-card-border-color')}`,
      `border-radius: ${v('--emp-card-radius')}`,
      `box-shadow: ${v('--emp-card-shadow')}`,
      `padding: ${v('--emp-card-padding')}`,
      `color: ${v('--emp-card-text')}`,
    ]),
    rule('.emp-card__title', [`color: ${v('--emp-card-title')}`]),
    rule('.emp-card:hover', [`background: ${v('--emp-card-hover-bg')}`]),
    '',
    '/* 按钮 */',
    rule('.emp-button', [
      `background: ${v('--emp-button-bg')}`,
      `color: ${v('--emp-button-text')}`,
      `border: ${v('--emp-button-border-width')} solid ${v('--emp-button-border-color')}`,
      `border-radius: ${v('--emp-button-radius')}`,
      `padding: ${v('--emp-button-padding-y')} ${v('--emp-button-padding-x')}`,
      `font-size: ${v('--emp-button-font-size')}`,
      `font-weight: ${v('--emp-button-font-weight')}`,
    ]),
    rule('.emp-button:hover:not(:disabled)', [
      `background: ${v('--emp-button-hover-bg')}`,
    ]),
    rule('.emp-button--secondary', [
      `background: ${v('--emp-button-secondary-bg')}`,
      `color: ${v('--emp-button-secondary-text')}`,
      `border-color: ${v('--emp-button-secondary-border')}`,
    ]),
    rule('.emp-button--secondary:hover:not(:disabled)', [
      `background: ${v('--emp-button-secondary-hover-bg')}`,
    ]),
    rule('.emp-button--danger', [
      `background: ${v('--emp-button-danger-bg')}`,
      `color: ${v('--emp-button-danger-text')}`,
      `border-color: ${v('--emp-button-danger-bg')}`,
    ]),
    rule('.emp-button--danger:hover:not(:disabled)', [
      `background: ${v('--emp-button-danger-hover-bg')}`,
      `border-color: ${v('--emp-button-danger-hover-bg')}`,
    ]),
    rule('.emp-button:disabled', [
      `opacity: ${v('--emp-button-disabled-opacity')}`,
    ]),
    rule('.emp-button--ghost', [
      'background: transparent',
      `color: ${v('--emp-color-primary')}`,
      'border-color: transparent',
    ]),
    rule('.emp-button--ghost:hover:not(:disabled)', [
      `background: ${v('--emp-color-surface-hover')}`,
    ]),
    '',
    '/* 输入框 */',
    rule('.emp-input', [
      `background: ${v('--emp-input-bg')}`,
      `color: ${v('--emp-input-text')}`,
      `border: ${v('--emp-input-border-width')} solid ${v('--emp-input-border-color')}`,
      `border-radius: ${v('--emp-input-radius')}`,
      `padding: ${v('--emp-input-padding-y')} ${v('--emp-input-padding-x')}`,
      `font-size: ${v('--emp-input-font-size')}`,
    ]),
    rule('.emp-input::placeholder', [
      `color: ${v('--emp-input-placeholder')}`,
    ]),
    rule('.emp-input:focus', [
      `border-color: ${v('--emp-input-focus-border-color')}`,
      `box-shadow: ${v('--emp-input-focus-shadow')}`,
    ]),
    rule('.emp-input:disabled', [
      `background: ${v('--emp-input-disabled-bg')}`,
    ]),
    rule('.emp-field__label', [
      `color: ${v('--emp-color-text')}`,
      `font-size: ${v('--emp-font-size-sm')}`,
      `font-weight: ${v('--emp-font-weight-medium')}`,
    ]),
    rule('.emp-field__hint', [
      `color: ${v('--emp-color-text-muted')}`,
      `font-size: ${v('--emp-font-size-sm')}`,
    ]),
    '',
    '/* 选择框 */',
    rule('.emp-select', [
      `background-color: ${v('--emp-select-bg')}`,
      `background-image: linear-gradient(45deg, transparent 50%, ${v('--emp-select-arrow')} 50%), linear-gradient(135deg, ${v('--emp-select-arrow')} 50%, transparent 50%)`,
      `color: ${v('--emp-select-text')}`,
      `border: ${v('--emp-select-border-width')} solid ${v('--emp-select-border-color')}`,
      `border-radius: ${v('--emp-select-radius')}`,
      `padding: ${v('--emp-select-padding-y')} ${v('--emp-select-padding-x')}`,
      `font-size: ${v('--emp-font-size-base')}`,
    ]),
    rule('.emp-select:focus', [
      `border-color: ${v('--emp-select-focus-border-color')}`,
    ]),
    '',
    '/* 勾选与开关 */',
    rule('.emp-check', [`color: ${v('--emp-check-label')}`]),
    rule('.emp-check__control', [
      `width: ${v('--emp-check-size')}`,
      `height: ${v('--emp-check-size')}`,
      `background: ${v('--emp-check-bg')}`,
      `border: ${v('--emp-check-border-width')} solid ${v('--emp-check-border-color')}`,
      `border-radius: ${v('--emp-check-radius')}`,
    ]),
    rule('.emp-check__input:checked + .emp-check__control', [
      `background: ${v('--emp-check-checked-bg')}`,
      `border-color: ${v('--emp-check-checked-border-color')}`,
    ]),
    rule('.emp-check__input:checked + .emp-check__control::after', [
      `border-color: ${v('--emp-check-mark')}`,
    ]),
    rule('.emp-check--switch .emp-check__control', [
      `width: ${v('--emp-switch-width')}`,
      `height: ${v('--emp-switch-height')}`,
      `background: ${v('--emp-switch-track')}`,
    ]),
    rule('.emp-check--switch .emp-check__input:checked + .emp-check__control', [
      `background: ${v('--emp-switch-track-checked')}`,
    ]),
    rule('.emp-check--switch .emp-check__control::after', [
      `width: calc(${v('--emp-switch-height')} - 4px)`,
      `height: calc(${v('--emp-switch-height')} - 4px)`,
      `background: ${v('--emp-switch-thumb')}`,
    ]),
    '',
    '/* 表格 */',
    rule('.emp-table-wrap', [
      `background: ${v('--emp-table-bg')}`,
      `border: 1px solid ${v('--emp-table-border-color')}`,
      `border-radius: ${v('--emp-table-radius')}`,
    ]),
    rule('.emp-table', [
      `color: ${v('--emp-table-text')}`,
      `font-size: ${v('--emp-table-font-size')}`,
    ]),
    rule('.emp-table th', [
      `background: ${v('--emp-table-header-bg')}`,
      `color: ${v('--emp-table-header-text')}`,
      `border-color: ${v('--emp-table-border-color')}`,
      `padding: ${v('--emp-table-cell-padding-y')} ${v('--emp-table-cell-padding-x')}`,
      `font-weight: ${v('--emp-font-weight-semibold')}`,
    ]),
    rule('.emp-table td', [
      `border-color: ${v('--emp-table-border-color')}`,
      `padding: ${v('--emp-table-cell-padding-y')} ${v('--emp-table-cell-padding-x')}`,
    ]),
    rule('.emp-table tbody tr:hover', [
      `background: ${v('--emp-table-row-hover-bg')}`,
    ]),
    '',
    '/* 标签页 */',
    rule('.emp-tabs', [
      `background: ${v('--emp-tabs-bg')}`,
      `border-color: ${v('--emp-tabs-border-color')}`,
    ]),
    rule('.emp-tabs__item', [
      `color: ${v('--emp-tabs-text')}`,
      `border-radius: ${v('--emp-tabs-radius')} ${v('--emp-tabs-radius')} 0 0`,
      `padding: ${v('--emp-tabs-padding-y')} ${v('--emp-tabs-padding-x')}`,
      `font-size: ${v('--emp-tabs-font-size')}`,
    ]),
    rule('.emp-tabs__item:hover', [
      `color: ${v('--emp-tabs-hover-text')}`,
      `background: ${v('--emp-color-surface-hover')}`,
    ]),
    rule('.emp-tabs__item--active', [`color: ${v('--emp-tabs-active-text')}`]),
    rule('.emp-tabs__item--active::after', [
      `background: ${v('--emp-tabs-active-border')}`,
    ]),
    '',
    '/* 徽标 */',
    rule('.emp-badge', [
      `background: ${v('--emp-badge-bg')}`,
      `color: ${v('--emp-badge-text')}`,
      `border-radius: ${v('--emp-badge-radius')}`,
      `padding: ${v('--emp-badge-padding-y')} ${v('--emp-badge-padding-x')}`,
      `font-size: ${v('--emp-badge-font-size')}`,
    ]),
    rule('.emp-badge--success', [
      `background: ${v('--emp-badge-success-bg')}`,
      `color: ${v('--emp-badge-success-text')}`,
    ]),
    rule('.emp-badge--warning', [
      `background: ${v('--emp-badge-warning-bg')}`,
      `color: ${v('--emp-badge-warning-text')}`,
    ]),
    rule('.emp-badge--danger', [
      `background: ${v('--emp-badge-danger-bg')}`,
      `color: ${v('--emp-badge-danger-text')}`,
    ]),
    rule('.emp-badge--info', [
      `background: ${v('--emp-badge-info-bg')}`,
      `color: ${v('--emp-badge-info-text')}`,
    ]),
    '',
    '/* 提示 */',
    rule('.emp-alert', [
      `background: ${v('--emp-alert-bg')}`,
      `color: ${v('--emp-alert-text')}`,
      `border-color: ${v('--emp-alert-border-color')}`,
      `border-radius: ${v('--emp-alert-radius')}`,
      `padding: ${v('--emp-alert-padding')}`,
      `font-size: ${v('--emp-font-size-base')}`,
      `line-height: ${v('--emp-line-height')}`,
    ]),
    rule('.emp-alert__title', [`color: ${v('--emp-alert-title')}`]),
    rule('.emp-alert--success', [
      `background: ${v('--emp-alert-success-bg')}`,
      `color: ${v('--emp-alert-success-text')}`,
      `border-color: ${v('--emp-alert-success-border')}`,
    ]),
    rule('.emp-alert--success .emp-alert__title', [
      `color: ${v('--emp-alert-success-text')}`,
    ]),
    rule('.emp-alert--warning', [
      `background: ${v('--emp-alert-warning-bg')}`,
      `color: ${v('--emp-alert-warning-text')}`,
      `border-color: ${v('--emp-alert-warning-border')}`,
    ]),
    rule('.emp-alert--warning .emp-alert__title', [
      `color: ${v('--emp-alert-warning-text')}`,
    ]),
    rule('.emp-alert--danger', [
      `background: ${v('--emp-alert-danger-bg')}`,
      `color: ${v('--emp-alert-danger-text')}`,
      `border-color: ${v('--emp-alert-danger-border')}`,
    ]),
    rule('.emp-alert--danger .emp-alert__title', [
      `color: ${v('--emp-alert-danger-text')}`,
    ]),
    '',
    '/* 弹窗 */',
    rule('.emp-dialog-wrap--overlay', [
      `background: ${v('--emp-dialog-overlay-bg')}`,
    ]),
    rule('.emp-dialog', [
      `background: ${v('--emp-dialog-bg')}`,
      `color: ${v('--emp-dialog-text')}`,
      `border: 1px solid ${v('--emp-dialog-border-color')}`,
      `border-radius: ${v('--emp-dialog-radius')}`,
      `box-shadow: ${v('--emp-dialog-shadow')}`,
      `padding: ${v('--emp-dialog-padding')}`,
    ]),
    rule('.emp-dialog__title', [
      `color: ${v('--emp-dialog-title')}`,
      `font-size: ${v('--emp-font-size-lg')}`,
      `font-weight: ${v('--emp-font-weight-semibold')}`,
    ]),
    rule('.emp-dialog__close:hover', [
      `color: ${v('--emp-color-text-muted')}`,
    ]),
    '',
    '/* 工具栏与侧栏 */',
    rule('.emp-toolbar', [
      `background: ${v('--emp-toolbar-bg')}`,
      `color: ${v('--emp-toolbar-text')}`,
      `border-color: ${v('--emp-toolbar-border-color')}`,
      `min-height: ${v('--emp-toolbar-height')}`,
      `padding-left: ${v('--emp-toolbar-padding-x')}`,
      `padding-right: ${v('--emp-toolbar-padding-x')}`,
    ]),
    rule('.emp-nav', [
      `background: ${v('--emp-nav-bg')}`,
      `color: ${v('--emp-nav-text')}`,
      `border-color: ${v('--emp-nav-border-color')}`,
      `width: ${v('--emp-nav-width')}`,
    ]),
    rule('.emp-nav--active', [
      `background: ${v('--emp-nav-active-bg')}`,
      `color: ${v('--emp-nav-active-text')}`,
    ]),
    '',
    '/* 分页 */',
    rule('.emp-pagination__item', [
      `background: ${v('--emp-pagination-bg')}`,
      `color: ${v('--emp-pagination-text')}`,
      `border: 1px solid ${v('--emp-pagination-border-color')}`,
      `border-radius: ${v('--emp-pagination-radius')}`,
      `min-width: ${v('--emp-pagination-size')}`,
      `height: ${v('--emp-pagination-size')}`,
      `font-size: ${v('--emp-font-size-sm')}`,
    ]),
    rule('.emp-pagination__item:hover:not(:disabled)', [
      `background: ${v('--emp-pagination-hover-bg')}`,
    ]),
    rule('.emp-pagination__item--active', [
      `background: ${v('--emp-pagination-active-bg')}`,
      `color: ${v('--emp-pagination-active-text')}`,
      `border-color: ${v('--emp-pagination-active-bg')}`,
    ]),
    '',
    '/* 空状态 */',
    rule('.emp-empty', [
      `background: ${v('--emp-empty-bg')}`,
      `border-color: ${v('--emp-empty-border-color')}`,
      `border-radius: ${v('--emp-empty-radius')}`,
      `padding: ${v('--emp-empty-padding')}`,
    ]),
    rule('.emp-empty__title', [
      `color: ${v('--emp-empty-title')}`,
      `font-size: ${v('--emp-font-size-lg')}`,
      `font-weight: ${v('--emp-font-weight-medium')}`,
    ]),
    rule('.emp-empty__text', [
      `color: ${v('--emp-empty-text')}`,
      `font-size: ${v('--emp-font-size-sm')}`,
    ]),
    rule('.emp-empty__icon', [`color: ${v('--emp-empty-icon')}`]),
    '',
    ...customRuleBlocks,
  ];

  return `${blocks.join('\n')}\n`;
}
