/**
 * Case Converter.
 * Converts text between UPPER, lower, Title, Sentence, camelCase,
 * PascalCase, snake_case, kebab-case, and aLtErNaTiNg case.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_TEXT_LENGTH = 100_000;

export type CaseMode =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "alternating";

export const CASE_MODES: { key: CaseMode; label: string }[] = [
  { key: "upper", label: "UPPER CASE" },
  { key: "lower", label: "lower case" },
  { key: "title", label: "Title Case" },
  { key: "sentence", label: "Sentence case" },
  { key: "camel", label: "camelCase" },
  { key: "pascal", label: "PascalCase" },
  { key: "snake", label: "snake_case" },
  { key: "kebab", label: "kebab-case" },
  { key: "alternating", label: "aLtErNaTe" },
];

export interface CaseResult {
  output: string;
  charCount: number;
}

/** Split text into alphanumeric words across camelCase and separators. */
function toWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

export function convertCase(text: string, mode: CaseMode): CaseResult {
  if (!text) return { output: "", charCount: 0 };

  let output: string;
  switch (mode) {
    case "upper":
      output = text.toUpperCase();
      break;
    case "lower":
      output = text.toLowerCase();
      break;
    case "title":
      output = text.replace(/\p{L}[\p{L}\p{M}'’]*/gu, (w) =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );
      break;
    case "sentence": {
      const lower = text.toLowerCase();
      output = lower.replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, (m) => m.toUpperCase());
      break;
    }
    case "camel":
    case "pascal": {
      const words = toWords(text).map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );
      const joined = words.join("");
      output = mode === "camel" ? joined.charAt(0).toLowerCase() + joined.slice(1) : joined;
      break;
    }
    case "snake":
      output = toWords(text).map((w) => w.toLowerCase()).join("_");
      break;
    case "kebab":
      output = toWords(text).map((w) => w.toLowerCase()).join("-");
      break;
    case "alternating": {
      let i = 0;
      output = [...text]
        .map((ch) => (/\p{L}/u.test(ch) ? (i++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()) : ch))
        .join("");
      break;
    }
  }

  return { output, charCount: output.length };
}

export function validateCaseInput(text: string): string | null {
  if (text.length > MAX_TEXT_LENGTH) {
    return `Text must be under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}
