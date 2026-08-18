import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const importedPackage = await import(packageJson.name);
const requiredPackage = createRequire(import.meta.url)(packageJson.name);

assert.equal(typeof importedPackage.BitbucketClient, 'function');
assert.equal(typeof requiredPackage.BitbucketClient, 'function');

console.log('Package entry points load successfully through ESM and CommonJS.');
