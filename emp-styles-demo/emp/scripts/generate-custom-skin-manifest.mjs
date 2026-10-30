#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const empRoot = resolve(scriptDir, '..');
const repoRoot = resolve(empRoot, '..');
const bikeRoot = join(repoRoot, 'bike-tower');
const propertiesFile = join(scriptDir, 'skin-properties.json');
const overridesFile = join(scriptDir, 'custom-skin-overrides.json');
const outputFile = join(
  empRoot,
  'src/app/pages/skin-editor/custom-skin.generated.ts',
);

const readJson = (file, fallback) => {
  if (!existsSync(file)) {
    return fallback;
  }
  return JSON.parse(readFileSync(file, 'utf8'));
};

const properties = readJson(propertiesFile, {});
const overrides = readJson(overridesFile, {});

const scanRoots = [
  {
    dir: join(empRoot, 'src/app/components'),
    namespace: 'emp',
    keyNamespace: 'custom',
    prefix: '--emp-custom-',
    showcaseOutput: join(
      empRoot,
      'src/app/pages/showcase/custom-showcase.generated.ts',
    ),
  },
  {
    dir: join(bikeRoot, 'src/app/components'),
    namespace: 'bt',
    keyNamespace: 'bt',
    prefix: '--emp-bt-',
    showcaseOutput: join(
      bikeRoot,
      'src/app/pages/showcase/custom-showcase.generated.ts',
    ),
  },
];

const keyPattern = /^--emp-(bt|custom)-([a-z0-9-]+)--([a-z0-9-]+)$/;
const declarationPattern =
  /(--emp-(?:bt|custom)-[a-z0-9-]+--[a-z0-9-]+)\s*:\s*([^;]+);/g;

function walkLess(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.angular') {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkLess(full, files);
    } else if (entry.endsWith('.less')) {
      files.push(full);
    }
  }
  return files;
}

function walkComponentTs(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.angular') {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkComponentTs(full, files);
    } else if (entry.endsWith('.component.ts') && !entry.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

function getDecorators(node) {
  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
}

function getDecoratorName(decorator) {
  const expression = decorator.expression;
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
    return expression.expression.text;
  }
  return '';
}

function getObjectProperty(object, name) {
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      property.name &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === name
    ) {
      return property.initializer;
    }
  }
  return undefined;
}

function evaluateExpression(node) {
  if (!node) {
    return undefined;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }
  if (ts.isParenthesizedExpression(node)) {
    return evaluateExpression(node.expression);
  }
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken
  ) {
    const value = evaluateExpression(node.operand);
    return typeof value === 'number' ? -value : undefined;
  }
  if (ts.isArrayLiteralExpression(node)) {
    const result = [];
    for (const element of node.elements) {
      if (ts.isSpreadElement(element)) {
        return undefined;
      }
      const value = evaluateExpression(element);
      if (value === undefined) {
        return undefined;
      }
      result.push(value);
    }
    return result;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property) || !property.name) {
        return undefined;
      }
      if (
        !ts.isIdentifier(property.name) &&
        !ts.isStringLiteral(property.name)
      ) {
        return undefined;
      }
      const value = evaluateExpression(property.initializer);
      if (value === undefined) {
        return undefined;
      }
      result[property.name.text] = value;
    }
    return result;
  }
  return undefined;
}

function parseInputMember(member) {
  if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
    return null;
  }

  const name = member.name.text;
  const inputDecorator = getDecorators(member).find(
    (decorator) => getDecoratorName(decorator) === 'Input',
  );

  if (inputDecorator) {
    const expression = inputDecorator.expression;
    let alias = name;
    let required = false;

    if (ts.isCallExpression(expression) && expression.arguments[0]) {
      const argument = expression.arguments[0];
      if (ts.isStringLiteral(argument)) {
        alias = argument.text;
      } else if (ts.isObjectLiteralExpression(argument)) {
        const aliasNode = getObjectProperty(argument, 'alias');
        if (aliasNode && ts.isStringLiteral(aliasNode)) {
          alias = aliasNode.text;
        }
        const requiredNode = getObjectProperty(argument, 'required');
        required = requiredNode?.kind === ts.SyntaxKind.TrueKeyword;
      }
    }

    return {
      name: alias,
      defaultValue: evaluateExpression(member.initializer),
      required,
    };
  }

  const initializer = member.initializer;
  if (!initializer || !ts.isCallExpression(initializer)) {
    return null;
  }

  const callee = initializer.expression;
  let required = false;

  if (ts.isIdentifier(callee) && callee.text === 'input') {
    required = false;
  } else if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'input' &&
    callee.name.text === 'required'
  ) {
    required = true;
  } else {
    return null;
  }

  const optionsNode = required
    ? initializer.arguments[0]
    : initializer.arguments[1];
  let alias = name;

  if (optionsNode && ts.isObjectLiteralExpression(optionsNode)) {
    const aliasNode = getObjectProperty(optionsNode, 'alias');
    if (aliasNode && ts.isStringLiteral(aliasNode)) {
      alias = aliasNode.text;
    }
  }

  return {
    name: alias,
    defaultValue: required
      ? undefined
      : evaluateExpression(initializer.arguments[0]),
    required,
  };
}

function parseComponentFile(file, root) {
  const source = readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) {
      continue;
    }

    const componentDecorator = getDecorators(statement).find(
      (decorator) => getDecoratorName(decorator) === 'Component',
    );
    if (!componentDecorator) {
      continue;
    }

    const expression = componentDecorator.expression;
    const metadata = ts.isCallExpression(expression)
      ? expression.arguments[0]
      : undefined;
    if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
      return null;
    }

    const selectorNode = getObjectProperty(metadata, 'selector');
    const standaloneNode = getObjectProperty(metadata, 'standalone');
    if (!selectorNode || !ts.isStringLiteral(selectorNode)) {
      return null;
    }
    if (standaloneNode?.kind === ts.SyntaxKind.FalseKeyword) {
      return null;
    }

    let hasContentProjection = false;
    const templateNode = getObjectProperty(metadata, 'template');
    if (templateNode && ts.isStringLiteralLike(templateNode)) {
      hasContentProjection = templateNode.text.includes('ng-content');
    } else {
      const templateUrlNode = getObjectProperty(metadata, 'templateUrl');
      if (templateUrlNode && ts.isStringLiteral(templateUrlNode)) {
        const templateUrl = resolve(dirname(file), templateUrlNode.text);
        if (existsSync(templateUrl)) {
          hasContentProjection = readFileSync(templateUrl, 'utf8').includes(
            'ng-content',
          );
        }
      }
    }

    const selector = selectorNode.text.split(',')[0].trim();
    const fallbackComponent = basename(file).replace(/\.component\.ts$/, '');
    const prefix = root.namespace === 'emp' ? 'emp-custom-' : 'bt-';
    const component = selector.startsWith(prefix)
      ? selector.slice(prefix.length)
      : fallbackComponent;
    const inputs = {};
    const requiredInputs = [];

    for (const member of statement.members) {
      const input = parseInputMember(member);
      if (!input) {
        continue;
      }
      if (input.required) {
        requiredInputs.push(input.name);
      }
      if (input.defaultValue !== undefined) {
        inputs[input.name] = input.defaultValue;
      }
    }

    return {
      className: statement.name.text,
      selector,
      component,
      inputs,
      requiredInputs,
      hasContentProjection,
      file,
    };
  }

  return null;
}

function splitFirstTopLevelComma(value) {
  let depth = 0;
  let quote = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (quote) {
      if (char === '\\') {
        index += 1;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      return [value.slice(0, index), value.slice(index + 1)];
    }
  }
  return null;
}

function collectVariables(source) {
  const result = new Map();

  let searchFrom = 0;
  while ((searchFrom = source.indexOf('var(', searchFrom)) !== -1) {
    let depth = 1;
    let quote = '';
    let index = searchFrom + 4;
    for (; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') {
          index += 1;
        } else if (char === quote) {
          quote = '';
        }
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
    }
    const inner = source.slice(searchFrom + 4, index);
    const parts = splitFirstTopLevelComma(inner);
    if (parts) {
      const key = parts[0].trim();
      const fallback = parts[1].trim();
      if (!result.has(key)) {
        result.set(key, fallback);
      }
    }
    searchFrom = index + 1;
  }

  for (const match of source.matchAll(declarationPattern)) {
    const key = match[1];
    if (!result.has(key)) {
      result.set(key, match[2].trim());
    }
  }

  return result;
}

function inferType(property) {
  if (property === 'shadow') {
    return 'shadow';
  }
  if (
    /(radius|width|height|padding|margin|gap|size|length|font-size|line-height)/.test(
      property,
    )
  ) {
    return 'length';
  }
  if (
    /(background|text|title|label|value|meta|up|down|color|fill|status|line|dot|active)/.test(
      property,
    )
  ) {
    return 'color';
  }
  return 'text';
}

function titleCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

const groups = new Map();

for (const root of scanRoots) {
  const files = walkLess(root.dir).sort();

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const variables = collectVariables(source);

    for (const [key, fallback] of variables) {
      const match = keyPattern.exec(key);
      if (!match || match[1] !== root.keyNamespace) {
        continue;
      }

      const component = match[2];
      const property = match[3];
      const groupId = `${root.namespace}:${component}`;
      const propertyDef = properties[property] ?? {};
      const field = {
        key,
        label: propertyDef.label ?? titleCase(property),
        type: propertyDef.type ?? inferType(property),
        default: fallback || propertyDef.default || '',
      };

      let group = groups.get(groupId);
      if (!group) {
        group = {
          namespace: root.namespace,
          component,
          fields: new Map(),
        };
        groups.set(groupId, group);
      }
      if (!group.fields.has(key)) {
        group.fields.set(key, field);
      }
    }
  }
}

const result = [...groups.values()].map((group) => {
  const overrideKey = `${group.namespace}:${group.component}`;
  const override = overrides[overrideKey] ?? {};
  const defaultSelector =
    group.namespace === 'emp'
      ? `emp-custom-${group.component}, .emp-custom-${group.component}`
      : `bt-${group.component}, .bt-${group.component}`;
  const defaultRootClass =
    group.namespace === 'emp'
      ? `.emp-custom-${group.component}`
      : `.bt-${group.component}`;
  const rootClass = override.rootClass ?? defaultRootClass;
  const fields = [...group.fields.values()];
  const autoRule = {
    selector: rootClass,
    declarations: fields.map((field) => ({
      property: field.key,
      field: field.key,
    })),
  };
  const extraRules = Array.isArray(override.classRules)
    ? override.classRules
    : [];

  return {
    id: `custom-${group.namespace}-${group.component}`,
    label: `自定义 · ${override.label ?? titleCase(group.component)}`,
    kind: 'custom',
    selector: override.selector ?? defaultSelector,
    previewTarget: group.namespace === 'emp' ? 'emp' : 'bike-tower',
    fields,
    classRules: fields.length ? [autoRule, ...extraRules] : extraRules,
  };
});

result.sort((a, b) => a.id.localeCompare(b.id));

const content = `// AUTO-GENERATED by scripts/generate-custom-skin-manifest.mjs
// Run \`npm run skins:manifest\` after adding or changing custom component variables.

import type { SkinGroup } from './skin-schema';

export const GENERATED_CUSTOM_GROUPS: SkinGroup[] = ${JSON.stringify(
  result,
  null,
  2,
)};
`;

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, content);

console.log(
  `Generated ${result.length} custom skin groups (${result.reduce(
    (total, group) => total + group.fields.length,
    0,
  )} fields) -> ${outputFile}`,
);

function getDefaultsFile(file) {
  return file.replace(/\.component\.ts$/, '.defaults.json');
}

function asInputs(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function buildShowcaseEntries(root) {
  const entries = [];

  for (const file of walkComponentTs(root.dir).sort()) {
    const component = parseComponentFile(file, root);
    if (!component) {
      continue;
    }

    const key = `${root.namespace}:${component.component}`;
    const defaults = readJson(getDefaultsFile(file), {});
    if (defaults.auto === false) {
      continue;
    }
    if (component.hasContentProjection && defaults.auto !== true) {
      console.warn(
        `[showcase] skip ${key}: uses ng-content; set "auto": true in ${getDefaultsFile(
          file,
        )} to render it`,
      );
      continue;
    }

    const baseInputs = {
      ...component.inputs,
      ...asInputs(defaults.inputs),
    };
    const rawVariants =
      Array.isArray(defaults.variants) && defaults.variants.length
        ? defaults.variants
        : [{ inputs: {} }];
    const variants = [];
    let invalid = false;

    for (const [index, rawVariant] of rawVariants.entries()) {
      const inputs = {
        ...baseInputs,
        ...asInputs(rawVariant?.inputs),
      };
      const missingRequired = component.requiredInputs.filter(
        (name) => !Object.prototype.hasOwnProperty.call(inputs, name),
      );

      if (missingRequired.length) {
        console.warn(
          `[showcase] skip ${key}: provide required inputs in ${getDefaultsFile(
            file,
          )} variant ${index}: ${missingRequired.join(', ')}`,
        );
        invalid = true;
        break;
      }

      variants.push({ inputs });
    }

    if (invalid || !variants.length) {
      continue;
    }

    entries.push({
      id: key,
      label:
        defaults.label ??
        overrides[key]?.label ??
        titleCase(component.component),
      selector: component.selector,
      className: component.className,
      file,
      variants,
      layout:
        defaults.layout === 'grid' || defaults.layout === 'block'
          ? defaults.layout
          : variants.length > 1
            ? 'grid'
            : 'block',
      order:
        typeof defaults.order === 'number' ? defaults.order : entries.length,
    });
  }

  return entries.sort(
    (left, right) =>
      left.order - right.order || left.id.localeCompare(right.id),
  );
}

function writeShowcaseFile(root) {
  const entries = buildShowcaseEntries(root);
  const output = root.showcaseOutput;
  const outputDir = dirname(output);
  const usedNames = new Set();
  const importLines = [];

  for (const entry of entries) {
    let localName = entry.className;
    let suffix = 2;
    while (usedNames.has(localName)) {
      localName = `${entry.className}${suffix}`;
      suffix += 1;
    }
    usedNames.add(localName);
    entry.localName = localName;

    let importPath = relative(outputDir, entry.file)
      .replace(/\\/g, '/')
      .replace(/\.ts$/, '');
    if (!importPath.startsWith('.')) {
      importPath = `./${importPath}`;
    }

    importLines.push(
      localName === entry.className
        ? `import { ${entry.className} } from '${importPath}';`
        : `import { ${entry.className} as ${localName} } from '${importPath}';`,
    );
  }

  importLines.sort();

  const entryLines = entries.map((entry) => {
    const variantLines = entry.variants.map((variant) => {
      const inputs = JSON.stringify(variant.inputs, null, 2).replace(
        /\n/g,
        '\n        ',
      );

      return `      {
        inputs: ${inputs},
      },`;
    });

    return `  {
    id: ${JSON.stringify(entry.id)},
    label: ${JSON.stringify(entry.label)},
    selector: ${JSON.stringify(entry.selector)},
    component: ${entry.localName},
    variants: [
${variantLines.join('\n')}
    ],
    layout: ${JSON.stringify(entry.layout)},
    order: ${entry.order},
  },`;
  });

  const arrayBody = entryLines.length
    ? `\n${entryLines.join('\n')}\n`
    : '';
  const content = `// AUTO-GENERATED by scripts/generate-custom-skin-manifest.mjs
// Run \`npm run skins:manifest\` after adding, removing or changing custom components.

import type { Type } from '@angular/core';
${importLines.join('\n')}

export interface GeneratedShowcaseVariant {
  inputs: Record<string, unknown>;
}

export interface GeneratedShowcaseEntry {
  id: string;
  label: string;
  selector: string;
  component: Type<unknown>;
  variants: GeneratedShowcaseVariant[];
  layout: 'block' | 'grid';
  order: number;
}

export const GENERATED_SHOWCASE_ENTRIES: GeneratedShowcaseEntry[] = [${arrayBody}];
`;

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(output, content);

  console.log(
    `Generated ${entries.length} showcase entries -> ${output}`,
  );
}

for (const root of scanRoots) {
  writeShowcaseFile(root);
}
