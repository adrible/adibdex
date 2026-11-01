# Dependency security maintenance

Reviewed on 2026-11-01, keeping the application at version 0.9.4.

The existing lockfile reported 22 npm audit findings (16 moderate, 6 high). The updated
lockfile reports zero findings across production and development dependencies.

## Compatibility changes

- Zod moves from 3.25.76 to 4.6.7. The JSON client uses the Zod 4 output/input generic
  parameters, and legacy catalog state explicitly declares string keys with
  `z.record(z.string(), z.unknown())`. Validation and persisted state behavior remain
  covered by the existing client, catalog and session tests.
- Vitest and its coverage provider move together to 5.0.5.
- Compatible lockfile updates include Vite 8.3.5, Sharp 0.35.5,
  postcss-selector-parser 6.1.5 and source-map-js 1.2.2.

## Minimatch override

`package.json` overrides Minimatch to `^11.0.1` (resolved to 11.0.3). The current ESLint
and typescript-eslint releases request the affected 10.x line. Minimatch 11 replaces
its glob matching implementation; this is a deliberate major override rather than
an audit suppression. The project uses it through development tooling, not in the
published client application.

Revisit the override when ESLint and typescript-eslint accept a patched major
version directly. Validate lint file discovery, type checking, coverage, build and
browser tests whenever changing it.

## Verification

Use the committed lockfile with `npm ci`, then run:

```sh
npm audit --audit-level=moderate
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

A clean audit describes the advisory database at the time of the check. The existing
weekly dependency audit remains enabled to detect later advisories.
