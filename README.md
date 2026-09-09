# Bonyan documentation

English and Arabic documentation for Bonyan API and its JavaScript/TypeScript SDK. The Mintlify site contains 31 HTTP operations per language.

## Run locally

Use Node.js 22 or later and the pnpm version declared in package.json.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by the CLI. English starts at `/locales/en/introduction`; Arabic at `/locales/ar/introduction`.

The local search dialog requires an authenticated Mintlify session (`pnpm exec mintlify login`). Page rendering, navigation and the API playground work without that session. Check hosted search after deploying through the connected Mintlify project.

## Structure

```text
locales/
  en/                       English documentation
  api-reference/            API index and endpoint pages by module (generated)
  concepts/                 Architecture, responses, search, caching, fallback, limits
  guides/                   Integration, hosting, operations, maintenance
  sdk/                      SDK guides and generated method table
  openapi.yaml              English OpenAPI (generated)
  ar/                       Identical structure, translated into Arabic
assets/                     Supplied brand asset
examples/search.mjs         Tested search compatibility helper
patches/                    Pinned Mintlify Windows path correction
scripts/
  api-catalog.mjs            Endpoint metadata in both languages
  api-schemas.mjs            Response contracts and field descriptions
  generate-api.mjs           OpenAPI and endpoint generation
  generate-index.mjs         API indexes and SDK method tables
  check-docs.mjs             MDX, links, languages, schemas, SDK examples
  check-source.mjs           Source revisions and GET route parity
  search.test.mjs            Compatibility and error-path tests
.github/workflows/docs.yml   CI validation
docs.json                   Theme, language navigation, legacy redirects
sources.lock.json           Reviewed source commits and package versions
styles.css                  Arabic text direction, code isolation and diagram overflow
```

Published pages belong in a language directory. Every page must appear once in navigation and have a matching translation. Do not keep duplicate root-level guides.

## Edit and verify

Edit ordinary MDX guides in both languages. For endpoint changes, edit `scripts/api-catalog.mjs` and `scripts/api-schemas.mjs`, then regenerate:

```bash
pnpm generate
pnpm check
pnpm build
pnpm broken-links
```

`pnpm check` verifies generated-file drift, OpenAPI 3.1, MDX compilation, internal links, redirects, language parity, TypeScript SDK examples and the search helper. `pnpm build` is Mintlify build validation, not standalone HTML export. Preview layout changes in both languages.

`patches/` fixes a Windows path-separator mismatch in `@mintlify/link-rot` 3.0.1334 that otherwise marks valid nested links as broken. Keep the patch and lockfile together; remove the patch only after a newer CLI passes `pnpm broken-links` on Windows. React and React DOM are pinned to the same version to satisfy the CLI's rendering peers. The remaining deprecated packages are transitive CLI dependencies.

For documentation-only installs, `pnpm install --frozen-lockfile --ignore-scripts --no-optional` skips optional native tools that these checks and the preview do not need.

```bash
node scripts/check-source.mjs /path/to/Bonyan-API /path/to/bonyan-sdk-js
```

This command expects the revisions in `sources.lock.json`. Review changed controllers, services and types before updating the lock. Do not claim a hosted deployment uses an exact commit unless the deployment exposes it.

## Platform decision

Reviewed 7 September 2026. **Keep Mintlify.** The project already uses it, and it supports Arabic language navigation, RTL and OpenAPI request builders. Replacing the platform would not fix inaccurate source contracts. [Mintlify internationalization](https://www.mintlify.com/docs/guides/internationalization), [OpenAPI setup](https://www.mintlify.com/docs/api-playground/openapi-setup).

| Option         | Project assessment                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mintlify       | Selected: existing hosting workflow, language navigation, RTL and OpenAPI rendering. Translations live in this repository.                                                                                                            |
| Docusaurus     | Suitable if independently hosted static documentation becomes a requirement. It supports i18n and RTL. Migration adds theme, search, hosting and API-reference integration work.                                                      |
| nodejs/doc-kit | Uses API-shaped Markdown and a generator pipeline. The reviewed docs demonstrate multiple outputs. I did not establish an equivalent ready-to-use Arabic/RTL plus OpenAPI request-builder workflow, so it is not the selected target. |

Sources: [Docusaurus i18n](https://docusaurus.io/docs/i18n/introduction), [doc-kit](https://doc-kit.nodejs.org/). Migration-effort estimates are project-specific judgments, not claims that alternatives cannot support these features.

## Known source differences

The public API uses `https://api.bonyanoss.org`, without the old `/bonyan-api/v1` prefix. SDK 1.0.2 has a search-envelope mismatch; `examples/search.mjs` avoids it. Public tafsir IDs differ from upstream IDs. See [source status](locales/en/guides/source-status.mdx) and [Arabic source status](locales/ar/guides/source-status.mdx).

The conduct policy has no configured private reporting contact. A maintainer needs to provide one; no address is invented here.

## Publish

Review and merge through the existing documentation repository workflow. Keep the current Mintlify project connected to this repository. The rework does not publish a deployment or change DNS. Legacy page URLs redirect through `docs.json`.

## العربية

المحتوى العربي في `locales/ar/` وله بنية `locales/en/` نفسها. عدّل الأدلة باللغتين، أو عدّل بيانات API المشتركة ثم شغّل `pnpm generate`. افحص باستخدام `pnpm check` و`pnpm build` و`pnpm broken-links`. راجع [دليل الصيانة](locales/ar/guides/maintenance.mdx) لمعرفة مصدر كل ملف وخطوات تحديث الترجمة.
