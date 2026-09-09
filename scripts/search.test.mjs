import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BonyanClient,
  BonyanApiError,
  BonyanRequestError,
} from "@bonyanoss/bonyan-api";
import { searchContent } from "../examples/search.mjs";
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
for (const resource of ["ayat", "azkar"]) {
  test(`${resource}: flat API search envelope survives the adapter`, async () => {
    const hits =
      resource === "ayat"
        ? [
            {
              surahNumber: 1,
              surahName: "الفاتحة",
              aya: { number: 1, numberInSurah: 1, text: "نص للاختبار" },
            },
          ]
        : [
            {
              category: "تصنيف للاختبار",
              item: { id: 1, text: "نص للاختبار" },
            },
          ];
    const result = await searchContent(resource, "الله", {
      baseUrl: "https://example.test/prefix/",
      limit: 1,
      fetch: async (url) => {
        const actual = new URL(url);
        assert.equal(actual.pathname, `/prefix/${resource}/search`);
        assert.equal(actual.searchParams.get("text"), "الله");
        assert.equal(actual.searchParams.get("limit"), "1");
        return json({ success: true, total: 1, data: hits });
      },
    });
    assert.deepEqual(result, { total: 1, results: hits });
  });
  test(`${resource}: verify documented SDK 1.0.2 mismatch against the real flat body`, async () => {
    const client = new BonyanClient({
      retry: 0,
      fetch: async () => json({ success: true, total: 1, data: [{}] }),
    });
    assert.deepEqual(await client[resource].search("الله"), {
      total: undefined,
      results: undefined,
    });
  });
}
test("HTTP failures preserve status and request ID", async () => {
  await assert.rejects(
    searchContent("ayat", "الله", {
      fetch: async () =>
        json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "No match",
              requestId: "test-request",
            },
          },
          404,
        ),
    }),
    (e) =>
      e instanceof BonyanApiError &&
      e.status === 404 &&
      e.requestId === "test-request",
  );
});
test("malformed successful envelopes are rejected", async () => {
  await assert.rejects(
    searchContent("ayat", "الله", {
      fetch: async () => json({ success: true, data: {} }),
    }),
    BonyanRequestError,
  );
});
test("invalid Arabic input and limits are rejected before transport", async () => {
  const fetch = () => {
    throw new Error("Transport must not run");
  };
  await assert.rejects(searchContent("ayat", "latin", { fetch }), TypeError);
  await assert.rejects(
    searchContent("azkar", "الله", { limit: 201, fetch }),
    RangeError,
  );
});
test("caller cancellation signal is forwarded", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    searchContent("ayat", "الله", {
      signal: controller.signal,
      fetch: async (_url, options) => {
        assert.equal(options.signal, controller.signal);
        options.signal.throwIfAborted();
      },
    }),
    BonyanRequestError,
  );
});
