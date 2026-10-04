import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";
import { BonyanClient, BonyanApiError } from "@bonyanoss/bonyan-api";
import { endpoints } from "./api-catalog.mjs";

const api = process.argv[2];
if (!api) throw new Error("Usage: node scripts/check-api.mjs /path/to/built/Bonyan-API");
const load = (path) => import(pathToFileURL(resolve(api, "dist", path)).href);
const { buildApp } = await load("app.js");
const { default: worker } = await load("worker.js");
const { clearCache } = await load("utils/cache.js");
const { SURAH_METADATA } = await load("modules/surah/surah.metadata.js");
const { AZKAR_CATEGORIES } = await load("modules/azkar/azkar.metadata.js");
const { HADITH_BOOKS } = await load("modules/hadith/hadith.metadata.js");
const snapshot = JSON.parse(
  readFileSync(resolve(api, "src/modules/reciters/reciters.snapshot.json"), "utf8"),
);
const specs = ["en", "ar"].map((lang) =>
  parse(readFileSync(new URL(`../locales/${lang}/openapi.yaml`, import.meta.url), "utf8")),
);
const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
const validators = specs.map(
  (spec) =>
    new Map(
      endpoints.map((e) => [
        e.id,
        ajv.compile({
          ...spec.paths[e.path].get.responses[200].content[
            e.schema === "Metrics" ? "text/plain" : "application/json"
          ].schema,
          components: spec.components,
        }),
      ]),
    ),
);
const errorValidators = specs.map((spec) =>
  ajv.compile({ $ref: "#/components/schemas/Error", components: spec.components }),
);
const normalize = (path) => path.replace(/:[^/]+/g, "{}").replace(/\{[^}]+\}/g, "{}");
const originalFetch = globalThis.fetch;
const json = (body) => Response.json(body);

// Synthetic fixtures exercise the real controllers and adapters without live provider calls.
const fixtureFetch = async (input, init) => {
  if (init?.method === "HEAD")
    return new Response(null, { headers: { "content-type": "audio/mpeg" } });
  const url = new URL(String(input));
  if (url.pathname.endsWith("/suwar"))
    return json({
      suwar: SURAH_METADATA.map((s) => ({ id: s.id, name: s.name, makkia: Number(s.makkia) })),
    });
  if (url.pathname.endsWith("/reciters")) return json(snapshot);
  if (url.pathname.endsWith("/quran/quran-uthmani"))
    return json({
      data: {
        edition: { identifier: "quran-uthmani", type: "quran" },
        surahs: SURAH_METADATA.map((s) => ({
          number: s.id,
          name: s.name,
          ayahs: Array.from({ length: s.ayahCount }, (_, i) => ({
            numberInSurah: i + 1,
            text: "الله نص اختبار",
          })),
        })),
      },
    });
  if (url.pathname.endsWith("/hisn_almuslim.json"))
    return json(
      Object.fromEntries(
        AZKAR_CATEGORIES.map((c) => [c.mirrorName, { text: ["ذكر الله اختبار"] }]),
      ),
    );
  if (url.pathname.endsWith("/ar.muyassar"))
    return json({
      data: {
        number: 1,
        edition: { identifier: "ar.muyassar", type: "tafsir" },
        ayahs: Array.from({ length: 7 }, (_, i) => ({
          numberInSurah: i + 1,
          text: "تفسير اختبار",
        })),
      },
    });
  if (url.pathname.includes("/tafsirs/91/"))
    return json({
      tafsirs: Array.from({ length: 7 }, (_, i) => ({
        resource_id: 91,
        verse_key: `1:${i + 1}`,
        text: "تفسير اختبار",
      })),
      pagination: { next_page: null },
    });
  if (url.pathname.endsWith("/books/bukhari.json"))
    return json(
      Array.from({ length: HADITH_BOOKS.find((b) => b.id === "bukhari").available }, (_, i) => ({
        number: (i + 1) * 2,
        arab: "حديث اختبار",
      })),
    );
  if (/\/timings(?:ByCity)?\//.test(url.pathname))
    return json({
      data: {
        timings: Object.fromEntries(
          ["Fajr", "Sunrise", "Dhuhr", "Asr", "Sunset", "Maghrib", "Isha"].map((k) => [k, "12:00"]),
        ),
        date: {
          gregorian: { date: url.pathname.split("/").at(-1) },
          hijri: { date: "23-04-1448" },
        },
        meta: {
          latitude: 21.4225,
          longitude: 39.8262,
          timezone: url.searchParams.get("timezonestring"),
          method: { id: Number(url.searchParams.get("method")) },
        },
      },
    });
  if (/\/(gToH|hToG)\//.test(url.pathname))
    throw new Error("Use the real local calendar fallback in this fixture");
  if (url.pathname.includes("/qibla/"))
    return json({ data: { latitude: 24.7136, longitude: 46.6753, direction: 243.8 } });
  throw new Error(`Unexpected provider fixture: ${url.hostname}${url.pathname}`);
};

try {
  for (const adapter of ["fastify", "worker"]) {
    clearCache();
    globalThis.fetch = fixtureFetch;
    const app = adapter === "fastify" ? await buildApp({ logger: false }) : worker;
    const visited = new Set();
    const transport = async (input, init) => {
      const url = new URL(String(input));
      let response;
      if (adapter === "fastify") {
        const result = await app.inject({
          method: "GET",
          url: url.pathname + url.search,
          headers: Object.fromEntries(new Headers(init?.headers)),
        });
        response = new Response(result.body, {
          status: result.statusCode,
          headers: result.headers,
        });
      } else
        response = await app.fetch(
          new Request(url, init),
          { RATE_LIMIT_MAX: "1000" },
          { waitUntil: () => {} },
        );
      const endpoint =
        endpoints.find((e) => e.path === url.pathname) ??
        endpoints.find(
          (e) =>
            e.path.split("/").length === url.pathname.split("/").length &&
            e.path
              .split("/")
              .every((part, i) => part.startsWith("{") || part === url.pathname.split("/")[i]),
        );
      assert(endpoint, `Undocumented route ${url.pathname}`);
      if (response.ok) {
        const body =
          endpoint.schema === "Metrics"
            ? await response.clone().text()
            : await response.clone().json();
        for (const byId of validators) {
          const validate = byId.get(endpoint.id);
          assert(validate(body), `${adapter} ${endpoint.path}: ${JSON.stringify(validate.errors)}`);
        }
        visited.add(endpoint.id);
      } else {
        const body = await response.clone().json();
        for (const [index, validate] of errorValidators.entries()) {
          assert(
            specs[index].paths[endpoint.path].get.responses[response.status],
            `${endpoint.path}: undocumented HTTP ${response.status}`,
          );
          assert(
            validate(body),
            `${adapter} ${endpoint.path} HTTP ${response.status}: ${JSON.stringify(validate.errors)}`,
          );
        }
      }
      return response;
    };
    const client = new BonyanClient({
      baseUrl: "https://example.test",
      fetch: transport,
      retry: 0,
    });
    try {
      const catalogue = await client.routes();
      assert.deepEqual(
        [
          ...new Set([
            ...catalogue.routes
              .filter((r) => [r.method].flat().includes("GET"))
              .map((r) => normalize(r.url)),
            "/",
            "/health",
            "/ready",
            "/metrics",
          ]),
        ].sort(),
        endpoints.map((e) => normalize(e.path)).sort(),
      );
      await client.health();
      await client.ready();
      assert.match(await client.metrics(), /bonyan_api_cache_entries/);
      assert.equal((await client.surah.list()).length, 114);
      assert.equal((await client.surah.getById(1)).makkia, true);
      await client.surah.search("الفاتحة");
      assert.equal((await client.ayat.list()).length, 114);
      assert.equal((await client.ayat.getById(1)).apiName, "alquran.cloud");
      await client.ayat.getBySurah(1, 1);
      const ayat = await client.ayat.search("الله", { limit: 2 });
      assert.equal(ayat.total, ayat.results.length);
      await client.reciters.list();
      const reciter = await client.reciters.getById(123);
      await client.reciters.search("مشاري");
      const recording = reciter.moshaf.find((m) => m.surahList.includes(1));
      const audio = await client.reciters.getSurah(123, 1, { moshaf: recording.id });
      assert.equal(audio.moshafId, recording.id);
      assert.deepEqual(
        (await client.tafsir.listEditions()).map((e) => e.id),
        ["muyassar", "saadi"],
      );
      assert.equal((await client.tafsir.forSurah("muyassar", 1, { aya: 1 })).length, 1);
      assert.equal((await client.tafsir.forAya("saadi", 1, 2)).edition, "saadi");
      await client.azkar.listCategories();
      await client.azkar.getByCategory("أذكار الصباح");
      await client.azkar.random();
      const azkar = await client.azkar.search("الله", { limit: 2 });
      assert.equal(azkar.total, azkar.results.length);
      assert.equal((await client.hadith.listBooks()).length, 9);
      assert.equal((await client.hadith.getBook("bukhari", { from: 1, to: 10 })).hadiths.length, 5);
      assert.equal((await client.hadith.getByNumber("bukhari", 2)).number, 2);
      assert.equal((await client.hadith.random({ book: "bukhari" })).hadith.number % 2, 0);
      assert.equal(
        (
          await client.prayer.getTimes({
            date: "04-10-2026",
            latitude: 21.4225,
            longitude: 39.8262,
            timezone: "Asia/Riyadh",
          })
        ).timezone,
        "Asia/Riyadh",
      );
      await client.hijri.today();
      const hijri = await client.hijri.fromGregorian("04-10-2026");
      assert.equal(hijri.calendar, "islamic-umalqura");
      assert.equal((await client.hijri.toGregorian(hijri.hijri.date)).gregorian.date, "04-10-2026");
      await client.qibla.getDirection(24.7136, 46.6753);
      assert.equal(visited.size, endpoints.length, `${adapter}: missing SDK operations`);
      await assert.rejects(
        client.hadith.getByNumber("bukhari", 1),
        (e) => e instanceof BonyanApiError && e.status === 404 && e.code === "NOT_FOUND",
      );
      await assert.rejects(
        client.hadith.getBook("missing"),
        (e) => e instanceof BonyanApiError && e.status === 404,
      );
      clearCache();
      globalThis.fetch = async () => {
        throw new Error("Offline fixture");
      };
      assert.equal((await client.surah.getById(1)).apiName, "local");
      assert.equal((await client.reciters.getById(123)).apiName, "local");
      assert.equal(
        (
          await client.prayer.getTimes({
            date: "04-10-2026",
            latitude: 21.4225,
            longitude: 39.8262,
            timezone: "Asia/Riyadh",
          })
        ).apiName,
        "local",
      );
      assert.equal((await client.hijri.fromGregorian("04-10-2026")).apiName, "local");
      assert.equal((await client.qibla.getDirection(24.7136, 46.6753)).apiName, "local");
      await assert.rejects(
        client.ayat.list(),
        (e) => e instanceof BonyanApiError && e.status === 503 && e.code === "ALL_SOURCES_FAILED",
      );
      console.log(
        `${adapter}: ${visited.size} SDK operations match both OpenAPI locales; local fallback, sparse numbering and errors pass.`,
      );
    } finally {
      if (adapter === "fastify") await app.close();
      clearCache();
    }
  }
} finally {
  globalThis.fetch = originalFetch;
}
