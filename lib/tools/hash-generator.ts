/**
 * Hash Generator — MD5 and the SHA family from any text.
 *
 * - SHA-1/256/384/512 use WebCrypto (crypto.subtle) — native and fast.
 * - MD5 has no WebCrypto binding, so it is implemented here (RFC 1321).
 *   Verified against Node's `crypto` in the project smoke tests.
 *
 * Hashing is for checksums/fingerprints, not password storage — see
 * lib/password.ts for that.
 */

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";

export const HASH_ALGORITHMS: {
  id: HashAlgorithm;
  label: string;
  webcryptoName?: string;
}[] = [
  { id: "md5", label: "MD5" },
  { id: "sha1", label: "SHA-1", webcryptoName: "SHA-1" },
  { id: "sha256", label: "SHA-256", webcryptoName: "SHA-256" },
  { id: "sha384", label: "SHA-384", webcryptoName: "SHA-384" },
  { id: "sha512", label: "SHA-512", webcryptoName: "SHA-512" },
];

export type HashResults = Record<HashAlgorithm, string>;

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

// ── MD5 (RFC 1321) ───────────────────────────────────

function rotl(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0;
}

// Shift amounts per round (RFC 1321 table).
const MD5_S = new Uint8Array([
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]);

function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLength = bytes.length * 8;

  // Padded message: original bytes + 0x80 + zeros + 64-bit length (LE).
  const padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  // Length is < 2^53, so the high word is always zero for sane inputs.
  view.setUint32(padded.length - 8, bitLength >>> 0, true);
  view.setUint32(padded.length - 4, 0, true);

  // Per-round constants: floor(abs(sin(i + 1)) * 2^32).
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Uint32Array(16);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, MD5_S[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return toHex(out);
}

// ── Public API ───────────────────────────────────────

async function shaHex(input: string, webcryptoName: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("WebCrypto is not available in this browser.");
  const digest = await subtle.digest(webcryptoName, new TextEncoder().encode(input));
  return toHex(new Uint8Array(digest));
}

/** Hash `input` with one algorithm. Empty input yields "" (nothing to hash). */
export async function hashText(input: string, algorithm: HashAlgorithm): Promise<string> {
  if (!input) return "";
  if (algorithm === "md5") return md5Hex(input);
  const meta = HASH_ALGORITHMS.find((a) => a.id === algorithm);
  if (!meta?.webcryptoName) throw new Error(`Unsupported algorithm: ${algorithm}`);
  return shaHex(input, meta.webcryptoName);
}

/** Hash `input` with every supported algorithm. */
export async function hashTextAll(input: string): Promise<HashResults> {
  if (!input) {
    return { md5: "", sha1: "", sha256: "", sha384: "", sha512: "" };
  }
  const [md5, sha1, sha256, sha384, sha512] = await Promise.all([
    hashText(input, "md5"),
    hashText(input, "sha1"),
    hashText(input, "sha256"),
    hashText(input, "sha384"),
    hashText(input, "sha512"),
  ]);
  return { md5, sha1, sha256, sha384, sha512 };
}
