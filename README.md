# BonyanOSS Docs

Documentation site for **BonyanOSS** and the **Etha3a API**.

Built with [Mintlify](https://mintlify.com). The docs are organized as a
developer platform: ecosystem overview, project model, domain map, contribution
guide, Etha3a API docs, engineering guides, and API reference.

## Run locally

```bash
pnpm install
pnpm dev
```

The site will be live at `http://localhost:3000`.

## Useful scripts

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Start the local dev server with hot reload.       |
| `pnpm build`         | Validate the documentation build.                 |
| `pnpm broken-links`  | Crawl pages and report dead internal links.       |
| `pnpm openapi:check` | Validate `openapi.yaml` against the OpenAPI spec. |

## Project layout

```text
bonyan-docs/
├── docs.json
├── openapi.yaml
├── logo/
├── introduction.mdx
├── ecosystem.mdx
├── projects.mdx
├── domains.mdx
├── code-of-conduct.mdx
├── etha3a.mdx
├── quickstart.mdx
├── concepts/
├── guides/
└── api-reference/
```

## Public URL plan

- Main site: `bonyanoss.org`
- Docs: `docs.bonyanoss.org`
- Status: `status.bonyanoss.org`
- Unified API: `api.bonyanoss.org`
- Etha3a API: `api.bonyanoss.org/etha3a/v1`
- Etha3a docs: `docs.bonyanoss.org/etha3a`

## License

MIT © BonyanOSS.
