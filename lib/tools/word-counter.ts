/**
 * Word Counter.
 * Counts words, characters, sentences, paragraphs, and reading time.
 * Pure and isomorphic — shared by the website and any future API capability.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_TEXT_LENGTH = 500_000;

export interface WordCountResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  /** Minutes at 200 wpm (average adult silent reading). */
  readingTimeMinutes: number;
  /** Longest words, longest first — handy quick insight. */
  topWords: { word: string; count: number }[];
}

export function countWords(text: string): WordCountResult {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const wordList = text.split(/\s+/).filter(Boolean);
  const words = wordList.length;

  // Sentences: split on ., !, ?, … followed by whitespace/end.
  const sentences = text
    .split(/[.!?…]+[\s]|[.!?…]+$/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  // Paragraphs: blocks separated by blank lines.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  const readingTimeMinutes = words > 0 ? Math.max(1, Math.round(words / 200)) : 0;

  // Frequency count, normalized to lowercase, ignoring pure punctuation.
  const freq = new Map<string, number>();
  for (const raw of wordList) {
    const word = raw.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
    if (!word) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  const topWords = [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    topWords,
  };
}

export function validateCountInput(text: string): string | null {
  if (text.length > MAX_TEXT_LENGTH) {
    return `Text must be under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}
