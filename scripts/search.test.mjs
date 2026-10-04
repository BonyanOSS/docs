import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BonyanClient,
  BonyanApiError,
  BonyanRequestError,
  ValidationError,
} from "@bonyanoss/bonyan-api";
import { searchContent } from "../examples/search.mjs";
const json = (body, status = 200) => Response.json(body, { status });

for (const resource of ["ayat", "azkar"]) {
  test(`${resource}: published SDK artifact decodes the flat API envelope`, async () => {
    const hits = [{ apiName: "synthetic-test-source" }];
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
    const client = new BonyanClient({
      retry: 0,
      fetch: async () => json({ success: true, total: 1, data: hits }),
    });
    assert.deepEqual(await client[resource].search("الله"), result);
  });
}
test("HTTP errors preserve status and request ID", async () => {
  await assert.rejects(
    searchContent("ayat", "الله", {
      fetch: async () =>
        json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "No match", requestId: "test-request" },
          },
          404,
        ),
    }),
    (e) => e instanceof BonyanApiError && e.status === 404 && e.requestId === "test-request",
  );
});
test("malformed successful search envelopes reject", async () => {
  await assert.rejects(
    searchContent("ayat", "الله", { fetch: async () => json({ success: true, data: {} }) }),
    BonyanRequestError,
  );
});
test("invalid limits and blank queries reject before transport", async () => {
  const fetch = () => {
    throw new Error("Transport must not run");
  };
  await assert.rejects(searchContent("ayat", " ", { fetch }), ValidationError);
  await assert.rejects(searchContent("azkar", "الله", { limit: 201, fetch }), ValidationError);
});
test("already cancelled requests never reach fetch", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    searchContent("ayat", "الله", {
      signal: controller.signal,
      fetch: () => {
        throw new Error("Transport must not run");
      },
    }),
    BonyanRequestError,
  );
});
