# Changelog

## 1.1.0 - 2026-10-04

- Align English and Arabic endpoint descriptions, response schemas and examples with API commit c851b1a, package 2.1.0 and OpenAPI contract 3.0.0.
- Document SDK 2.0.0: fixed search decoding, moshaf selection, prayer timezone, normalized types, validation and per-request cancellation.
- Replace outdated provider, cache, audio, calendar, hadith-range and deployment guidance. Document native Cloudflare Workers and Node 24 API hosting.
- Add checks for all 31 SDK operations against both HTTP adapters and both OpenAPI locales, including local fallback and error behavior.
- Validate against published SDK 2.0.0, with its merged source revision and registry distribution integrity recorded.
- Update compatible Mintlify, parser and YAML dependencies, pnpm and CI actions. Retain React 19.2.3 and TypeScript 6.0.3 for CLI/compiler compatibility.
