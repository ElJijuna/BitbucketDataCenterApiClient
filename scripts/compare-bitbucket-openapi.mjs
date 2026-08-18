import { readFile } from 'node:fs/promises';

const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put']);
const [beforePath, afterPath] = process.argv.slice(2);

if (!beforePath || !afterPath) {
  console.error('Usage: node scripts/compare-bitbucket-openapi.mjs <before.json> <after.json>');
  process.exit(1);
}

const [before, after] = await Promise.all(
  [beforePath, afterPath].map(async (path) => JSON.parse(await readFile(path, 'utf8'))),
);

function collectOperations(specification) {
  const operations = new Map();

  for (const [path, pathItem] of Object.entries(specification.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (HTTP_METHODS.has(method)) {
        operations.set(`${method.toUpperCase()} ${path}`, operation);
      }
    }
  }

  return operations;
}

function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, sortDeep(nestedValue)]),
    );
  }

  return value;
}

function fingerprint(value) {
  return JSON.stringify(sortDeep(value));
}

function operationContract(operation) {
  return {
    deprecated: operation.deprecated ?? false,
    parameters: operation.parameters ?? [],
    requestBody: operation.requestBody ?? null,
    responses: operation.responses ?? {},
  };
}

function compareNamedEntries(beforeEntries = {}, afterEntries = {}) {
  const beforeNames = new Set(Object.keys(beforeEntries));
  const afterNames = new Set(Object.keys(afterEntries));

  return {
    added: [...afterNames].filter((name) => !beforeNames.has(name)).sort(),
    removed: [...beforeNames].filter((name) => !afterNames.has(name)).sort(),
    changed: [...beforeNames]
      .filter(
        (name) =>
          afterNames.has(name) &&
          fingerprint(beforeEntries[name]) !== fingerprint(afterEntries[name]),
      )
      .sort(),
  };
}

const beforeOperations = collectOperations(before);
const afterOperations = collectOperations(after);
const addedOperations = [...afterOperations.keys()]
  .filter((operation) => !beforeOperations.has(operation))
  .sort();
const removedOperations = [...beforeOperations.keys()]
  .filter((operation) => !afterOperations.has(operation))
  .sort();
const changedOperations = [...beforeOperations.keys()]
  .filter(
    (operation) =>
      afterOperations.has(operation) &&
      fingerprint(operationContract(beforeOperations.get(operation))) !==
        fingerprint(operationContract(afterOperations.get(operation))),
  )
  .sort();
const schemas = compareNamedEntries(before.components?.schemas, after.components?.schemas);

console.log(
  JSON.stringify(
    {
      before: {
        operations: beforeOperations.size,
        paths: Object.keys(before.paths ?? {}).length,
        schemas: Object.keys(before.components?.schemas ?? {}).length,
      },
      after: {
        operations: afterOperations.size,
        paths: Object.keys(after.paths ?? {}).length,
        schemas: Object.keys(after.components?.schemas ?? {}).length,
      },
      operations: {
        added: addedOperations,
        removed: removedOperations,
        changed: changedOperations,
      },
      schemas,
    },
    null,
    2,
  ),
);
