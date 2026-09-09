import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "@mdx-js/mdx";
import ts from "typescript";
import { endpoints } from "./api-catalog.mjs";
import { locales, localeDirectory, localeFromFile } from "./locales.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const walk = (p) =>
  readdirSync(resolve(root, p), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${p}/${e.name}`) : [`${p}/${e.name}`],
  );
const docs = JSON.parse(read("docs.json"));
const pages = (lang) =>
  walk(localeDirectory(lang))
    .filter((p) => p.endsWith(".mdx"))
    .sort();
assert.deepEqual(
  pages("en").map((p) => p.slice(localeDirectory("en").length)),
  pages("ar").map((p) => p.slice(localeDirectory("ar").length)),
  "Language page parity",
);
const allPages = [...pages("en"), ...pages("ar")];
const navigated = [];
function visit(x) {
  if (Array.isArray(x)) {
    x.forEach(visit);
    return;
  }
  if (x && typeof x === "object") {
    for (const [key, value] of Object.entries(x)) {
      if (key === "pages")
        for (const item of value) {
          if (typeof item === "string") navigated.push(item + ".mdx");
          else visit(item);
        }
      else visit(value);
    }
  }
}
visit(docs.navigation);
assert.equal(
  new Set(navigated).size,
  navigated.length,
  "Duplicate navigation page",
);
assert.deepEqual(
  [...navigated].sort(),
  allPages.sort(),
  "Missing or orphaned navigation pages",
);
function checkLink(link, origin) {
  if (!link.startsWith("/") || link.startsWith("//")) return;
  const path = decodeURIComponent(link.split(/[?#]/)[0]).slice(1);
  if (!path || /[:*]/.test(path)) return;
  assert(
    existsSync(resolve(root, path)) || existsSync(resolve(root, path + ".mdx")),
    `${origin}: broken link ${link}`,
  );
}
for (const r of docs.redirects ?? []) checkLink(r.destination, "redirect");
const redirectSources = new Set((docs.redirects ?? []).map((r) => r.source));
assert.equal(
  redirectSources.size,
  (docs.redirects ?? []).length,
  "Duplicate redirects",
);
for (const r of docs.redirects ?? [])
  assert(!redirectSources.has(r.destination), `Redirect chain: ${r.source}`);
for (const lang of locales) {
  assert(
    (docs.redirects ?? []).some(
      (r) =>
        r.source === `/${lang}` &&
        r.destination === `/${localeDirectory(lang)}/introduction`,
    ),
    `Missing legacy ${lang} root redirect`,
  );
  assert(
    (docs.redirects ?? []).some(
      (r) =>
        r.source === `/${lang}/:slug*` &&
        r.destination === `/${localeDirectory(lang)}/:slug*`,
    ),
    `Missing legacy ${lang} wildcard redirect`,
  );
}
const specs = {};
for (const lang of locales) {
  const spec = parse(read(`${localeDirectory(lang)}/openapi.yaml`));
  await SwaggerParser.validate(structuredClone(spec));
  specs[lang] = spec;
  assert.equal(
    Object.keys(spec.paths).length,
    endpoints.length,
    "Endpoint coverage",
  );
  for (const e of endpoints) {
    const operation = spec.paths[e.path]?.get;
    assert(operation, e.path);
    assert.equal(operation.operationId, e.id);
    assert(operation.responses["200"].content, "Missing response schema");
  }
}
// Localization may change descriptions, but never the wire contract.
const withoutText = (v) =>
  Array.isArray(v)
    ? v.map(withoutText)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["description", "summary"].includes(k))
            .map(([k, x]) => [k, withoutText(x)]),
        )
      : v;
assert.deepEqual(
  withoutText(specs.en),
  withoutText(specs.ar),
  "Translated OpenAPI changed the wire contract",
);
const virtual = new Map();
let snippets = 0;
for (const file of allPages) {
  const raw = read(file);
  assert(!raw.includes("\uFFFD"), `${file}: invalid text encoding`);
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert(match, `${file}: missing frontmatter`);
  const meta = parse(match[1]);
  assert(meta.title && meta.description, `${file}: title/description required`);
  const body = raw.slice(match[0].length);
  if (file.endsWith("/sdk/search.mdx"))
    assert.equal(
      body.match(/```js\r?\n([\s\S]*?)\r?\n```/)?.[1].trim(),
      read("examples/search.mjs").trim(),
      `${file}: search example differs from the tested helper`,
    );
  await compile(body, { development: false });
  for (const match of body.matchAll(/(?:\]\(|href=["'])(\/[^\s"')]+)/g))
    checkLink(match[1], file);
  const lang = localeFromFile(file);
  assert(lang, `${file}: unknown locale path`);
  if (lang === "ar") {
    assert(
      /[\u0600-\u06ff]/u.test(meta.title),
      `${file}: Arabic title missing`,
    );
    for (const m of body.matchAll(/(?:\]\(|href=["'])(\/locales\/en\/[^\s"')]+)/g))
      assert.fail(`${file}: cross-language link ${m[1]}`);
  }
  if (meta.openapi) {
    const match = meta.openapi.match(/^(\S+) GET (\S+)$/);
    assert(match, `${file}: invalid openapi binding`);
    assert.equal(match[1], `${localeDirectory(lang)}/openapi.yaml`);
    assert(
      specs[lang].paths[match[2]],
      `${file}: unknown operation`,
    );
  }
  if (lang === "en")
    for (const m of body.matchAll(/```ts[^\n]*\n([\s\S]*?)\n```/g)) {
      const filename = resolve(root, `__docs_example_${snippets++}.ts`);
      virtual.set(filename, m[1] + "\nexport {};\n");
    }
}
const options = {
  strict: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  skipLibCheck: true,
  types: [],
};
const host = ts.createCompilerHost(options),
  originalRead = host.readFile.bind(host),
  originalExists = host.fileExists.bind(host),
  originalSource = host.getSourceFile.bind(host);
host.readFile = (p) => virtual.get(resolve(p)) ?? originalRead(p);
host.fileExists = (p) => virtual.has(resolve(p)) || originalExists(p);
host.getSourceFile = (p, ...args) =>
  virtual.has(resolve(p))
    ? ts.createSourceFile(p, virtual.get(resolve(p)), args[0], true)
    : originalSource(p, ...args);
const program = ts.createProgram([...virtual.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => root,
    getCanonicalFileName: (p) => p,
    getNewLine: () => "\n",
  }),
);
console.log(
  `Validated ${allPages.length} MDX pages, navigation, redirects, language parity, ${endpoints.length} operations per language and ${snippets} TypeScript examples.`,
);
