# ToolNest Analytics

Privacy-conscious, first-party behavioral analytics for ToolNest.

- **No personal information.** No cookies, no email, no IPs, no user
  agents, no account linkage, no input content (text, files, queries).
- **No raw data leaves the browser as-is.** The client collects only
  registry-declared attributes; the server re-validates everything and
  drops anything unexpected.
- **Respects the user.** Events are suppressed when the browser sends
  Do Not Track or Global Privacy Control, and users can opt out with
  `analytics.optOut()` (persisted in `localStorage`, not a cookie).

## Architecture

| Layer | File | Role |
| --- | --- | --- |
| Registry | `lib/analytics/events.ts` | Event names, per-event attribute **allowlists**, funnel definitions, server-side sanitizer. Single source of truth, shared by client & server. |
| Client tracker | `lib/analytics/client.ts` | Anonymous session id, bounded batched queue, `sendBeacon` delivery, typed helpers, opt-out/DNT. |
| Storage | `lib/analytics/server.ts` | In-memory store (default/dev) or Prisma → `analytics_events` table. Automatic graceful fallback. |
| Ingest API | `app/api/analytics/route.ts` | `POST` validate + store; `GET` event catalog + funnels. |
| Summary API | `app/api/analytics/summary/route.ts` | `GET` aggregated dashboard numbers (token-protected). |
| Provider | `components/tool/AnalyticsProvider.tsx` | Tool-scoped context mounted once per tool page. |
| Docs | `docs/analytics.md` | You are here. |

## Event catalog & conventions

Naming convention: snake_case verb + object, e.g. `result_copied`.
Attribute convention: lowerCamelCase, e.g. `fileExtension`, with the
attribute **allowlist** declared next to each event in
`ANALYTICS_EVENT_SPECS`.

| Event | Fires when | Allowed attributes |
| --- | --- | --- |
| `tool_opened` | A tool page is viewed (provider mount, deduped 3 s) | `toolSlug` |
| `tool_completed` | A utility tool renders a result for the first time | `toolSlug` |
| `calculation_completed` | A calculator renders a numeric result | `toolSlug` |
| `result_copied` | A result is copied to the clipboard | `toolSlug`, `resultSize` |
| `file_uploaded` | A file is selected/dropped | `toolSlug`, `fileExtension`, `fileSize` |
| `file_processed` | A file finishes processing successfully | `toolSlug`, `durationMs` |
| `file_downloaded` | A generated file is downloaded (`<a download>` click) | `toolSlug`, `fileExtension` |
| `tool_searched` | A search is submitted | `queryLength`, `resultCount` |
| `search_result_clicked` | A search suggestion is clicked | `resultType`, `resultSlug`, `resultPosition` |
| `ad_shown` | An ad slot became visible | `placementId` |
| `ad_clicked` | An ad/affiliate link was clicked | `placementId` |

Notes:

- `toolSlug` is always non-identifying (a registry slug like
  `text-repeater`), never free text.
- Search events intentionally never carry the raw query; only
  `queryLength` and `resultCount` are kept.
- `fileExtension`/`fileSize` are collected — the file **name** and any
  content never are.
- `page` (pathname only) and an anonymous tab-scoped `sessionId` are
  added to every event by the tracker.

## Funnels (dashboard-ready)

Defined in `ANALYTICS_FUNNELS` and exposed by `GET /api/analytics`:

1. **Tool usage** — `tool_opened` → `tool_completed`/`calculation_completed`
   → `result_copied`/`file_downloaded`.
2. **Search** — `tool_searched` → `search_result_clicked` → `tool_opened`.
3. **File processing** — `file_uploaded` → `file_processed` → `file_downloaded`.

The ad events are registered in the same registry and are emitted by
`<AdSlot>` in `components/monetization/*`. They carry the slot
identifier only — never ad content.

## How events are wired (reusable components)

One `AnalyticsProvider` is mounted per tool page by the server-side
`ToolPageWrapper`. Reusable components resolve the active slug from that
context (falling back to the URL path) so no page needs to pass props:

- **Copy buttons** → `result_copied`
- **Result panels** (`ToolResultPanel`, empty → filled transition) →
  `tool_completed` or `calculation_completed` (auto-classified by
  category/name; override with the `completionEvent` prop)
- **`PdfDropzone`** → `file_uploaded`
- **`usePdfWorker`** → `file_processed` with `durationMs`
- **Delegated download listener** (any `<a download>` in a tool page,
  including programmatic `anchor.click()`) → `file_downloaded`
- **`SearchBar`** → `tool_searched` / `search_result_clicked`

Per-tool bespoke code (e.g. main-thread PDF tools) calls the typed
helpers directly: `analytics.fileUploaded(tool.slug, file)`.

## Performance

- Events are queued in memory and flushed in batches of ≤ 20 every ≤ 5 s
  or when the batch fills — never on the render path.
- Delivery is `navigator.sendBeacon` (survives page unload) with a
  fire-and-forget `fetch(keepalive)` fallback; failures are retried on
  the next tick.
- The queue is bounded (100 events); an offline browser drops oldest
  events instead of growing memory.
- The tracker module has no timers while idle and no effect on
  interactions. File/PDF work stays in Web Workers regardless.
- Duplicate `tool_opened` (StrictMode/hydration) is deduped client-side
  within a 3 s window without suppressing real revisits.

## Storage

`ANALYTICS_STORAGE` env (optional):

- `memory` — in-memory ring (dev/demo; not durable).
- `prisma` — persists to the `analytics_events` table.
- Unset — auto: `prisma` when `DATABASE_URL` exists, else `memory`.

Create the table once:

```bash
prisma migrate dev --name add_analytics_events
```

If the table is missing at runtime, ingest falls back to memory and logs
a warning — analytics can never take the site down.

## Dashboard

Aggregated endpoint (never raw events):

```bash
# dev (no token configured): open
curl "localhost:3000/api/analytics/summary?days=7"

# production: set ANALYTICS_DASHBOARD_TOKEN and send it
curl -H "Authorization: Bearer $TOKEN" \
  "https://toolnest.io/api/analytics/summary?days=7"
```

Response shape (anonymous counts only):

```json
{
  "generatedAt": 1720000000000,
  "mode": "prisma",
  "days": 7,
  "totalEvents": 1234,
  "byEvent": [{ "event": "tool_opened", "count": 400 }],
  "byTool": [{ "tool": "text-repeater", "count": 120 }],
  "byDay": [{ "day": "2026-09-01", "count": 100 }]
}
```

Alternatively, query Postgres directly:

```sql
SELECT event, tool_slug, date_trunc('day', "occurredAt") AS day, count(*)
FROM analytics_events
WHERE "occurredAt" >= now() - interval '7 days'
GROUP BY 1, 2, 3
ORDER BY 3 DESC, 4 DESC;
```

## Adding a new event

1. Add the name to `AnalyticsEvents` in `lib/analytics/events.ts`.
2. Add its spec (description + **attribute allowlist**) to
   `ANALYTICS_EVENT_SPECS`.
3. Add a typed helper in `lib/analytics/client.ts`.
4. (Optional) register it in a funnel in `ANALYTICS_FUNNELS`.
5. Document it in the table above.

The ingest API validates against the registry automatically — no server
changes needed.

## Opt-out API

```ts
import { optOut, isAnalyticsOptedOut } from "@/lib/analytics";

optOut(true);           // stop collecting for this browser
isAnalyticsOptedOut();  // read the current state
```

Do Not Track (`navigator.doNotTrack`) and Global Privacy Control
(`navigator.globalPrivacyControl`) are honored automatically.
