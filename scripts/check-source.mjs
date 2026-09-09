import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { endpoints } from "./api-catalog.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(
  readFileSync(resolve(root, "sources.lock.json"), "utf8"),
);
const [api, sdk] = process.argv.slice(2);
if (!api || !sdk)
  throw new Error(
    "Usage: node scripts/check-source.mjs /path/to/Bonyan-API /path/to/bonyan-sdk-js",
  );
for (const [key, path] of [
  ["api", api],
  ["sdk", sdk],
])
  assert.equal(
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: path,
      encoding: "utf8",
    }).trim(),
    lock[key].commit,
    `${key}: unexpected source revision`,
  );
const normalize = (p) => p.replace(/:[^/]+/g, "{}").replace(/\{[^}]+\}/g, "{}");
const routes = [];
const files = [
  resolve(api, "src/server.ts"),
  ...readdirSync(resolve(api, "src/modules")).map((group) =>
    resolve(api, `src/modules/${group}/${group}.route.ts`),
  ),
];
for (const file of files)
  for (const match of readFileSync(file, "utf8").matchAll(
    /(?:app|fastify)\.get\('([^']+)'/g,
  ))
    routes.push(normalize(match[1]));
assert.deepEqual(
  [...new Set(routes)].sort(),
  endpoints.map((e) => normalize(e.path)).sort(),
  "Documented routes differ from registered GET routes",
);
assert.equal(
  JSON.parse(readFileSync(resolve(sdk, "package.json"), "utf8")).version,
  lock.sdk.version,
);
assert.equal(
  JSON.parse(readFileSync(resolve(api, "package.json"), "utf8")).version,
  lock.api.version,
);
console.log(`Source revisions and all ${routes.length} GET routes match.`);
