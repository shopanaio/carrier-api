// Loads the Meest Swagger snapshot and removes `required` entries that name a property the schema does not have.
// The snapshot lists `parcelID` as required at the root of the register bodies while it only exists inside
// `parcelsItems`; taken literally no register call could ever be valid.
const fs = require('fs');
const path = require('path');

const SNAPSHOT = path.resolve(__dirname, '../contracts/meest-contract.swagger.json');

function prune(node, trail, report) {
  if (Array.isArray(node)) return node.forEach((item, i) => prune(item, `${trail}[${i}]`, report));
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.required) && node.properties && typeof node.properties === 'object') {
    const dangling = node.required.filter(name => !(name in node.properties));
    if (dangling.length) {
      node.required = node.required.filter(name => name in node.properties);
      if (node.required.length === 0) delete node.required;
      report.push(`${trail}: dropped required ${dangling.join(', ')}`);
    }
  }
  for (const [key, value] of Object.entries(node)) prune(value, `${trail}/${key}`, report);
}

function loadSwagger() {
  const swagger = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const report = [];
  prune(swagger.paths, '#/paths', report);
  return { swagger, report };
}

module.exports = { loadSwagger, SNAPSHOT };
