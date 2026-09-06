/**
 * Base64 Encoder/Decoder.
 * Unicode-safe: handles any text (emoji, CJK, accents) by round-tripping
 * through UTF-8 bytes, and reports clear errors for invalid input.
 */

/** Shared limits — client, validators, and future API must agree. */
export const MAX_INPUT_LENGTH = 100_000;

export interface Base64Result {
  output: string;
  ok: boolean;
  error?: string;
}

export function encodeBase64(text: string): Base64Result {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return { output: btoa(binary), ok: true };
  } catch {
    return { output: "", ok: false, error: "Could not encode this text." };
  }
}

export function decodeBase64(text: string): Base64Result {
  const trimmed = text.trim();
  if (!trimmed) return { output: "", ok: true };

  // Structural sanity check before attempting a decode.
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed) || trimmed.length % 4 !== 0) {
    return {
      output: "",
      ok: false,
      error: "Not valid Base64 — check for stray characters or missing padding.",
    };
  }

  try {
    const binary = atob(trimmed);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { output: decoded, ok: true };
  } catch {
    return {
      output: "",
      ok: false,
      error: "Not valid UTF-8 — this doesn't look like Base64 of text.",
    };
  }
}

export function validateBase64Input(text: string): string | null {
  if (text.length > MAX_INPUT_LENGTH) {
    return `Input must be under ${MAX_INPUT_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}
