/**
 * Emoji and special character removal utilities.
 * Uses Unicode-aware regex patterns.
 */

export interface EmojiResult {
  cleaned: string;
  removedCount: number;
  originalLength: number;
  cleanedLength: number;
}

// Comprehensive emoji regex covering most Unicode emoji ranges
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}]/gu; // Emoticons
const EMOJI_REGEX_EXTENDED =
  /[\u{1F300}-\u{1F5FF}]/gu; // Misc Symbols and Pictographs
const EMOJI_REGEX_SYMBOLS =
  /[\u{1F680}-\u{1F6FF}]/gu; // Transport and Map Symbols
const EMOJI_REGEX_SUPPLEMENT =
  /[\u{1F1E0}-\u{1F1FF}]/gu; // Flags (Regional Indicators)
const EMOJI_REGEX_PICTOGRAPHS =
  /[\u{2600}-\u{26FF}]/gu; // Misc Symbols
const EMOJI_REGEX_DINGBATS =
  /[\u{2700}-\u{27BF}]/gu; // Dingbats
const EMOJI_REGEX_COMBINED =
  /[\u{1F900}-\u{1F9FF}]/gu; // Supplemental Symbols
const EMOJI_REGEX_MEDIUM =
  /[\u{1FA00}-\u{1FA6F}]/gu; // Chess Symbols
const EMOJI_REGEX_MEDIUM2 =
  /[\u{1FA70}-\u{1FAFF}]/gu; // Symbols Extended-A
const EMOJI_REGEX_VARIATION =
  /[\u{FE00}-\u{FE0F}]/gu; // Variation Selectors
const EMOJI_REGEX_ZWJ =
  /[\u{200D}]/gu; // Zero Width Joiner
const EMOJI_REGEX_KEYCAP =
  /[\u{20E3}]/gu; // Combining Enclosing Keycap
const EMOJI_REGEX_TAG =
  /[\u{E0020}-\u{E007F}]/gu; // Tag characters

const ALL_EMOJI_REGEX = new RegExp(
  [
    EMOJI_REGEX.source,
    EMOJI_REGEX_EXTENDED.source,
    EMOJI_REGEX_SYMBOLS.source,
    EMOJI_REGEX_SUPPLEMENT.source,
    EMOJI_REGEX_PICTOGRAPHS.source,
    EMOJI_REGEX_DINGBATS.source,
    EMOJI_REGEX_COMBINED.source,
    EMOJI_REGEX_MEDIUM.source,
    EMOJI_REGEX_MEDIUM2.source,
    EMOJI_REGEX_VARIATION.source,
    EMOJI_REGEX_ZWJ.source,
    EMOJI_REGEX_KEYCAP.source,
    EMOJI_REGEX_TAG.source,
  ].join("|"),
  "gu"
);

export function removeEmojis(input: string, options?: { keepSpaces?: boolean }): EmojiResult {
  const cleaned = input.replace(ALL_EMOJI_REGEX, "");
  const finalCleaned = options?.keepSpaces
    ? cleaned.replace(/\s{2,}/g, " ")
    : cleaned;

  return {
    cleaned: finalCleaned,
    removedCount: (input.match(ALL_EMOJI_REGEX) || []).length,
    originalLength: input.length,
    cleanedLength: finalCleaned.length,
  };
}

export function removeSpecialChars(input: string): EmojiResult {
  // Remove emojis + non-ASCII characters
  const cleaned = input.replace(/[^\x00-\x7F]/g, "");
  const removedCount = input.length - cleaned.length;

  return {
    cleaned,
    removedCount,
    originalLength: input.length,
    cleanedLength: cleaned.length,
  };
}

export function removeCustomPattern(input: string, pattern: string): EmojiResult {
  try {
    const regex = new RegExp(pattern, "gu");
    const cleaned = input.replace(regex, "");
    const removedCount = (input.match(regex) || []).length;

    return {
      cleaned,
      removedCount,
      originalLength: input.length,
      cleanedLength: cleaned.length,
    };
  } catch {
    return {
      cleaned: input,
      removedCount: 0,
      originalLength: input.length,
      cleanedLength: input.length,
    };
  }
}
