/**
 * Server-side rate fetching for the Currency Converter.
 *
 * Fetches daily ECB reference rates from Frankfurter (https://frankfurter.dev)
 * — free, keyless, open-source, backed by the European Central Bank.
 * Privacy: the fetch happens SERVER-SIDE, so visitor IPs are never shared
 * with the API. The result is cached process-wide for an hour, so even a
 * busy site makes at most ~24 requests/day.
 *
 * Any failure (offline build, network down, bad payload) falls back to the
 * baked snapshot in lib/tools/currency-converter.ts — the tool always works.
 */

import {
  OFFLINE_RATE_SET,
  type CurrencyRateSet,
} from "@/lib/tools/currency-converter";

const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=EUR";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FETCH_TIMEOUT_MS = 5_000;

const globalForRates = globalThis as unknown as {
  toolnestRateCache?: { set: CurrencyRateSet; fetchedAt: number };
};

function isValidRatePayload(data: unknown): data is { date: string; rates: Record<string, number> } {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
    typeof d.rates === "object" &&
    d.rates !== null &&
    Object.keys(d.rates as object).length > 0
  );
}

/**
 * Current rate set: live ECB rates when reachable (1h cache), otherwise
 * the baked offline snapshot. Never throws.
 */
export async function fetchRates(): Promise<CurrencyRateSet> {
  const cached = globalForRates.toolnestRateCache;
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.set;
  }

  try {
    const res = await fetch(FRANKFURTER_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      // Next.js data cache as a second layer (survives across requests
      // even where the process cache is cold).
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (!isValidRatePayload(data)) throw new Error("Invalid rate payload");

    const set: CurrencyRateSet = {
      rates: { EUR: 1, ...data.rates },
      date: data.date,
      source: "live",
    };
    globalForRates.toolnestRateCache = { set, fetchedAt: Date.now() };
    return set;
  } catch {
    // Fall back to the baked snapshot — never block the UI on rates.
    return OFFLINE_RATE_SET;
  }
}
