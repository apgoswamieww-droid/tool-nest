// ──────────────────────────────────────────────────────
// ToolNest — Lorem Ipsum Generator
// Pure, isomorphic logic (no DOM). Deterministic when a
// seed is provided — same seed + options → same output.
// ──────────────────────────────────────────────────────

/** Classic Lorem Ipsum words, ordered so a deterministic shuffle
 *  always starts with the traditional "Lorem ipsum dolor sit amet". */
export const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
  "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
  "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat",
  "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
  "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum",
] as const;

/** Shared with the client and any future API capability — never diverge. */
export const MAX_PARAGRAPHS = 50;
export const MAX_SENTENCES = 10;
export const MAX_WORDS = 500;
export const MIN_WORDS_PER_SENTENCE = 4;
export const MAX_WORDS_PER_SENTENCE = 18;

export type LoremMode = "paragraphs" | "sentences" | "words";

export interface LoremOptions {
  mode: LoremMode;
  count: number;
  startWithLorem?: boolean;
  seed?: number;
}

export interface LoremResult {
  output: string;
  paragraphCount: number;
  sentenceCount: number;
  wordCount: number;
  charCount: number;
}

/** Mulberry32 — tiny, fast, deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle driven by the PRNG. */
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice() as T[];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const x = out[i];
    out[i] = out[j];
    out[j] = x;
  }
  return out;
}

function clampCount(count: number, max: number): number {
  const n = Math.floor(Number(count));
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, n), max);
}

function makeSentence(words: string[], rng: () => number): string {
  const len =
    MIN_WORDS_PER_SENTENCE +
    Math.floor(rng() * (MAX_WORDS_PER_SENTENCE - MIN_WORDS_PER_SENTENCE + 1));
  const parts: string[] = [];
  for (let i = 0; i < len; i++) {
    parts.push(words[Math.floor(rng() * words.length)]);
  }
  const sentence = parts.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/** The traditional opening, guaranteed to lead the text when requested. */
function makeOpeningSentence(words: string[], rng: () => number): string {
  const opening = ["Lorem", "ipsum", "dolor", "sit", "amet"];
  const extra = Math.max(
    0,
    MIN_WORDS_PER_SENTENCE + 1 - opening.length + Math.floor(rng() * 6)
  );
  const parts = [...opening];
  for (let i = 0; i < extra; i++) {
    parts.push(words[Math.floor(rng() * words.length)]);
  }
  return parts.join(" ") + ".";
}

function makeParagraph(
  words: string[],
  rng: () => number,
  sentences: number,
  withOpening = false
): string {
  const parts: string[] = [];
  for (let i = 0; i < sentences; i++) {
    if (withOpening && i === 0) {
      parts.push(makeOpeningSentence(words, rng));
    } else {
      parts.push(makeSentence(words, rng));
    }
  }
  return parts.join(" ");
}

/**
 * Generate Lorem Ipsum text.
 *
 * - `paragraphs`: `count` paragraphs of 3–7 sentences each.
 * - `sentences`:  exactly `count` sentences in one block.
 * - `words`:      exactly `count` words in one block.
 *
 * With `seed`, output is fully deterministic (useful for tests);
 * without it, each call is fresh randomness.
 */
export function generateLorem(options: LoremOptions): LoremResult {
  const { mode, startWithLorem = true } = options;
  const rng = mulberry32(options.seed ?? ((Math.random() * 0xffffffff) >>> 0));

  const pool = shuffle(LOREM_WORDS, rng);
  const words = pool.map((w) => w[0] + w.slice(1));

  const paragraphs: string[] = [];

  if (mode === "paragraphs") {
    const n = clampCount(options.count, MAX_PARAGRAPHS);
    for (let i = 0; i < n; i++) {
      const sentences = 3 + Math.floor(rng() * 5); // 3–7 per paragraph
      paragraphs.push(makeParagraph(words, rng, sentences, startWithLorem && i === 0));
    }
  } else if (mode === "sentences") {
    const n = clampCount(options.count, MAX_SENTENCES);
    paragraphs.push(makeParagraph(words, rng, n, startWithLorem));
  } else {
    const n = clampCount(options.count, MAX_WORDS);
    const parts: string[] = startWithLorem
      ? ["Lorem", "ipsum", "dolor", "sit", "amet"]
      : [];
    while (parts.length < n) {
      parts.push(words[Math.floor(rng() * words.length)]);
    }
    const text = parts.slice(0, n).join(" ");
    paragraphs.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  const output = paragraphs.join("\n\n");
  const sentenceCount = output.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  return {
    output,
    paragraphCount: paragraphs.length,
    sentenceCount,
    wordCount: output.split(/\s+/).filter(Boolean).length,
    charCount: output.length,
  };
}

export function validateLoremInput(mode: LoremMode, count: number): string | null {
  const limits: Record<LoremMode, number> = {
    paragraphs: MAX_PARAGRAPHS,
    sentences: MAX_SENTENCES,
    words: MAX_WORDS,
  };
  if (!Number.isFinite(count) || Math.floor(count) < 1) {
    return "Count must be at least 1.";
  }
  if (Math.floor(count) > limits[mode]) {
    return `Count cannot exceed ${limits[mode]} for ${mode} mode.`;
  }
  return null;
}
