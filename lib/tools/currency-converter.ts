/**
 * Currency Converter.
 * Hybrid rate strategy:
 *  - LIVE: the server fetches daily ECB reference rates from Frankfurter
 *    (free, keyless, no user data shared) with an hourly cache — see
 *    lib/rates/fetch-rates.ts.
 *  - OFFLINE: this baked ECB snapshot keeps the tool fully functional
 *    whenever the live fetch fails or is unavailable.
 *
 * All rates are expressed as units of currency per 1 EUR (ECB convention);
 * any from→to rate is derived by cross-division, so no pair is special-cased.
 */

// ── Baked ECB snapshot (offline fallback) ────────────────────────────
// ECB reference rates via Frankfurter (2026-09-04)
export const RATE_DATE = "2026-09-04";
export const EUR_RATES: Record<string, number> = {
  EUR: 1,
  AUD: 1.6134,
  BRL: 5.9405,
  CAD: 1.6038,
  CHF: 0.9405,
  CNY: 7.7994,
  CZK: 24.189,
  DKK: 7.4747,
  GBP: 0.85898,
  HKD: 9.112,
  HUF: 363.28,
  IDR: 20496.04,
  ILS: 3.4954,
  INR: 109.8165,
  ISK: 140.8,
  JPY: 181.59,
  KRW: 1569.38,
  MXN: 19.6401,
  MYR: 4.7005,
  NOK: 10.8035,
  NZD: 1.9755,
  PHP: 72.812,
  PLN: 4.3148,
  RON: 5.253,
  SEK: 11.1005,
  SGD: 1.4724,
  THB: 38.26,
  TRY: 56.2995,
  USD: 1.1622,
  ZAR: 18.5571,
};

export const CURRENCY_NAMES: Record<string, string> = {
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan Renminbi",
  CZK: "Czech Koruna",
  DKK: "Danish Krone",
  EUR: "Euro",
  GBP: "British Pound Sterling",
  HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  INR: "Indian Rupee",
  ISK: "Icelandic Króna",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PHP: "Philippine Peso",
  PLN: "Polish Złoty",
  RON: "Romanian Leu",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  USD: "US Dollar",
  ZAR: "South African Rand",
};

/** Shared limits — client, validators, and future API must agree. */
export const MAX_AMOUNT = 1_000_000_000;

export type RateSource = "live" | "offline";

export interface CurrencyRateSet {
  rates: Record<string, number>;
  /** Rate date (ECB business date), "YYYY-MM-DD". */
  date: string;
  source: RateSource;
}

/** The always-available offline rate set. */
export const OFFLINE_RATE_SET: CurrencyRateSet = {
  rates: EUR_RATES,
  date: RATE_DATE,
  source: "offline",
};

/** Supported codes, alphabetically for the pickers. */
export const SUPPORTED_CODES = Object.keys(EUR_RATES).sort();

/** Units of `to` per 1 `from` — null when a code is unsupported.
 *  Rates are per-EUR, so the cross is rates[to] ÷ rates[from]. */
export function crossRate(
  from: string,
  to: string,
  rates: Record<string, number> = EUR_RATES
): number | null {
  const f = rates[from];
  const t = rates[to];
  if (!f || !t) return null;
  return t / f;
}

export interface ConversionOutcome {
  amount: number;
  from: string;
  to: string;
  /** Converted amount. */
  converted: number;
  /** Units of `to` per 1 `from`. */
  rate: number;
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = EUR_RATES
): ConversionOutcome | null {
  const rate = crossRate(from, to, rates);
  if (rate === null || !Number.isFinite(amount)) return null;
  return {
    amount,
    from,
    to,
    converted: amount * rate,
    rate,
  };
}

/** Locale-aware currency formatting ("₹1,234.56", "€99", "¥1,000"). */
export function formatMoney(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${code}`;
  }
}

/** Rate formatting — enough precision for big crosses like IDR. */
export function formatRate(rate: number): string {
  if (rate === 0) return "0";
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}

/** "Euro (EUR)" */
export function currencyLabel(code: string): string {
  const name = CURRENCY_NAMES[code];
  return name ? `${name} (${code})` : code;
}

export function validateConvertInput(
  amount: number,
  from: string,
  to: string
): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter an amount greater than zero.";
  }
  if (amount > MAX_AMOUNT) {
    return `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}.`;
  }
  if (!EUR_RATES[from]) return "Unsupported source currency.";
  if (!EUR_RATES[to]) return "Unsupported target currency.";
  return null;
}
