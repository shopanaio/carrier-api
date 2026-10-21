#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SPEC_PATH = path.resolve(__dirname, '../contracts/meest-contract.swagger.json');
const OUTPUT_PATH = path.resolve(__dirname, '../src/contract/types/generated.ts');
const PINS_PATH = path.resolve(__dirname, '../type-tests/fields.generated.ts');
const { loadSwagger } = require('./contract-source');
const pins = [];
const spec = loadSwagger().swagger;

function main() {
  const operations = collectOperations(spec);
  const chunks = [];

  chunks.push('// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.');
  chunks.push('// Run `node scripts/generate-types.js` after updating contracts/meest-contract.swagger.json.');
  chunks.push("import type { MeestResponse } from './envelope';");
  chunks.push('');

  for (const op of operations) {
    chunks.push(...renderOperation(op));
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, chunks.join('\n'), 'utf8');

  const header = [
    '// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.',
    '// Pins the exact field set (names and optionality) and primitive types of every request and response type,',
    '// walking the Swagger snapshot independently of the type renderer. Run `yarn generate:types` to refresh.',
    "import type * as T from '../src';",
    '',
    'type Eq<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;',
    'type Assert<V extends true> = V;',
    'type Req<O> = { [K in keyof O]-?: {} extends Pick<O, K> ? never : K }[keyof O];',
    '',
  ];
  fs.mkdirSync(path.dirname(PINS_PATH), { recursive: true });
  const pinText = [...header, ...pins, '']
    .join('\n')
    .replace(/[\u0080-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  fs.writeFileSync(PINS_PATH, pinText, 'utf8');
}

// ---- field pins ----

function quote(value) {
  return asciiJson(value)
    .replace(/^"|"$/g, "'")
    .replace(/\\"/g, '"')
    .replace(/'/g, "\\'")
    .replace(/^\\'|\\'$/g, "'");
}

function keyLiteral(name) {
  return `'${asciiJson(name).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
}

function pinSchema(expr, schema, label) {
  if (!schema || typeof schema !== 'object') return;
  const type = schema.type || (schema.properties ? 'object' : undefined);
  const node = `NonNullable<${expr}>`;
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    pins.push(
      `export type Pin${pins.length} = Assert<Eq<${node}, ${schema.enum.map(v => keyLiteral(String(v))).join(' | ')}>>; // ${label}`,
    );
    return;
  }
  switch (type) {
    case 'object': {
      const props = schema.properties || {};
      const keys = Object.keys(props);
      if (keys.length === 0) {
        pins.push(`export type Pin${pins.length} = Assert<Eq<${node}, Record<string, unknown>>>; // ${label}`);
        return;
      }
      const required = keys.filter(k => (schema.required || []).includes(k));
      pins.push(
        `export type Pin${pins.length} = Assert<Eq<keyof ${node}, ${keys.map(keyLiteral).join(' | ')}>>; // ${label} keys`,
      );
      pins.push(
        `export type Pin${pins.length} = Assert<Eq<Req<${node}>, ${required.length ? required.map(keyLiteral).join(' | ') : 'never'}>>; // ${label} required`,
      );
      for (const key of keys) pinSchema(`${node}[${keyLiteral(key)}]`, props[key], `${label}.${key}`);
      return;
    }
    case 'array':
      pinSchema(`${node}[number]`, schema.items || { type: 'object' }, `${label}[]`);
      return;
    case 'integer':
    case 'number':
      pins.push(`export type Pin${pins.length} = Assert<Eq<${node}, number>>; // ${label}`);
      return;
    case 'boolean':
      pins.push(`export type Pin${pins.length} = Assert<Eq<${node}, boolean>>; // ${label}`);
      return;
    case 'string':
      pins.push(`export type Pin${pins.length} = Assert<Eq<${node}, string>>; // ${label}`);
      return;
    default:
  }
}

function pinParams(typeName, parameters) {
  const keys = parameters.map(param => param.name);
  pins.push(
    `export type Pin${pins.length} = Assert<Eq<keyof T.${typeName}, ${keys.map(keyLiteral).join(' | ')}>>; // ${typeName} keys`,
  );
  const required = parameters.filter(param => param.required).map(param => param.name);
  pins.push(
    `export type Pin${pins.length} = Assert<Eq<Req<T.${typeName}>, ${required.length ? required.map(keyLiteral).join(' | ') : 'never'}>>; // ${typeName} required`,
  );
  for (const param of parameters)
    pinSchema(`T.${typeName}[${keyLiteral(param.name)}]`, param, `${typeName}.${param.name}`);
}

function collectOperations(document) {
  const operations = [];
  const duplicateCounter = new Map();

  for (const [route, pathItem] of Object.entries(document.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (!operation || typeof operation !== 'object') continue;
      const verb = method.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(verb)) continue;
      const operationId = operation.operationId || `${verb}_${route}`.replace(/\W+/g, '_');
      let baseName = toPascal(operationId.replace(/_(get|post|put|patch|delete)$/i, ''));
      if (!baseName) {
        baseName = toPascal(`${verb}_${route}`);
      }
      const key = baseName;
      const count = duplicateCounter.get(key) || 0;
      if (count > 0) {
        baseName = `${baseName}${verb[0]}${verb.slice(1).toLowerCase()}`;
      }
      duplicateCounter.set(key, count + 1);
      operations.push({
        tag: (operation.tags && operation.tags[0]) || 'misc',
        method: verb,
        path: route,
        baseName,
        description: operation.summary || operation.description || '',
        parameters: operation.parameters || [],
        responses: operation.responses || {},
      });
    }
  }

  operations.sort((a, b) => {
    if (a.tag === b.tag) {
      return a.baseName.localeCompare(b.baseName);
    }
    return a.tag.localeCompare(b.tag);
  });
  return operations;
}

function renderOperation(operation) {
  const section = [];
  const { baseName, method, path, tag } = operation;
  section.push(`// ${tag} :: ${method} ${path}`);
  if (collapseWhitespace(operation.description)) {
    section.push(`// ${collapseWhitespace(operation.description)}`);
  }

  const bodyParam = operation.parameters.find(param => param.in === 'body');
  const queryParams = operation.parameters.filter(param => param.in === 'query');
  const pathParams = operation.parameters.filter(param => param.in === 'path');

  if (bodyParam && bodyParam.schema) {
    section.push(renderTypeAlias(`${baseName}RequestBody`, bodyParam.schema, bodyParam.description));
    pinSchema(`T.${baseName}RequestBody`, bodyParam.schema, `${baseName}RequestBody`);
  }

  if (queryParams.length > 0) {
    section.push(renderParamsInterface(`${baseName}QueryParams`, queryParams));
    pinParams(`${baseName}QueryParams`, queryParams);
  }

  if (pathParams.length > 0) {
    section.push(renderParamsInterface(`${baseName}PathParams`, pathParams));
    pinParams(`${baseName}PathParams`, pathParams);
  }

  const responseSchema = (operation.responses['200'] && operation.responses['200'].schema) || null;
  // Most responses use the { status, info, result } envelope; a few are documented as the bare payload.
  const isEnvelope = Boolean(responseSchema && responseSchema.properties && responseSchema.properties.status);
  const resultSchema = isEnvelope ? responseSchema.properties.result : responseSchema;
  let resultTypeName = 'void';

  if (resultSchema) {
    section.push(renderTypeAlias(`${baseName}Result`, resultSchema, 'Result payload'));
    resultTypeName = `${baseName}Result`;
    pinSchema(`T.${baseName}Result`, resultSchema, `${baseName}Result`);
  }

  section.push(
    isEnvelope || !resultSchema
      ? `export type ${baseName}Response = MeestResponse<${resultTypeName}>;`
      : `export type ${baseName}Response = ${resultTypeName};`,
  );

  const requestInterface = [];
  requestInterface.push(`export interface ${baseName}Request {`);
  if (pathParams.length > 0) {
    requestInterface.push(`  path: ${baseName}PathParams;`);
  }
  if (queryParams.length > 0) {
    const hasRequired = queryParams.some(param => param.required);
    requestInterface.push(`  query${hasRequired ? '' : '?'}: ${baseName}QueryParams;`);
  }
  if (bodyParam && bodyParam.schema) {
    requestInterface.push(`  body${bodyParam.required ? '' : '?'}: ${baseName}RequestBody;`);
  }
  if (requestInterface.length === 1) {
    // An empty interface would accept any value; an operation without parameters takes an empty object.
    section.push(`export type ${baseName}Request = Record<string, never>;`);
  } else {
    requestInterface.push('}');
    section.push(requestInterface.join('\n'));
  }

  section.push('');
  return section;
}

function renderParamsInterface(name, parameters) {
  const lines = [`export interface ${name} {`];
  for (const param of parameters) {
    const typeExpression = renderSchema(param, 2, `${name}${toPascal(param.name || 'Param')}`);
    const optional = !param.required;
    const doc = collapseWhitespace(param.description)
      ? `${indent(2)}/** ${collapseWhitespace(param.description)} */\n`
      : '';
    lines.push(
      `${doc}${indent(2)}${sanitizePropName(param.name || 'param')}${optional ? '?' : ''}: ${typeExpression};`,
    );
  }
  lines.push('}');
  return lines.join('\n');
}

function renderTypeAlias(name, schema, description) {
  const doc = collapseWhitespace(description) ? `/** ${collapseWhitespace(description)} */\n` : '';
  const typeExpression = renderSchema(schema, 1, name);
  return `${doc}export type ${name} = ${typeExpression};`;
}

function renderSchema(schema, level, nameHint) {
  if (!schema || typeof schema !== 'object') {
    return 'unknown';
  }

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum.map(value => asciiJson(value)).join(' | ');
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    return schema.allOf.map((item, index) => renderSchema(item, level, `${nameHint}Part${index + 1}`)).join(' & ');
  }

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return schema.oneOf.map((item, index) => renderSchema(item, level, `${nameHint}Option${index + 1}`)).join(' | ');
  }

  const type = schema.type || (schema.properties ? 'object' : undefined);

  switch (type) {
    case 'object': {
      const properties = schema.properties || {};
      const keys = Object.keys(properties);
      if (keys.length === 0) {
        return 'Record<string, unknown>';
      }
      const required = new Set(schema.required || []);
      const outerIndent = indent(level - 1);
      const innerIndent = indent(level);
      const lines = ['{'];
      for (const key of keys) {
        const propSchema = properties[key];
        const propType = renderSchema(propSchema, level + 1, `${nameHint}${toPascal(key)}`);
        const optional = !required.has(key);
        const doc =
          propSchema && collapseWhitespace(propSchema.description)
            ? `${innerIndent}/** ${collapseWhitespace(propSchema.description)} */\n`
            : '';
        lines.push(`${doc}${innerIndent}${sanitizePropName(key)}${optional ? '?' : ''}: ${propType};`);
      }
      lines.push(`${outerIndent}}`);
      return lines.join('\n');
    }
    case 'array': {
      const items = schema.items || { type: 'object' };
      const itemType = renderSchema(items, level + 1, `${nameHint}Item`);
      return `Array<${itemType}>`;
    }
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'string':
      if (schema.format === 'date-time' || schema.format === 'date') {
        return 'string';
      }
      return 'string';
    default:
      return 'unknown';
  }
}

function toPascal(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function indent(level) {
  if (level <= 0) return '';
  return '  '.repeat(level);
}

function sanitizePropName(name) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    return name;
  }
  return asciiJson(name);
}

// The vendor's descriptions are not in English; the generated file only keeps English text, so a description
// with other characters is dropped instead of being copied into the sources.
function collapseWhitespace(text) {
  const collapsed = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  return /^[\x20-\x7e]*$/.test(collapsed) ? collapsed : '';
}

// Wire names may contain look-alike non-ASCII letters (the API spells one key with a Cyrillic letter); they are
// written as \u escapes so the source stays ASCII.
function asciiJson(value) {
  return JSON.stringify(value).replace(/[\u0080-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

main();
