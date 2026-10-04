# Bonyan documentation

English and Arabic Mintlify documentation for Bonyan API and its JavaScript/TypeScript SDK. Docs 1.1.0 covers all 31 HTTP operations per language.

Reviewed API: `c851b1a610c5169d3bffd822ed68886338ea3067`. The API package is 2.1.0 while its OpenAPI and changelog label the normalized contract 3.0.0. Both labels are preserved in `sources.lock.json`; the generated reference describes the actual controllers.

Docs install the published SDK 2.0.0 from npm. The source revision and SHA-256, registry tarball URL and integrity are recorded in sources.lock.json; pnpm-lock.yaml pins the installed distribution.

## Run

Use Node.js 22.12 or later and pnpm 11.22.0, as declared in package.json.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the CLI's preview URL. English starts at `/locales/en/introduction` and Arabic at `/locales/ar/introduction`. Local search requires `pnpm exec mintlify login`; page rendering, navigation and the playground do not require that session. Verify hosted search after publication.

## Edit and check

Edit ordinary MDX guides in both languages. Update `scripts/api-catalog.mjs` for endpoint parameters and bilingual descriptions, and `scripts/api-schemas.mjs` for response contracts. Then run:

```bash
pnpm generate
pnpm check
pnpm build
pnpm broken-links
```

`check` detects generated-file drift, validates both OpenAPI documents, compiles MDX, checks navigation/links/redirects and language parity, type-checks SDK examples, and tests the search example against the published SDK. `build` runs Mintlify validation, without exporting standalone HTML.

Build the reviewed API checkout, then verify real API controllers against the published SDK and both translated schemas:

```bash
pnpm --dir /path/to/Bonyan-API build
pnpm check:api /path/to/Bonyan-API
node scripts/check-source.mjs /path/to/Bonyan-API /path/to/bonyan-sdk-js
```

`check:api` exercises every SDK operation against Fastify and the Worker entrypoint with synthetic upstream fixtures. It also checks local fallbacks, sparse hadith numbering and error propagation. It performs no live provider requests. CI builds the pinned API revision on Linux and Windows before running this check.

The source check verifies the API revision and package version, SDK revision, source digest/version and installed package integrity and GET route parity. It detects unreviewed source changes; update the lock only after reviewing and testing them.

## Structure

| Path | Purpose |
| --- | --- |
| `locales/en`, `locales/ar` | Translated guides, SDK reference and generated API pages/specifications. |
| `scripts/api-catalog.mjs`, `scripts/api-schemas.mjs` | Source metadata for generated contracts. |
| `scripts/generate-*.mjs` | API pages, OpenAPI and method tables. |
| `scripts/check-*.mjs` | Documentation, source and API integration checks. |
| `scripts/source-digest.mjs` | Portable source/archive fingerprinting. |
| `examples/search.mjs` | Tested application helper using SDK search directly. |
| `sources.lock.json` | Reviewed revisions, versions and hashes. |
| `docs.json`, `styles.css` | Existing theme, bilingual navigation, redirects and RTL styling. |

Published pages need a translation and exactly one navigation entry. Preview layout changes in both languages. Keep API JSON keys and SDK names unchanged in translations.

## Tool compatibility

Mintlify is updated to 4.2.981. React and React DOM remain 19.2.3 to match its CLI renderer; 19.3.0 caused an invalid-hook error. pnpm remains on the updated 11.22.0 line because Mintlify rejects pnpm 12's multi-document lockfile. TypeScript remains 6.0.3 because checks use its JavaScript compiler API, which the current TypeScript 7 package does not expose. The remaining deprecated packages belong to the CLI's transitive dependencies.

The Windows path correction now targets `@mintlify/link-rot` 3.0.1414. Without it, the updated checker incorrectly reports valid nested links as broken. Keep the patch and lockfile together; remove it only when a newer checker passes on Windows.

See [English source status](locales/en/guides/source-status.mdx) and [Arabic source status](locales/ar/guides/source-status.mdx).
