/**
 * HTML Entity and Special Character Decoder.
 * Converts HTML entities back to their original characters.
 */

export interface DecodeResult {
  decoded: string;
  entityCount: number;
  originalLength: number;
  decodedLength: number;
}

// Named HTML entities map (most common ones)
const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&euro;": "€",
  "&pound;": "£",
  "&yen;": "¥",
  "&cent;": "¢",
  "&deg;": "°",
  "&plusmn;": "±",
  "&micro;": "µ",
  "&para;": "¶",
  "&sect;": "§",
  "&frac14;": "¼",
  "&frac12;": "½",
  "&frac34;": "¾",
  "&times;": "×",
  "&divide;": "÷",
  "&ndash;": "–",
  "&mdash;": "—",
  "&lsquo;": "'",
  "&rsquo;": "'",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
  "&hellip;": "…",
  "&laquo;": "«",
  "&raquo;": "»",
  "&larr;": "←",
  "&rarr;": "→",
  "&uarr;": "↑",
  "&darr;": "↓",
  "&hearts;": "♥",
  "&diams;": "♦",
  "&clubs;": "♣",
  "&spades;": "♠",
};

/**
 * Decode HTML entities in a string.
 * Handles named entities (&amp;), numeric entities (&#123;),
 * and hex entities (&#x1F;).
 */
export function decodeHtml(input: string): DecodeResult {
  if (!input) {
    return { decoded: "", entityCount: 0, originalLength: 0, decodedLength: 0 };
  }

  let decoded = input;
  let entityCount = 0;

  // Count and replace named entities
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    const regex = new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = decoded.match(regex);
    if (matches) {
      entityCount += matches.length;
      decoded = decoded.replace(regex, char);
    }
  }

  // Replace numeric decimal entities (&#123;)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    entityCount++;
    try {
      const code = parseInt(num, 10);
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });

  // Replace hex entities (&#x1F;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    entityCount++;
    try {
      const code = parseInt(hex, 16);
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });

  return {
    decoded,
    entityCount,
    originalLength: input.length,
    decodedLength: decoded.length,
  };
}

/**
 * Decode a URL-encoded string.
 */
export function decodeUrlEncoded(input: string): DecodeResult {
  if (!input) {
    return { decoded: "", entityCount: 0, originalLength: 0, decodedLength: 0 };
  }

  try {
    const decoded = decodeURIComponent(input);
    const percentCount = (input.match(/%[0-9a-fA-F]{2}/gi) || []).length;

    return {
      decoded,
      entityCount: percentCount,
      originalLength: input.length,
      decodedLength: decoded.length,
    };
  } catch {
    return {
      decoded: input,
      entityCount: 0,
      originalLength: input.length,
      decodedLength: input.length,
    };
  }
}

/**
 * Decode both HTML entities and URL encoding.
 */
export function decodeAll(input: string): DecodeResult {
  const htmlResult = decodeHtml(input);
  const urlResult = decodeUrlEncoded(htmlResult.decoded);

  return {
    decoded: urlResult.decoded,
    entityCount: htmlResult.entityCount + urlResult.entityCount,
    originalLength: input.length,
    decodedLength: urlResult.decoded.length,
  };
}
