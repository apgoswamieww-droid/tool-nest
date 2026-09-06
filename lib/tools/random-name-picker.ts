/**
 * Random Name Picker.
 * Fair selection using crypto.getRandomValues (rejection sampling, so no
 * modulo bias). Names are entered one per line; duplicates can be allowed
 * (entries = chances) or removed.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_NAMES = 1_000;
export const MAX_NAME_LENGTH = 80;
export const MAX_WINNERS = 20;

export interface PickerOptions {
  allowDuplicates?: boolean;
  /** Deterministic seed for reproducible picks (testing). Uses crypto when omitted. */
  seed?: number;
}

export interface PickOutcome {
  winners: string[];
  /** Names available in this draw (after duplicate handling). */
  poolSize: number;
}

/** Cryptographically random integer in [0, max) without modulo bias. */
export function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const rng = globalThis.crypto;
  if (rng?.getRandomValues) {
    // Rejection sampling on 32 bits.
    const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
    const buf = new Uint32Array(1);
    do {
      rng.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

/** Seeded variant (mulberry32) for reproducible tests. */
function seededRandomInt(maxExclusive: number, seedRef: { value: number }): number {
  seedRef.value = (seedRef.value + 0x6d2b79f5) | 0;
  let t = Math.imul(seedRef.value ^ (seedRef.value >>> 15), 1 | seedRef.value);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.min(maxExclusive - 1, Math.floor(unit * maxExclusive));
}

/** Parse raw textarea input into clean names. */
export function parseNames(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((n) => n.trim().replace(/\s+/g, " "))
    .filter((n) => n.length > 0)
    .map((n) => n.slice(0, MAX_NAME_LENGTH))
    .slice(0, MAX_NAMES);
}

/**
 * Pick `count` names from the list.
 * With `allowDuplicates` the pool is untouched between draws (entries
 * keep their weight); otherwise winners are removed as they're drawn.
 */
export function pickNames(
  raw: string,
  count: number,
  options: PickerOptions = {}
): PickOutcome {
  const { allowDuplicates = false } = options;
  const names = parseNames(raw);
  const winners: string[] = [];

  const safeCount = Math.max(1, Math.min(Math.floor(count) || 1, MAX_WINNERS));
  const pool = [...names];
  const seedRef = { value: options.seed ?? 0 };

  const draws = allowDuplicates ? safeCount : Math.min(safeCount, pool.length);
  for (let i = 0; i < draws; i++) {
    const idx =
      options.seed !== undefined
        ? seededRandomInt(pool.length, seedRef)
        : randomInt(pool.length);
    winners.push(pool[idx]);
    if (!allowDuplicates) pool.splice(idx, 1);
  }

  return { winners, poolSize: names.length };
}

export function validatePickerInput(raw: string, count: number): string | null {
  const names = parseNames(raw);
  if (names.length === 0) return "Enter at least one name.";
  if (!Number.isFinite(count) || count < 1) return "Pick at least one winner.";
  if (count > MAX_WINNERS) return `Cannot pick more than ${MAX_WINNERS} winners.`;
  return null;
}
