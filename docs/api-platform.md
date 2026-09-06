# ToolNest API Platform — Architecture

A design for exposing a curated subset of ToolNest tools as a public,
key-authenticated HTTP API (`/api/v1/…`), reusing the exact same pure
functions that power the website's tool pages. Covers authentication,
rate limiting, usage metering, versioning, a consistent error contract,
input validation, and API documentation.

This document is a *design*, not an implementation. It names the files,
schema changes, and contracts each slice needs so the work can be
reviewed incrementally. It refines the API-access sketch in
`docs/monetization.md` §4.3 (same mechanics, operation-style paths
instead of `/api/v1/tools/{slug}`).

---

## 1. Principles (non-negotiable)

1. **One implementation, two surfaces.** An endpoint calls the *same*
   `lib/tools/*` function the website's client component calls. No
   forked "API version" of tool logic — if the web tool's behavior is
   right, the API's behavior is right by construction, and vice versa.
2. **Strict at the edge, lenient in the browser.** Browser tool code
   may clamp input silently; an API must never silently alter input.
   The edge validates with the tool's real limits and answers `422`
   instead of coercing.
3. **Consistency is structural, not stylistic.** Envelope, error codes,
   rate-limit headers, and request IDs are produced by one shared route
   factory. No per-endpoint handler decides its own error shape.
4. **Keys are server secrets.** Raw keys are shown once and stored only
   as a hash. They never appear in logs, usage rows, or responses.
5. **Versioned contracts.** `v1` is a pinned contract: additive,
   non-breaking growth only. Breaking changes require a new major
   version, never silent edits to the old one.
6. **Every call is metered, nothing sensitive is stored.** Usage logs
   carry key id, route, status, latency, request id — never request
   bodies, never raw keys, no PII beyond the owning account. This
   extends the privacy posture in `docs/analytics.md` to service
   telemetry.
7. **Module direction.** `lib/api/**` imports `lib/tools/**`. Tool
   modules stay pure and never import API concerns — the same rule as
   `docs/monetization.md` principle 5.

---

## 2. What today's code already gives us

| Concern | Current state |
| --- | --- |
| Tool logic | `lib/tools/*.ts` — **pure TypeScript, no DOM, no `window`**, used by client components directly. |
| The five example tools | All five exist and are server-safe (verified by inspection): `text-repeater.ts`, `extract-urls.ts`, `html-decoder.ts`, `sql-validator.ts`, `barcode-generator.ts`. |
| Website reuse path | `app/tools/<slug>/*Client.tsx` imports these modules. The API imports the same modules — identical results for identical input. |
| SQL validator | `validateSql` is *lexical analysis only* — it never connects to a database or executes SQL, so exposing it server-side is safe. |
| Barcode generator | `generateBarcode` returns an **SVG string** (plus `data`/`format`) — pure string building, no canvas. |
| Validation | Tools ship UI validators (`validateRepeatInput`, `validateBarcodeInput`, …) returning prose strings for the form, plus a few private `MAX_*` constants (`MAX_REPEAT = 10000`, `MAX_TEXT_LENGTH = 10000` are unexported in `text-repeater.ts`). |
| Zod | v4 is in use (`z.email()` in `/api/auth/register`), and v4 can emit JSON Schema from schemas (`z.toJSONSchema`) — usable for generated OpenAPI. |
| Error convention | Internal routes return `{ error: "…" }` with a bare status. Adequate for UI calls; too thin for a platform contract (no codes, no details, no request id). |
| Rate limiting | In-memory `Map` window limiter in `app/api/analytics/route.ts` and `app/api/auth/register/route.ts` — documented as single-instance guards. The pattern and its caveat are known. |
| Schema | Prisma has `User.plan` (from monetization R1) but **no** `ApiKey`/`ApiUsageLog` models yet (proposed but unshipped in monetization §4.3). |
| Auth | NextAuth v5 with real accounts (`/login`, bcrypt) exists. API keys are separate from web sessions and need no cookies — good for non-browser clients. |

**Key architectural fact:** the hardest requirement — "website tools and
API share core functions" — is already satisfied by the repo layout.
The website computes in the browser *by choice* (privacy: input never
leaves the device). Exposing the same pure modules server-side adds an
automation surface without forking logic, and does not change how the
website works.

Two caveats the design must handle:

- **Browser-lenient behavior.** `repeatText` *clamps* `count` into
  `[1, 10000]` and slices text to 10 000 chars rather than failing.
  `generateBarcode` silently substitutes code 0 for characters outside
  its table and returns an empty SVG for empty data. The API edge must
  reject these inputs (`422`), never clamp or coerce.
- **Prose validators.** UI validators return human sentences. The API
  needs machine-readable codes. The shared fix: export the limit
  constants from tool modules (small, additive refactor) and let each
  capability's zod schema express them, so limits stay in one place
  even though the API reports them structurally.

---

## 3. Architecture overview

### 3.1 Capability registry + one route factory

The platform is a **capability registry** — the API analog of the tool
registry — plus a single **route factory** that turns a capability
definition into an App Router handler. A capability declares everything
about one endpoint: path, method, input schema, limits, the pure
`lib/tools` function it calls, and how the function's result maps to
`data`.

```ts
// lib/api/registry.ts (shape)
interface ApiCapability {
  operationId: string;      // "text.repeat"
  version: "v1";
  method: "POST";
  path: "/api/v1/text/repeat";
  summary: string;
  toolSlug: string;         // cross-reference to lib/registry.ts
  maxBodyBytes: number;
  input: z.ZodType;         // edge validation — encodes the tool's real limits
  run: (input: unknown) => unknown; // thin call into lib/tools/* (no HTTP, no DB)
}

// app/api/v1/text/repeat/route.ts — the WHOLE endpoint file:
export const POST = createApiRoute(capabilities["text.repeat"]);
```

`createApiRoute` (in `lib/api/route.ts`) is the only place that touches
`NextRequest`/`NextResponse` for v1 endpoints. It composes, in order:

1. generate / accept `x-request-id`
2. authenticate bearer key (hash → lookup → revoked check)
3. rate limit (burst + daily quota)
4. body-size cap (`413`)
5. parse JSON (`400 INVALID_JSON`)
6. zod-validate input (`422` with field details)
7. run the capability's pure function inside a timeout
8. wrap success as `{ data, meta, requestId }`
9. record usage (best-effort) and emit rate-limit headers

Because every endpoint flows through this one chain, consistency (error
codes, envelope, headers) is guaranteed by structure — the same trick
`sanitizeAnalyticsEvent` uses for analytics allowlists.

### 3.2 Direction of imports

```
app/api/v1/<domain>/<op>/route.ts   (3-line delegators)
        │ calls
        ▼
lib/api/*   (route factory, auth, rate limit, usage, errors, registry)
        │ imports pure functions only
        ▼
lib/tools/*  (shared with website client components)
        ▲
app/tools/<slug>/*Client.tsx  (unchanged — still calls lib/tools directly)
```

`lib/tools/**` never imports `lib/api/**`. All tools are free, so v1
needs no access checks; if opt-in control is ever needed it belongs in
`lib/api/auth.ts`, never in tool code.

---

## 4. URL scheme, naming, versioning

### 4.1 Path layout

```
/api/v1/{domain}/{operation}
```

The example endpoints map 1:1 to existing tool modules — which is the
point of the naming: the path describes the *capability* (`text/repeat`),
while the response `meta.toolSlug` names the registry tool
(`text-repeater`) for docs/pricing cross-reference:

| Endpoint | Tool module | Function(s) reused |
| --- | --- | --- |
| `POST /api/v1/text/repeat` | `lib/tools/text-repeater.ts` | `repeatText` |
| `POST /api/v1/url/extract` | `lib/tools/extract-urls.ts` | `extractUrls` / `extractUniqueUrls` |
| `POST /api/v1/html/decode` | `lib/tools/html-decoder.ts` | `decodeHtml` / `decodeUrlEncoded` / `decodeAll` |
| `POST /api/v1/sql/validate` | `lib/tools/sql-validator.ts` | `validateSql` |
| `POST /api/v1/barcode/code128` | `lib/tools/barcode-generator.ts` | `generateBarcode` (format pinned `"code128"` by the path) |

A future capability reuses the same domain+operation scheme; nothing
forces a slug-shaped URL. (`json-formatter` and `hash-generator` are
free like everything else and are natural additions to the first wave
beyond the five examples.)

### 4.2 Methods

**All five v1 examples are `POST` with a JSON body.** Rationale: the
payloads are user content (text to repeat, SQL to analyze, barcode data
that may be a serial number), and `GET` query strings land in access
logs and shared caches. POST keeps content out of both. A later,
cacheable "image" form of barcode (SVG bytes with `Cache-Control`) is
the exception that justifies `GET` — not v1.

### 4.3 Versioning policy

- **Path-major versions only** (`/api/v1/`, future `/api/v2/`). No
  header-based versioning — URLs must be stable, bookmarkable, and
  debuggable.
- **Additive changes are allowed within v1**: new capabilities, new
  optional request fields, new fields appended to `data`.
- **Breaking changes require v2** and a deprecation window: new fields
  in request *required* by the function, stricter validation, changed
  error codes, changed response field semantics, removed endpoints.
  Deprecated v1 capabilities keep working; responses carry a
  `Deprecation`/`Sunset` header.
- The registry records `version: "v1"` per capability; the whole
  `/api/v1` tree is contract-frozen at release.

---

## 5. Consistent envelope & error contract

### 5.1 Success

```jsonc
{
  "data": { /* exactly what the shared tool function returns */ },
  "meta": { "toolSlug": "text-repeater", "operationId": "text.repeat" },
  "requestId": "01J…"
}
```

`data` is the unmodified return value of the shared function — the API
documents the same interfaces the web UI already uses
(`RepeatResult`, `ExtractionResult`, `DecodeResult`,
`SqlValidationResult`, `BarcodeResult`). No re-shaping, no drift.

### 5.2 Error

```jsonc
{
  "error": {
    "code": "VALIDATION_FAILED",   // stable machine code
    "message": "Request did not validate",
    "details": [                   // present for 422; omitted otherwise
      { "field": "count", "code": "too_big", "message": "count must be between 1 and 10000" }
    ]
  },
  "requestId": "01J…"
}
```

Top-level `error.message` keeps the string greppable; `code` makes the
contract machine-readable. Codes are stable once v1 ships.

| HTTP | `error.code` | When |
| --- | --- | --- |
| 400 | `INVALID_JSON` | body is not valid JSON |
| 400 | `INVALID_CONTENT_TYPE` | `Content-Type` is not `application/json` |
| 401 | `UNAUTHORIZED` | missing or unrecognized bearer key (`WWW-Authenticate: Bearer`) |
| 403 | `FORBIDDEN` | key revoked |
| 404 | `NOT_FOUND` | unknown path (App Router) |
| 405 | `METHOD_NOT_ALLOWED` | capability exists, wrong method |
| 413 | `PAYLOAD_TOO_LARGE` | body exceeds `maxBodyBytes` (never clamp) |
| 422 | `VALIDATION_FAILED` | zod issues + tool-limit violations, field-level `details` |
| 429 | `RATE_LIMITED` | burst or daily quota exceeded — includes `Retry-After` |
| 500 | `INTERNAL` | unexpected failure — message is generic, `requestId` correlates the server log |

Every response carries `requestId` (echoed from the request header if
present, otherwise generated) and `X-RateLimit-*` headers (§7). The
analytics-ingest routes keep their existing `{ error }` shape — the
platform contract applies to `/api/v1` only.

### 5.3 Example (shared function, verbatim shape)

```bash
curl -s https://toolnest.app/api/v1/text/repeat \
  -H "Authorization: Bearer tn_live_…" -H "Content-Type: application/json" \
  -d '{"text":"ab","count":3,"separator":"","lineBreak":false}'
```

```jsonc
// 200
{ "data": { "output": "ababab", "charCount": 6, "lineCount": 1 },
  "meta": { "toolSlug": "text-repeater", "operationId": "text.repeat" },
  "requestId": "01J…" }

// count = 999999 → 422 (the browser tool clamps; the API must not)
{ "error": { "code": "VALIDATION_FAILED",
             "message": "Request did not validate",
             "details": [{ "field": "count", "code": "too_big",
                           "message": "count must be between 1 and 10000" }] },
  "requestId": "01J…" }
```

---

## 6. Authentication — API keys

### 6.1 Key lifecycle

- **Issue** (session-authenticated, e.g. a `/developers` portal route or
  `POST /api/account/keys`): generate `crypto.randomBytes(32)` →
  base64url → key = `tn_live_` + 43 chars. Show the full key **once**;
  store `sha256(key)` hex in `ApiKey.keyHash` with a display `prefix`
  (`tn_live_a1b2…`) and `suffix` (last 4) for the UI list.
- **Authenticate**: `Authorization: Bearer tn_…` → `sha256(presented)` →
  `findUnique({ keyHash })` → reject if `revokedAt` is set (`403`) or
  missing (`401`). Lookup-by-digest means the raw key is never
  compared or stored, and the digest lookup has no usable timing
  signal. Constant-time concerns apply to *password* verification
  (bcrypt in `lib/auth.ts`); a 256-bit key digest lookup is not the
  same problem.
- **Revoke**: set `revokedAt`; the same key can be re-issued under a
  new id. **Rotate** = revoke + issue (there is no update-in-place of a
  live secret).
- **Free by design**: ToolNest has no paid tiers, so keys are free.
  Rate limits and quotas protect the shared service; they are not a
  billing mechanism.

Key properties: no cookies, no CSRF surface (browser credentials are
not used — important since most API clients are servers/scripts), TLS
mandatory, keys scoped per user (later per organization) so usage is
attributable per account.

---

## 7. Rate limiting & usage metering

### 7.1 Two limits per key

| Limit | Scope | Default | Enforced by |
| --- | --- | --- | --- |
| Burst | per key per minute | 60 req/min | in-memory token bucket (v0) |
| Daily quota | per key per UTC day | 100 req/day (`ApiKey.quotaPerDay`) | daily counter (v0 in-memory with date rollover; DB-backed once metering lands) |

Both answer `429 RATE_LIMITED` with `Retry-After`. Every response —
success or error — includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
`X-RateLimit-Reset` so clients can back off without guessing.

**Store seam:** mirror the existing analytics/register limiter shape but
behind an interface:

```ts
interface RateLimiter {
  check(key: string, cost: number, now?: number):
    { allowed: boolean; remaining: number; resetAt: number };
}
```

v0 ships `InMemoryRateLimiter` (documented single-instance caveat, same
as today's routes). Before multi-instance deploys, swap in
a shared store (Upstash/Redis or a Postgres counter) without touching
handlers.

### 7.2 Usage logs

Every authenticated call records one row (after the response is shaped,
best-effort — a DB failure must not fail the request; degrade to an
in-memory buffer like the analytics storage layer):

```prisma
model ApiUsageLog {
  id         String   @id @default(uuid()) @db.Uuid
  apiKeyId   String   @db.Uuid
  requestId  String   @db.VarChar(64)
  route      String   @db.VarChar(200)   // "/api/v1/text/repeat"
  method     String   @db.VarChar(10)
  status     Int
  latencyMs  Int?
  createdAt  DateTime @default(now())
  apiKey     ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)
  @@index([apiKeyId, createdAt(sort: Desc)])
  @@index([route, createdAt(sort: Desc)])
  @@map("api_usage_logs")
}
```

**Never stored:** request bodies, query strings, raw keys, IPs. Usage is
service telemetry, not surveillance — consistent with the analytics
privacy contract. Aggregations (per key/route/status/day) mirror the
`getAnalyticsSummary()` pattern for dashboards; a key owner can call
`GET /api/v1/usage` (same key auth) to see their own consumption.

---

## 8. Capability contracts — the five v1 endpoints

All endpoints: `POST`, `Content-Type: application/json`, bearer auth,
`maxBodyBytes: 64_000`. Request/response shapes below are the actual
interfaces already exported by `lib/tools/*` (nothing new to design);
the **strictness notes** are the deltas the edge adds over the lenient
browser behavior.

### 8.1 `POST /api/v1/text/repeat` — repeat a string

Input (`RepeatOptions`):

| field | type | constraints |
| --- | --- | --- |
| `text` | string | required, trimmed non-empty, ≤ 10 000 chars (tool's `MAX_TEXT_LENGTH`) |
| `count` | integer | 1–10 000 (tool's `MAX_REPEAT`) |
| `separator` | string | optional, default `""` (ignored when `lineBreak` is true) |
| `lineBreak` | boolean | optional, default `false` |

Response `data`: `RepeatResult` `{ output, charCount, lineCount }`.
Strictness: the browser clamps out-of-range `count` and slices `text`;
the API returns `422` with `details` for each violation (export the
`MAX_*` constants from the module so zod and the tool share them).

### 8.2 `POST /api/v1/url/extract` — extract and categorize URLs

Input:

| field | type | constraints |
| --- | --- | --- |
| `text` | string | required, ≤ 64 000 chars |
| `unique` | boolean | optional — `false` (default) → `extractUrls`; `true` → `extractUniqueUrls` |

Response `data`: `ExtractionResult`
`{ urls: [{ url, domain, protocol, isSecure }], uniqueDomains,
totalCount, httpsCount, httpCount }`. All parsing happens via the
global `URL` constructor inside `extractUrls` — output is re-parsed,
never raw user text echoed into structure. The `unique` flag shows the
transform seam: one endpoint, two functions in the same module.

### 8.3 `POST /api/v1/html/decode` — decode HTML entities / URL encoding

Input:

| field | type | constraints |
| --- | --- | --- |
| `input` | string | required, ≤ 64 000 chars |
| `mode` | `"html" \| "url" \| "all"` | optional, default `"html"` → `decodeHtml` / `decodeUrlEncoded` / `decodeAll` |

Response `data`: `DecodeResult`
`{ decoded, entityCount, originalLength, decodedLength }`.
Documented consumer contract: `decoded` is plain text — clients that
re-render it into HTML must escape it themselves (the API never wraps
output in markup).

### 8.4 `POST /api/v1/sql/validate` — validate SQL syntax and structure

Input: `{ query: string }`, required, ≤ 64 000 chars (maps to the tool's
`validateSql(input)`).

Response `data`: `SqlValidationResult`
`{ isValid, errors: [{ line, column, message, severity, code }],
warnings, statements: [{ type, startLine, endLine, raw }], lineCount }`.

Security note for the docs page: validation is **lexical only** — the
server never parses, executes, or connects to any database, and the
capability deliberately accepts no connection/credentials fields.

### 8.5 `POST /api/v1/barcode/code128` — generate a Code128 barcode (SVG)

Input (format is pinned to `"code128"` by the path; module also
supports code39/ean13 for later endpoints):

| field | type | constraints |
| --- | --- | --- |
| `data` | string | required, 1–80 chars (tool's limit), **ASCII 0x20–0x7E only** (the Code128 table; anything else is silently coerced in the browser) |
| `width` / `height` | integer | 50–2000 each (SVG size bound — prevents pathological output) |
| `showText` | boolean | optional, default `true` |
| `backgroundColor` / `barColor` | string | **must match `^#[0-9a-fA-F]{3,8}$`** — the tool interpolates these straight into SVG `fill` attributes; arbitrary strings would be an injection vector |
| `preset` | `"label" \| "receipt" \| "large"` | optional — expands `BARCODE_PRESETS` (mutually exclusive with manual width/height) |

Response `data`: `BarcodeResult` `{ svg, data, format }` where `format`
is `"code128"`. Strictness deltas over the browser path: empty `data`
(`422`, not `{ svg: "" }`), non-table characters rejected, colors
hex-validated. Text inside the SVG is already `escapeXml`-escaped by
the module; colors are the only attribute-injection surface and are
closed by the hex pattern.

---

## 9. Schema additions (Prisma, additive)

Refines the monetization §4.3 sketch; not yet in `prisma/schema.prisma`:

```prisma
model ApiKey {
  id           String   @id @default(uuid()) @db.Uuid
  name         String   @db.VarChar(100)        // "CI pipeline", "staging"
  keyHash      String   @unique @db.VarChar(64) // sha256 hex of the full key
  prefix       String   @db.VarChar(20)         // display: "tn_live_a1b2…wxyz"
  userId       String   @db.Uuid
  plan         String   @default("free") @db.VarChar(20) // reserved; always "free" (no paid tiers)
  quotaPerDay  Int      @default(100)
  lastUsedAt   DateTime?
  revokedAt    DateTime?
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  usage        ApiUsageLog[]
  @@index([userId])
  @@map("api_keys")
}
```

(`ApiUsageLog` as in §7.2; org-owned keys via an optional
`organizationId` — plus `Organization`/`OrganizationMember` — are a
possible later addition and need no schema changes now.)

---

## 10. Validation & security checklist

1. **Zod at the edge, limits in one place.** Each capability's zod
   schema reproduces the tool's real constants; export the constants
   (`MAX_REPEAT`, `MAX_TEXT_LENGTH`, barcode bounds) from the tool
   modules so both sides import the same numbers. No silent clamping
   (`text/repeat`), no silent substitution (`barcode` charset).
2. **Payload caps before parse.** `413` at the body-size gate; zod
   string-length caps prevent CPU waste on huge inputs.
3. **SQL is never executed** — `validateSql` is pure text analysis.
4. **SVG injection closed** — barcode colors hex-validated, text
   `escapeXml`-escaped by the shared module.
5. **No body content in logs/usage** (§7.2), no raw keys anywhere but
   the one-time issue response, hashing at rest (§6).
6. **Request-id correlation** on every response and usage row for
   support debugging.
7. **Rate limiting + quotas** bound cost per key (abuse and honest bugs
   alike); a coarse per-IP guard can wrap key issuance endpoints.
8. **Bodies are read only after auth + content-type + size checks** so
   unauthenticated traffic can't force JSON parsing work.

---

## 11. Documentation & discovery

1. **`GET /api/v1`** — catalog endpoint (like `GET /api/analytics`):
   storage/auth mode, capability list (operationId, path, method,
   summary, limits), error-code table, link to this design doc.
2. **OpenAPI 3.1, generated, not hand-maintained** — the v1 contract
   lives in the capability registry; `app/api/v1/openapi.json/route.ts`
   derives `components.schemas` from each capability's zod schema via
   `z.toJSONSchema` (zod v4 is already a dependency). Because the
   registry is the source of truth, docs cannot drift from behavior —
   this is the API-documentation deliverable.
3. **Developer portal** (later): `/developers` page
   rendering the OpenAPI spec, a key-management UI (issue/revoke/list,
   session-authenticated), quickstart snippets, and a playground that
   calls the real endpoints with the visitor's own key.
4. **This document** is the reviewable v1 spec for the first slice; per
   endpoint, §8 is normative.

---

## 12. File layout & implementation slices

```
lib/api/
  route.ts        createApiRoute(capability) — the shared handler chain
  registry.ts     ApiCapability type + CAPABILITIES (v1: five entries)
  errors.ts       ApiError, code↔status map, envelope builders
  auth.ts         parseBearer → hashKey → findKey → revoked checks
  rate-limit.ts   RateLimiter interface + InMemoryRateLimiter
  usage.ts        logApiUsage (best-effort), getOwnUsageSummary
  request-id.ts   x-request-id get/create
app/api/v1/
  route.ts                GET catalog
  openapi.json/route.ts   generated OpenAPI 3.1
  usage/route.ts          GET own usage aggregates
  text/repeat/route.ts    export const POST = createApiRoute(...)
  url/extract/route.ts
  html/decode/route.ts
  sql/validate/route.ts
  barcode/code128/route.ts
prisma/schema.prisma       + ApiKey, ApiUsageLog
```

| Slice | Ships | Verify |
| --- | --- | --- |
| **P0 — Platform core** | Schema models; `lib/api` (envelope, errors, request id, auth, in-memory limiter, usage); `createApiRoute`; catalog + openapi endpoints; key issue/revoke endpoints (session auth) | `tsc`, build |
| **P1 — Five endpoints** | Registry entries + five route files, strictness deltas (§8) | Node smoke vs. direct `lib/tools` calls for identical results; curl e2e: valid call, `422` violations, `401`/`403`, `429`, `413`; key hash at rest |
| **P2 — Docs & events** | `/developers` portal (key UI + spec render + playground); register `api_*` events in the analytics registry (`api_request`, funnel vs. web usage) | live smoke |
| **P3 — Scale & orgs** | Shared-store rate limiter; usage dashboards; optional org keys | multi-key e2e |

The repo has no unit-test framework (0 test files); the established
verification pattern — `tsc --noEmit`, production build, Node smoke
harness importing the real modules, curl against a real server — applies
here and is sufficient for P0–P1.

---

## 13. Open decisions (owner: product)

- **Capability tiers** — none needed: every tool (including
  `json-formatter` and `hash-generator`) is free, so the whole
  `lib/tools` directory is eligible for API exposure. No `tier` field
  on `ApiCapability` for v1.
- **Quota numbers** — burst 60/min and daily 100/day are placeholders;
  pick real numbers as fairness caps (not a billing mechanism).
- **Key prefix & format** — `tn_live_` + base64url is proposed;
  confirm before P0 (changing the prefix later is cosmetic but touches
  every stored key).
- **Additional v1 capabilities** — beyond the five examples, the
  natural first wave is more pure `lib/tools` modules: `remove-emojis`,
  `robots-txt` generator, `yaml-formatter`, financial calculators
  (server-safe, deterministic). `pdf-lib`-based transforms are
  portable in principle (monetization §4.3); the worker-based
  `pdf.js` tools are not.
- **Rate-limit store** — in-memory is fine for v0 single-instance;
  pick Upstash vs. Postgres counter before multi-instance deploys (this
  decision is deferred, not blocking).

---

## 14. Relationship to existing designs

- Supersedes the URL shape in `docs/monetization.md` §4.3
  (`/api/v1/tools/{slug}` → operation paths); all mechanics — hashed
  keys, per-key token bucket, `ApiUsageLog`, `/developers` portal —
  carry over unchanged.
- Reuses the privacy contract of `docs/analytics.md` (no PII, no body
  content, opt-out-respecting `api_*` events when they land).
- Enforces the module-direction rule from `docs/monetization.md`
  principle 5 in the other direction: tools stay pure; the platform is
  an envelope around them.

---

## 15. Implementation status

**P0 + P1 shipped** (tracked live in the repo):

- Prisma `ApiKey` + `ApiUsageLog` models (no paid-tier columns — keys
  are free; `quotaPerDay` is a fairness cap).
- `lib/api/`: `errors.ts` (stable codes + statuses), `request-id.ts`,
  `rate-limit.ts` (`FixedWindowRateLimiter`, 60/min burst + per-key
  UTC-day quota), `keys.ts` (`tn_live_` + 43 base64url, sha256 at
  rest, ≤ 20-char display prefix), `auth.ts` (bearer → digest lookup,
  401/403), `usage.ts` (best-effort rows with in-memory fallback +
  own-usage aggregates), `respond.ts` (shared envelope + rate headers),
  `registry.ts` (five capabilities, zod inputs encoding the tools'
  real limits, thin `run` into `lib/tools/*`), `route.ts`
  (`createApiRoute` factory — the single place touching HTTP).
- Endpoints: `POST /api/v1/{text/repeat,url/extract,html/decode,
  sql/validate,barcode/code128}`, `GET /api/v1` (catalog),
  `GET /api/v1/openapi.json` (zod-derived, cannot drift),
  `GET /api/v1/usage` (own-key aggregates).
- Key management (session auth): `GET|POST /api/account/keys`,
  `POST /api/account/keys/[id]/revoke`. Raw key returned exactly once.
- Strictness deltas enforced at the edge: `422` (never clamp/coerce)
  for oversized repeat text/count, barcode charset/color/length/size,
  unknown body keys, invalid modes; `413` body cap; `429` with
  `Retry-After`; `x-request-id` echo; `X-RateLimit-*` headers.

Verified with `tsc`, the production build, a 31-check Node smoke
(run parity against direct `lib/tools` calls, validation deltas, key
helpers, limiters), and live curl (catalog, OpenAPI, 401/405/404/500
envelopes). The two additive tool-module changes: exported
`MAX_REPEAT`/`MAX_TEXT_LENGTH` (text-repeater) and
`MAX_BARCODE_DATA_LENGTH` (barcode-generator).

Operational note: connecting a database requires creating the two new
tables (`prisma db push` or a migration adding `api_keys` and
`api_usage_logs`); until then key-authenticated calls answer 500
`INTERNAL` (keys are DB-backed by design) and the in-memory rate
limiter stays single-instance.
