#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SPEC_PATH = path.resolve(__dirname, '../docs/openapi.json');
const OUTPUT_PATH = path.resolve(__dirname, '../src/types/generated.ts');
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));

function main() {
  const operations = collectOperations(spec);
  const chunks = [];

  chunks.push('// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.');
  chunks.push('// Run `node scripts/generate-types.js` after updating docs/openapi.json.');
  chunks.push("import type { MeestResponse } from './base';");
  chunks.push('');

  for (const op of operations) {
    chunks.push(...renderOperation(op));
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, chunks.join('\n'), 'utf8');
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
        baseName = `${baseName}${count + 1}`;
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
  if (operation.description) {
    section.push(`// ${collapseWhitespace(operation.description)}`);
  }

  const bodyParam = operation.parameters.find((param) => param.in === 'body');
  const queryParams = operation.parameters.filter((param) => param.in === 'query');
  const pathParams = operation.parameters.filter((param) => param.in === 'path');

  if (bodyParam && bodyParam.schema) {
    section.push(renderTypeAlias(`${baseName}RequestBody`, bodyParam.schema, bodyParam.description));
  }

  if (queryParams.length > 0) {
    section.push(renderParamsInterface(`${baseName}QueryParams`, queryParams));
  }

  if (pathParams.length > 0) {
    section.push(renderParamsInterface(`${baseName}PathParams`, pathParams));
  }

  const responseSchema = (operation.responses['200'] && operation.responses['200'].schema) || null;
  const resultSchema = responseSchema && responseSchema.properties ? responseSchema.properties.result : responseSchema;
  let resultTypeName = 'void';

  if (resultSchema) {
    section.push(renderTypeAlias(`${baseName}Result`, resultSchema, 'Result payload'));
    resultTypeName = `${baseName}Result`;
  }

  section.push(`export type ${baseName}Response = MeestResponse<${resultTypeName}>;`);

  const requestInterface = [];
  requestInterface.push(`export interface ${baseName}Request {`);
  if (pathParams.length > 0) {
    requestInterface.push(`  path: ${baseName}PathParams;`);
  }
  if (queryParams.length > 0) {
    const hasRequired = queryParams.some((param) => param.required);
    requestInterface.push(`  query${hasRequired ? '' : '?'}: ${baseName}QueryParams;`);
  }
  if (bodyParam && bodyParam.schema) {
    requestInterface.push(`  body${bodyParam.required ? '' : '?'}: ${baseName}RequestBody;`);
  }
  if (requestInterface.length === 1) {
    requestInterface.push('  // no parameters');
  }
  requestInterface.push('}');
  section.push(requestInterface.join('\n'));

  section.push('');
  return section;
}

function renderParamsInterface(name, parameters) {
  const lines = [`export interface ${name} {`];
  for (const param of parameters) {
    const typeExpression = renderSchema(param, 2, `${name}${toPascal(param.name || 'Param')}`);
    const optional = !param.required;
    const doc = param.description ? `${indent(2)}/** ${collapseWhitespace(param.description)} */\n` : '';
    lines.push(`${doc}${indent(2)}${sanitizePropName(param.name || 'param')}${optional ? '?' : ''}: ${typeExpression};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function renderTypeAlias(name, schema, description) {
  const doc = description ? `/** ${collapseWhitespace(description)} */\n` : '';
  const typeExpression = renderSchema(schema, 1, name);
  return `${doc}export type ${name} = ${typeExpression};`;
}

function renderSchema(schema, level, nameHint) {
  if (!schema || typeof schema !== 'object') {
    return 'unknown';
  }

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum.map((value) => JSON.stringify(value)).join(' | ');
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
        const doc = propSchema && propSchema.description ? `${innerIndent}/** ${collapseWhitespace(propSchema.description)} */\n` : '';
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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
  return JSON.stringify(name);
}

function collapseWhitespace(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

main();
