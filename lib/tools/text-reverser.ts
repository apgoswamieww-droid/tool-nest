/**
 * Text Reverser.
 * Reverses text character by character, word by word, or line by line.
 * Grapheme-aware: emoji and combined characters stay intact.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_TEXT_LENGTH = 100_000;

export type ReverseMode = "characters" | "words" | "lines";

export interface ReverseResult {
  output: string;
  charCount: number;
}

export function reverseText(text: string, mode: ReverseMode = "characters"): ReverseResult {
  if (!text) return { output: "", charCount: 0 };

  let output: string;
  switch (mode) {
    case "words":
      output = text.split(/(\s+)/).reverse().join("");
      break;
    case "lines":
      output = text.split("\n").reverse().join("\n");
      break;
    default: {
      // Grapheme segmentation keeps emoji / combined characters whole.
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      output = [...seg.segment(text)].map((s) => s.segment).reverse().join("");
    }
  }

  return { output, charCount: output.length };
}

export function validateReverseInput(text: string): string | null {
  if (text.length > MAX_TEXT_LENGTH) {
    return `Text must be under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}
