import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { endpoints, baseUrl } from "./api-catalog.mjs";
import { schemas, localize } from "./api-schemas.mjs";
import { locales, localeDirectory, localeRoute } from "./locales.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(
  readFileSync(resolve(root, "sources.lock.json"), "utf8"),
);
const check = process.argv.includes("--check");
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const statuses = {
  400: ["Invalid or missing input.", "إدخال مفقود أو غير صالح."],
  404: [
    "Requested item or matching result was not found.",
    "لم يوجد العنصر أو التطابق المطلوب.",
  ],
  429: [
    "Request rate exceeded. Respect Retry-After when present.",
    "تجاوز حد الطلبات. التزم بترويسة Retry-After عند وجودها.",
  ],
  503: [
    "No result could be obtained from configured sources.",
    "تعذر الحصول على نتيجة من المصادر المضبوطة.",
  ],
  500: ["Unexpected server error.", "خطأ غير متوقع في الخادم."],
};
function write(path, content) {
  const target = resolve(root, path);
  if (check) {
    if (readFileSync(target, "utf8") !== content)
      throw new Error(`Generated file is stale: ${path}`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
for (const lang of locales) {
  const ar = lang === "ar",
    prefix = `${localeDirectory(lang)}/`,
    specFile = `${prefix}openapi.yaml`;
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Bonyan API",
      version: lock.api.version,
      description: ar
        ? "واجهة HTTP للقرآن والتفسير والقراء والأذكار والحديث ومواقيت الصلاة والتقويم والقبلة. لغة التوثيق لا تغيّر لغة المحتوى."
        : "HTTP API for Quran, tafsir, reciters, azkar, hadith, prayer times, calendars and Qibla. Documentation language does not change content language.",
      license: { name: "MIT", identifier: "MIT" },
      "x-source-revision": lock.api.commit,
    },
    servers: [
      { url: baseUrl, description: ar ? "الخدمة العامة" : "Hosted API" },
      {
        url: "http://localhost:3000",
        description: ar ? "التشغيل المحلي" : "Local development",
      },
    ],
    security: [],
    paths: {},
    components: { schemas: localize(schemas, lang) },
  };
  for (const e of endpoints) {
    const description =
      e.description[lang] + (e.notes ? "\n\n" + e.notes[lang] : "");
    const responses = {
      200: {
        description: ar ? "نجاح" : "Success",
        content: {
          [e.schema === "Metrics" ? "text/plain" : "application/json"]: {
            schema: ref(e.schema),
          },
        },
      },
    };
    for (const code of [...new Set([...e.errors, 429, 500])])
      responses[code] = {
        description: statuses[code][ar ? 1 : 0],
        ...(code === 429
          ? {
              headers: {
                "Retry-After": {
                  description: ar
                    ? "مدة الانتظار بالثواني إذا أرسلها الخادم."
                    : "Wait duration in seconds, when supplied.",
                  schema: { type: "string" },
                },
              },
            }
          : {}),
        content: { "application/json": { schema: ref("Error") } },
      };
    spec.paths[e.path] = {
      get: {
        operationId: e.id,
        tags: [e.slug.split("/")[0]],
        summary: e.title[lang],
        description,
        parameters: localize(e.params, lang),
        responses,
      },
    };
    let examplePath = e.path;
    for (const p of e.params.filter((p) => p.in === "path"))
      examplePath = examplePath.replace(
        `{${p.name}}`,
        encodeURIComponent(p.example),
      );
    const query = e.params.filter((p) => p.in === "query");
    // A prayer request uses coordinates only; city/country are documented as an alternative.
    const exampleQuery = query.filter(
      (p) =>
        e.path !== "/prayer/times" || !["city", "country"].includes(p.name),
    );
    const url = baseUrl + examplePath;
    const curl =
      `curl --fail-with-body${exampleQuery.length ? " --get" : ""} '${url}'` +
      exampleQuery
        .map((p) => ` \\\n  --data-urlencode '${p.name}=${p.example}'`)
        .join("");
    const fetchCode =
      `const url = new URL(${JSON.stringify(url)});\n` +
      exampleQuery
        .map(
          (p) =>
            `url.searchParams.set(${JSON.stringify(p.name)}, ${JSON.stringify(String(p.example))});\n`,
        )
        .join("") +
      `const response = await fetch(url, { signal: AbortSignal.timeout(45000) });\nif (!response.ok) throw new Error(\`HTTP \${response.status}: \${await response.text()}\`);\nconst body = await response.${e.schema === "Metrics" ? "text" : "json"}();\nconsole.log(body);`;
    const sourcePath = e.slug.startsWith("meta/")
      ? "src/server.ts"
      : `src/modules/${e.slug.split("/")[0]}/${e.slug.split("/")[0]}.controller.ts`;
    let body = `---\ntitle: ${JSON.stringify(e.title[lang])}\ndescription: ${JSON.stringify(e.description[lang])}\nopenapi: ${JSON.stringify(`${specFile} GET ${e.path}`)}\n---\n`;
    if (e.notes) body += `\n<Warning>\n${e.notes[lang]}\n</Warning>\n`;
    body += `\n## ${ar ? "مثال الطلب" : "Request example"}\n\n<CodeGroup>\n\n\`\`\`bash cURL\n${curl}\n\`\`\`\n\n\`\`\`js JavaScript\n${fetchCode}\n\`\`\`\n`;
    if (e.sdk)
      body += `\n\`\`\`ts SDK\nimport { BonyanClient } from '@bonyanoss/bonyan-api';\n\nconst client = new BonyanClient({ timeoutMs: 45000, retry: 1 });\nconst result = await ${e.sdk};\nconsole.log(result);\n\`\`\`\n`;
    body += `\n</CodeGroup>\n\n[${ar ? "الاستجابات والأخطاء" : "Responses and errors"}](${localeRoute(lang, "/concepts/errors")}) · [${ar ? "دليل SDK" : "SDK guide"}](${localeRoute(lang, "/sdk/overview")}) · [${ar ? "كود المسار" : "Route implementation"}](${lock.api.repository}/blob/${lock.api.commit}/${sourcePath})\n`;
    write(`${prefix}api-reference/${e.slug}.mdx`, body);
  }
  write(
    specFile,
    "# Generated by pnpm generate. Edit scripts/api-catalog.mjs and scripts/api-schemas.mjs.\n" +
      stringify(spec, { lineWidth: 0 }),
  );
}
console.log(
  `${check ? "Checked" : "Generated"} ${endpoints.length} operations in English and Arabic.`,
);
