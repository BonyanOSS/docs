import { BonyanClient, ValidationError } from "@bonyanoss/bonyan-api";

// Application helper using the supported SDK search methods.
export async function searchContent(
  resource,
  text,
  {
    limit = 10,
    baseUrl = "https://api.bonyanoss.org",
    fetch = globalThis.fetch,
    signal = AbortSignal.timeout(45000),
  } = {},
) {
  if (!["ayat", "azkar"].includes(resource)) {
    throw new ValidationError("resource must be ayat or azkar", "resource");
  }
  const client = new BonyanClient({ baseUrl, fetch, timeoutMs: 45000, retry: 0 });
  return client[resource].search(text, { limit }, { signal });
}
