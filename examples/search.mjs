import { BonyanApiError, BonyanRequestError } from "@bonyanoss/bonyan-api";

// Compatibility helper for the flat search envelope returned by API 2.0.0.
export async function searchContent(
  resource,
  text,
  {
    limit = 10,
    baseUrl = "https://api.bonyanoss.org",
    fetch: fetchFn = globalThis.fetch,
    signal = AbortSignal.timeout(45000),
  } = {},
) {
  if (!["ayat", "azkar"].includes(resource))
    throw new TypeError("resource must be ayat or azkar");
  const maximum = resource === "ayat" ? 500 : 200;
  if (!Number.isInteger(limit) || limit < 1 || limit > maximum)
    throw new RangeError("Invalid limit");
  if (typeof text !== "string" || !/[\u0621-\u064A]/u.test(text))
    throw new TypeError("Use an Arabic query");
  const url = new URL(baseUrl.replace(/\/+$/, "") + "/" + resource + "/search");
  url.searchParams.set("text", text);
  url.searchParams.set("limit", String(limit));
  let response;
  try {
    response = await fetchFn(url, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw BonyanRequestError.from(error);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw BonyanApiError.fromResponse(
      response.status,
      body,
      response.statusText,
    );
  if (
    body?.success !== true ||
    !Array.isArray(body.data) ||
    !Number.isInteger(body.total)
  ) {
    throw new BonyanRequestError("Unexpected search response", body);
  }
  return { total: body.total, results: body.data };
}
