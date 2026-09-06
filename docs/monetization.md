# ToolNest Monetization Architecture

A design for monetizing ToolNest across five revenue streams — display
ads, premium tools, API access, affiliates, and business subscriptions —
without harming the free-tool experience.

This document is a *design*, not an implementation. It names the exact
files, components, and schema changes each stream needs so the work can
be sliced into reviewable increments.

> **Product decision — ToolNest is free.** No billing, checkout, or
> payment integrations will be built; the paid-tier and subscription
> designs in this document are **archived for reference only**.
> Premium gating has been removed — every tool, including
> `json-formatter` and `hash-generator`, is free for everyone. The
> non-payment infrastructure that already shipped (feature flags,
> house-ads components, analytics events, `User.plan`) stays in the
> tree and may still be used in free forms — e.g. house ads as
> cross-promotion, or optional rate-limited API keys.

---

## 1. Principles (non-negotiable)

1. **Free tools stay free and fully usable.** A tool's core job — its
   input → result → copy/download loop — is never paywalled. Premium
   adds *capability* (scale, batch, export, history, API), not the basic
   result.
2. **Ads never block primary interactions.** Ads occupy reserved,
   pre-sized slots *outside* the interactive flow (below the tool, in
   sidebars, between content sections). No interstitial before first
   use, no overlay over the result panel, no layout shift.
3. **No forced accounts, no aggressive popups.** Authentication and
   upgrade prompts are contextual and dismissible. A user can complete
   any free tool end-to-end without ever signing in.
4. **Premium = real value.** Every paid feature maps to something a
   user demonstrably cannot do on free (limits lifted, more power,
   convenience, privacy/removal of ads, shared/saved state).
5. **Monetization is a separate module.** `lib/monetization/**` owns
   flags, entitlements, ads, and billing. It reads from the tool
   registry and analytics registry; **neither** `lib/tools/**`,
   `lib/registry.ts`, nor tool pages ever import monetization logic.
   Tool code stays pure and ad-agnostic.
6. **Privacy posture extends to ads.** The site already suppresses
   analytics under DNT/GPC and stores no PII (see `docs/analytics.md`).
   Third-party ad scripts get the same treatment — no ad network loads
   when the visitor has opted out, and cookie-less/first-party
   placements are the default until a consent mechanism exists.

---

## 2. What monetization builds on (today's code)

| Concern | Current state |
| --- | --- |
| Tool registry | `lib/registry.ts` — `Tool[]` with `slug, name, description, icon, category, tags, featured, deprecated`. 53 entries, ~35 have pages. `getAllTools()` already filters `deprecated` — the same pattern can filter/flag premium. |
| Tool type | `types/tool.ts` — plain data, no tier/access field yet. |
| Tool pages | `app/tools/<slug>/page.tsx` (server) → `ToolPageWrapper` (server: JSON-LD + `AnalyticsProvider`) → `ToolPageLayout` (`ToolHeader` → children → `RelatedTools` → `FAQSection`). |
| Tool logic | `lib/tools/<slug>.ts` — pure, browser-side functions used by client components. |
| PDF processing | Worker-based (`usePdfWorker`) + some main-thread (`pdf-lib`). |
| Data layer | Prisma/Postgres: `User`, `FavoriteTool`, `SavedCalculation`, `UserPreference`, `ToolUsageHistory`, `AnalyticsEvent`. No billing/org/API-key models. |
| Auth | NextAuth v5, JWT sessions, `pages.signIn: "/login"`. Credentials provider is an MVP stub (any known email "authenticates") and there is **no `/login` page yet** — real accounts are a prerequisite for premium/API/business. |
| Analytics | `lib/analytics/events.ts` registry: allowlisted attributes, funnels, DNT/opt-out. Reusable components emit without per-page work. |
| Rate limiting | In-memory Map limiter in `app/api/analytics/route.ts` — a pattern to reuse for the public API. |

Key architectural fact that shapes everything: **most tools compute in
the browser.** A pure client-side calculator cannot be meaningfully
"locked" — the math is inspectable. So gating value must live where the
server has authority: usage caps, file/result size limits, batch
concurrency, export formats, saved state, API quotas, and removal of
ads. Premium *tools* (new, unbuilt utilities) are the exception — their
pages simply don't exist for free users yet.

---

## 3. Cross-cutting architecture

### 3.1 Module map (`lib/monetization/`)

```
lib/monetization/
  config.ts        # Tier/pricing/limits constants + flag DEFAULTS (pure data, no env)
  flags.ts         # Feature-flag evaluation (server) + safe client bundle helper
  entitlements.ts  # resolveEntitlements(user) → tier, limits, ad-free?, enabled flags
  ads.ts           # Ad-slot registry + provider adapter interface (house ads = default impl)
  billing.ts       # Billing provider interface (Stripe adapter) + webhook parsing
  events.ts        # Monetization event specs (registered into lib/analytics/events.ts)
```

Import rules (enforced by convention, optionally by ESLint
`no-restricted-imports` later):

- `lib/tools/**`, `lib/registry.ts`, `lib/analytics/**` → **never**
  import `lib/monetization/**`.
- Tool pages import only *components* (`components/monetization/*`) or
  the resolved entitlement *value* (via props/context), never raw flags.
- `lib/monetization/**` may import `lib/registry.ts` (read-only) and
  `lib/analytics` (emit events) — one direction only.

### 3.2 Feature flags

Flags gate *rollouts* (ads on/off, premium tool visibility, new pricing)
and *entitlements* (what a given tier can do). One tiny evaluator, no
framework:

```ts
// lib/monetization/flags.ts (server-safe; no client secrets)
interface FlagSpec { key: string; default: boolean | number; source?: "env" | "db" | "config"; }
const FLAG_DEFAULTS = {
  "ads.enabled":          false,   // master kill switch
  "ads.network":          "house", // house | <network id>
  "premium.showBadges":   true,
  "premium.showUpsells":  false,   // staged rollout
  "api.public":           false,
  "business.teams":       false,
} as const;

// Resolution order: request/user context (highest) → DB override → env → default.
// e.g. resolveFlag("ads.enabled", { user: { tier: "premium" } }) → false for premium
```

- **Safe default:** everything is off; revenue streams ship dark.
- **Kill switch:** `ads.enabled = false` and `ads.network = "house"`
  cut ads instantly without deploys (DB/env override).
- **No client secrets:** the server resolves flags and hands the client
  a small typed bundle (`{ adsEnabled, adFree, upsellSurface }` etc.)
  via a `MonetizationProvider` mounted in `app/layout.tsx` beside the
  existing `Providers` — mirroring how `AnalyticsProvider` scopes tool
  pages today.

### 3.3 Entitlements, not hardcoded tiers

Server resolves a single `Entitlements` object per request/user:

```ts
interface Entitlements {
  tier: "free" | "premium" | "business" | "api";
  adFree: boolean;
  limits: { maxFileMb: number; batchSize: number; savedHistory: boolean; apiQuotaPerDay: number };
  flags: Record<string, boolean | number>;
}
```

Free tools render exactly as today because the *free* limit IS the
current behavior. Raising a limit for paid users is a one-line config
change that no tool code needs to know about (see §4.2).

### 3.4 Monetization events

Extend the existing registry (`lib/analytics/events.ts` + one typed
helper each) — same privacy contract, allowlists only, no content:

| Event | Meaning | Attributes |
| --- | --- | --- |
| `ad_shown` | An ad slot became visible | `placementId` |
| `ad_clicked` | Ad/affiliate link clicked | `placementId` |
| `upsell_viewed` | Upgrade prompt shown (contextual, dismissible) | `surface` (`result` / `related` / `limit`) |
| `upsell_dismissed` | User closed it without action | `surface` |
| `checkout_started` | Reached the billing provider | `plan` |
| `subscription_activated` | Webhook-confirmed entitlement change | `plan` |

These feed the existing funnel machinery (e.g. a monetization funnel
`upsell_viewed → checkout_started → subscription_activated`), letting
us *measure* that ads/upsells don't harm the free funnel
(`tool_opened → tool_completed → outcome`).

---

## 4. The five streams

### 4.1 Display advertising

**Inventory (placement IDs, fixed aspect ratios so no CLS):**

| Placement | Where | Notes |
| --- | --- | --- |
| `tool-below` | `ToolPageLayout`, after the tool's result area, before `RelatedTools` | Leaderboard; the only slot on tool pages |
| `category-inline` | `app/categories/[slug]/page.tsx`, between the grid and the footer content | |
| `home-below-featured` | `app/page.tsx`, after featured/popular sections | House campaign default |
| `result-side` | Free tool clients with wide viewports, only *after* a result exists | Never between input and result |

**Implementation:**

- `<AdSlot placement="tool-below" />` — client component that reads the
  flag bundle and renders **nothing** when ads are off, when the user
  is premium (`adFree`), or when DNT/GPC/opt-out is active.
- Reserved space: every slot declares min-height at its aspect ratio;
  a neutral "placeholder" card with an `Ad` disclosure renders before
  any network call so layout never shifts.
- Provider abstraction: `lib/monetization/ads.ts` exposes
  `renderSlot(placement, ctx): AdPayload | null`. The default
  implementation is **house ads** (cross-promote ToolNest premium/API —
  zero third-party scripts). A network adapter (Google AdSense etc.)
  can be swapped in per-flag `ads.network` **without touching layout
  code**, and only after a cookie/consent banner exists (§7, Open
  decisions) because third-party ad scripts contradict the site's
  DNT-first privacy stance.
- No ad on: result-copy buttons, the moment a result appears (scroll
  required), error states, or any single-pixel/tiny viewport layout.

### 4.2 Premium tools & features

**Two complementary shapes:**

1. **Premium tools** — new utilities built against the unbuilt half of
   the registry (18 registered slugs have no page yet, e.g.
   `case-converter`, `area-calculator`, `currency-converter`). Add
   `tier?: "free" | "premium"` to `types/tool.ts` and the registry
   entries; public listings filter like `deprecated` does today, with a
   tasteful lock icon + "Premium" badge instead of hiding them (SEO
   value + honest merchandising).
2. **Premium power-ups on free tools** — the realistic monetization for
   tools that already exist:
   - **Scale:** lift per-run caps (PDF merger >10 files, file size
     50 MB → 200 MB, longer text/history limits).
   - **Batch & concurrency:** process many files in one run.
   - **Fidelity/export:** watermark-free, higher-res PDF/PNG output,
     more export formats.
   - **Saves & sync:** store results/presets via the *existing*
     `SavedCalculation` / `UserPreference` models (today they're
     unreachable because there's no login flow).
   - **No ads** (`adFree`) on every tool page.

**Gating mechanics (server-authoritative, since compute is client-side):**

- `ToolPageLayout` / `ToolPageWrapper` (server) resolve entitlements and
  choose which client bundle renders: a premium tool with no
  entitlement shows a feature preview + upsell (not a 404 — keeps the
  URL crawlable); a free tool renders fully, with limits applied
  client-side but *validated* server-side wherever a request exists
  (API, save endpoints).
- Reusable surfaces, all contextual and dismissible:
  `<PremiumBadge tool />`, `<UpsellCard surface="limit" />` (shown only
  after a user actually hits a limit), and a small, closable banner on
  the free version of a power-up tool. **No modal on page load; no
  interstitial before first use.**
- Conversion flow: `/login` (new) → checkout (billing provider) →
  webhook → entitlement row → next server render unlocks. Because
  entitlements are fetched server-side per request (JWT session →
  `resolveEntitlements`), no fragile client state gates access.

### 4.3 API access

**Shape:** `POST /api/v1/tools/{slug}` — JSON request in, JSON result
out, for the subset of `lib/tools/*` functions that are server-portable
(formatters, calculators, generators, and `pdf-lib`-based transforms;
the `pdf.js`-worker tools are not server-portable as written and stay
out of v1 or get re-implemented). This also gives us a *server-side*
compute path for the few features that genuinely need authority.
The concrete endpoint shape is refined by `docs/api-platform.md`:
operation-style paths such as `/api/v1/text/repeat` (same key,
quota, and metering mechanics as sketched here).

**Mechanics:**

- **Keys:** new `ApiKey` Prisma model (hashed key, prefix `tn_`, name,
  tier, revoked flag). `lib/monetization/entitlements.ts` resolves a
  key's plan + daily quota.
- **Auth & limits:** `Authorization: Bearer tn_...` middleware on the
  `/api/v1` router; per-key token bucket upgraded from the analytics
  route's in-memory limiter to a DB/Redis-backed one (the analytics
  limiter is per-instance only — fine for ingest, not for billing).
- **Metering:** every call writes to `ApiUsageLog` (new model: key id,
  route, status, count) — the same table family as the existing
  `ToolUsageHistory`.
- **Portals:** a `/developers` page with docs + a playground; free tier
  quota (e.g. 100 req/day) exists to demo, paid tiers raise it. Same
  funnel analytics (`api_*` events can reuse `tool_opened`-style names).

### 4.4 Affiliate opportunities

**Shape:** contextual, disclosed recommendations — e.g. "Recommended
book/software for this calculator" beside `RelatedTools`, honest
"hosting/domain" links on developer tools, printer/paper links near PDF
tools. Implemented as:

- `<AffiliateLink rel="sponsored nofollow noopener" campaign={...}>`
  client component; catalog lives in `lib/monetization/affiliates.ts`
  keyed by `toolSlug`/`categorySlug` so tool code never references it.
- Disclosure line ("Affiliate disclosure") on every such link per FTC
  practice; links are static first-party `<a>` tags until a network is
  chosen (keeps SSR + crawlability).
- Events: reuse `ad_clicked` (same funnel) with placement `affiliate-*`.
- Policy guardrails: only *relevant* products, no fake urgency/countdown
  widgets, no disguised buttons, and never inside the tool's result flow.

### 4.5 Business subscriptions

**Shape:** teams buy seats; members get premium power-ups + shared
workspace. Concrete value for a tools site:

- **Team workspace:** shared saved calculations and favorites
  (extend `SavedCalculation` with `organizationId`).
- **Pooled API quota** and shared API keys for the org.
- **Priority support** and consolidated invoicing.
- **Admin console:** manage seats, keys, usage (read-only dashboards of
  the existing usage/analytics aggregates).

**Schema additions** (all new models, additive):

```prisma
model ApiKey {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  keyHash   String   @unique          // never store the raw key
  prefix    String   // "tn_" + first 8 chars for display
  userId    String?  @db.Uuid         // individual (api tier)
  orgId     String?  @db.Uuid         // or team-owned
  plan      String   @default("free") // free | pro | business
  quotaPerDay Int    @default(100)
  lastUsedAt DateTime?
  revokedAt DateTime?
  createdAt DateTime @default(now())
  usage     ApiUsageLog[]
  @@map("api_keys")
}

model ApiUsageLog {
  id         String   @id @default(uuid()) @db.Uuid
  apiKeyId   String   @db.Uuid
  route      String   @db.VarChar(200)
  status     Int
  createdAt  DateTime @default(now())
  @@index([apiKeyId, createdAt(sort: Desc)])
  @@map("api_usage_logs")
}

model Organization {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  ownerId   String   @db.Uuid
  plan      String   @default("free")   // synced from billing provider
  seats     Int      @default(1)
  members   OrganizationMember[]
  apiKeys   ApiKey[]
  createdAt DateTime @default(now())
  @@map("organizations")
}

model OrganizationMember {
  id             String @id @default(uuid()) @db.Uuid
  organizationId String @db.Uuid
  userId         String @db.Uuid
  role           String @default("member") // owner | admin | member
  @@unique([organizationId, userId])
  @@map("organization_members")
}
```

(Individual premium needs no new table — derive it from the billing
provider's subscription state, cached in `UserPreference`/a small
`Subscription` model when offline checks matter.)

**Billing provider boundary:** `lib/monetization/billing.ts` defines
`createCheckout(plan, userId)`, `handleWebhook(body, signature)`, and
`syncEntitlement(userId)`. Stripe is the default adapter; a webhook
route (`/api/billing/webhook`) is the *only* place that mutates plan
state — the UI never trusts its own checkout calls.

---

## 5. UX guardrails (enforced in code review)

1. **Free-path completion test:** every free tool must reach
   copy/download without login, without dismissing an ad, without
   scrolling past an upsell. CI-able later as a smoke spec.
2. **No load-blockers:** zero modals/full-screen prompts on mount; no
   timed popups; upsell surfaces only at natural boundaries (limit hit,
   result shown, page bottom).
3. **Layout stability:** all ad slots pre-sized (CLS ≈ 0); ads render a
   neutral placeholder before fetching; tool result area is never
   resized by monetization.
4. **Measured, not assumed:** the analytics funnels in §3.4 run
   continuously. If `upsell_viewed` on a tool correlates with a drop in
   that tool's `tool_opened → tool_completed` conversion, the surface
   is dialed back. Ads must never degrade the existing free funnel
   (that funnel is the product's real KPI and the ad inventory's
   value).
5. **Respect privacy:** DNT/GPC/opt-out suppresses third-party ad
   scripts, not just analytics.

---

## 6. Phased roadmap

| Phase | Ships | Depends on |
| --- | --- | --- |
| **R0 — Foundations** | `lib/monetization/flags.ts` + defaults, `MonetizationProvider` in layout, `Tool.tier` field + registry pass, monetization events registered | nothing (pure additive) |
| **R1 — Premium (consumer)** | `/login` with real auth (password hashing or OAuth), billing adapter + webhook, `resolveEntitlements`, premium badge + ad-free, first premium power-up (e.g. PDF batch / 200 MB), first premium tool built from an unbuilt registry slug | R0 |
| **R2 — House ads** | `<AdSlot>`, placement registry, house-ad campaign (cross-promo), ad-free for premium, funnel measurement | R0 |
| **R3 — Affiliates** | `<AffiliateLink>` + catalog + disclosure, `ad_clicked` reporting | R0 |
| **R4 — API & business** | `ApiKey`/`ApiUsageLog`/`Organization` models, the `/api/v1` platform (see `docs/api-platform.md`) for portable tools, `/developers`, team workspace | R1 |
| **R5 — Networks** | Optional third-party ad/affiliate networks behind flags, after consent banner exists | R2/R3 + privacy review |

Quick wins are front-loaded: R0 + R1's first power-up are the smallest
slice that produces revenue signal, and R2's house ads cost nothing but
build time while establishing the slot inventory later sold to
networks.

---

## 7. Open decisions (owner: product)

- **Pricing & packaging** — what the premium tier costs and which
  power-ups are in v1.
- **Which unbuilt tools become premium** — the 18 unbuilt slugs are the
  natural premium *tool* pipeline; pick 1–2 for R1.
- **Billing provider** — Stripe (recommended default) vs Paddle vs
  Lemon Squeezy (merchant-of-record saves VAT/global tax work).
- **Ad network vs house ads first** — recommended: house ads for R2,
  network behind a flag later, because the site has no cookie-consent
  banner and third-party scripts currently contradict its DNT-first
  stance.
- **Real authentication first** — premium/API/business all require the
  `/login` flow and a non-stub Credentials provider (or OAuth); that is
  the true R1 critical path.

Nothing in this design requires changing how a free tool computes,
which is the point: monetization is an envelope around the registry,
the layout, and the data layer — not a modification of the tools
themselves.

---

## 8. Implementation status

Shipped so far (tracked live in the repo):

- **R0 — Foundations (ads-only today).** `lib/monetization/` ships the
  `ads.enabled` / `ads.network` flags (both with safe defaults) and
  `TOOLNEST_FLAG_*` env overrides, plus a slim server→client bundle
  via `<MonetizationProvider>` in the root layout. The tier/plan/
  limits machinery this step originally described is gone — removed in
  the free pivot (see the superseded note below).
- **R1 — Real accounts.** `User.passwordHash`, bcrypt hashing
  (`lib/password.ts`), rewritten Credentials provider,
  `/api/auth/register`, the `/login` page (sign in + create account),
  `SessionProvider`, and Header sign-in/sign-out. No plans or tiers —
  accounts exist for saved results and favorites.
- **R2 — House ads.** `lib/monetization/ads.ts` (placement registry
  with fixed pixel heights, house creative catalog, deterministic
  `decideAdSlot` gate) and `<AdSlot placement=… />`, mounted on every
  tool page (`tool-below`), the homepage (`home-below-featured`) and
  category pages (`category-inline`). `result-side` is registered but
  not mounted (reserved for per-tool result ads).

  Everything renders nothing while `ads.enabled` is false (default —
  the kill switch). `ad_shown`/`ad_clicked` fire through the analytics
  registry and respect opt-out/DNT/GPC.

  Enable with the flag; note that statically prerendered routes bake
  the value at build time — flip the env and rebuild (a runtime DB
  override layer is the follow-up that makes it deploy-free).

  ```bash
  TOOLNEST_FLAG_ADS_ENABLED=true npm run build && npm start
  ```

**Superseded — free product decision:** no billing adapter, webhook,
checkout, premium tools, or premium power-ups will be built, and all
payment-related code has been removed from the repo:
`PremiumBadge`/`PremiumGate`/`PremiumToolPage`,
`session-entitlements.ts`, the tier/limits modules, `Tool.tier` /
`premiumFeatures`, and `User.plan` are deleted. `json-formatter` and
`hash-generator` are free tools for everyone. The paid-tier design
sections of this document are archived history — only the account
layer (R1) and house ads (R2) are live.
