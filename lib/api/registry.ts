// ──────────────────────────────────────────────────────
// ToolNest — API capability registry (docs/api-platform.md §3.1, §8)
//
// The API analog of lib/registry.ts: one capability = one endpoint =
// one thin call into a shared lib/tools function. The route factory
// (lib/api/route.ts) turns a capability into an App Router handler;
// the OpenAPI route derives its schema from the same zod input, so the
// contract cannot drift from behavior.
//
// Strictness rule (principle 2): the edge validates with the tool's
// REAL limits and answers 422 — it never clamps or coerces the way the
// lenient browser path may. Shared limit constants are exported from
// the tool modules so both surfaces read the same numbers.
// ──────────────────────────────────────────────────────

import { z } from "zod";
import { repeatText, MAX_REPEAT, MAX_TEXT_LENGTH } from "@/lib/tools/text-repeater";
import type { RepeatOptions, RepeatResult } from "@/lib/tools/text-repeater";
import {
  extractUrls,
  extractUniqueUrls,
} from "@/lib/tools/extract-urls";
import type { ExtractionResult } from "@/lib/tools/extract-urls";
import {
  decodeHtml,
  decodeUrlEncoded,
  decodeAll,
} from "@/lib/tools/html-decoder";
import type { DecodeResult } from "@/lib/tools/html-decoder";
import { validateSql } from "@/lib/tools/sql-validator";
import type { SqlValidationResult } from "@/lib/tools/sql-validator";
import {
  generateBarcode,
  BARCODE_PRESETS,
  MAX_BARCODE_DATA_LENGTH,
} from "@/lib/tools/barcode-generator";
import type { BarcodeResult } from "@/lib/tools/barcode-generator";

/** All v1 capabilities POST JSON bodies capped at 64 KB. */
export const MAX_BODY_BYTES = 64_000;
/** Long-text input cap for url/html/sql capabilities. */
const MAX_TEXT_CHARS = 64_000;
/** SVG size bound for barcodes (API edge; prevents pathological output). */
const MIN_BARCODE_SIZE = 50;
const MAX_BARCODE_SIZE = 2_000;
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

export interface ApiCapability<I = unknown, O = unknown> {
  /** Stable identifier, e.g. "text.repeat". Contract-frozen per version. */
  operationId: string;
  version: "v1";
  method: "POST";
  /** Full mount path, e.g. "/api/v1/text/repeat". */
  path: string;
  summary: string;
  /** Registry slug of the web tool this endpoint mirrors. */
  toolSlug: string;
  maxBodyBytes: number;
  /** Edge validation — encodes the tool's real limits (never clamps). */
  input: z.ZodType<I>;
  /** Thin call into lib/tools/*. No HTTP, no DB, no re-shaping. */
  run: (input: I) => O | Promise<O>;
}

// ── 8.1 POST /api/v1/text/repeat ─────────────────────

const MAX_MSG = `count must be between 1 and ${MAX_REPEAT}`;
const repeatSchema = z
  .object({
    text: z
      .string()
      .max(MAX_TEXT_LENGTH, `text must not exceed ${MAX_TEXT_LENGTH} characters`)
      .refine((s) => s.trim().length > 0, {
        message: "text must not be empty",
      }),
    count: z
      .number()
      .int("count must be an integer")
      .min(1, MAX_MSG)
      .max(MAX_REPEAT, MAX_MSG),
    separator: z.string().max(1_000).optional().default(""),
    lineBreak: z.boolean().optional().default(false),
  })
  .strict();

interface RepeatInput {
  text: string;
  count: number;
  separator: string;
  lineBreak: boolean;
}

const textRepeat: ApiCapability<RepeatInput, RepeatResult> = {
  operationId: "text.repeat",
  version: "v1",
  method: "POST",
  path: "/api/v1/text/repeat",
  summary: "Repeat a string N times, optionally separated or line-broken.",
  toolSlug: "text-repeater",
  maxBodyBytes: MAX_BODY_BYTES,
  input: repeatSchema,
  run: (input) => repeatText(input as RepeatOptions),
};

// ── 8.2 POST /api/v1/url/extract ─────────────────────

const urlExtractSchema = z
  .object({
    text: z.string().max(MAX_TEXT_CHARS),
    unique: z.boolean().optional().default(false),
  })
  .strict();

interface UrlExtractInput {
  text: string;
  unique: boolean;
}

const urlExtract: ApiCapability<UrlExtractInput, ExtractionResult> = {
  operationId: "url.extract",
  version: "v1",
  method: "POST",
  path: "/api/v1/url/extract",
  summary:
    "Extract and categorize http(s) URLs from text; unique:true deduplicates.",
  toolSlug: "extract-urls",
  maxBodyBytes: MAX_BODY_BYTES,
  input: urlExtractSchema,
  run: (input) => (input.unique ? extractUniqueUrls(input.text) : extractUrls(input.text)),
};

// ── 8.3 POST /api/v1/html/decode ─────────────────────

const htmlDecodeSchema = z
  .object({
    input: z.string().max(MAX_TEXT_CHARS),
    mode: z.enum(["html", "url", "all"]).optional().default("html"),
  })
  .strict();

interface HtmlDecodeInput {
  input: string;
  mode: "html" | "url" | "all";
}

const htmlDecode: ApiCapability<HtmlDecodeInput, DecodeResult> = {
  operationId: "html.decode",
  version: "v1",
  method: "POST",
  path: "/api/v1/html/decode",
  summary:
    "Decode HTML entities and/or URL-encoded text. mode: html | url | all.",
  toolSlug: "html-decoder",
  maxBodyBytes: MAX_BODY_BYTES,
  input: htmlDecodeSchema,
  run: (input) => {
    if (input.mode === "url") return decodeUrlEncoded(input.input);
    if (input.mode === "all") return decodeAll(input.input);
    return decodeHtml(input.input);
  },
};

// ── 8.4 POST /api/v1/sql/validate ────────────────────

const sqlValidateSchema = z.object({ query: z.string().max(MAX_TEXT_CHARS) }).strict();

interface SqlValidateInput {
  query: string;
}

const sqlValidate: ApiCapability<SqlValidateInput, SqlValidationResult> = {
  operationId: "sql.validate",
  version: "v1",
  method: "POST",
  path: "/api/v1/sql/validate",
  summary:
    "Validate SQL syntax and structure (lexical analysis only — never executed).",
  toolSlug: "sql-validator",
  maxBodyBytes: MAX_BODY_BYTES,
  input: sqlValidateSchema,
  run: (input) => validateSql(input.query),
};

// ── 8.5 POST /api/v1/barcode/code128 ─────────────────

const barcodeSchema = z
  .object({
    data: z
      .string()
      .min(1, "data must not be empty")
      .max(
        MAX_BARCODE_DATA_LENGTH,
        `data must not exceed ${MAX_BARCODE_DATA_LENGTH} characters`
      )
      .regex(/^[\x20-\x7E]+$/, "data must contain printable ASCII characters only"),
    width: z
      .number()
      .int("width must be an integer")
      .min(MIN_BARCODE_SIZE)
      .max(MAX_BARCODE_SIZE)
      .optional(),
    height: z
      .number()
      .int("height must be an integer")
      .min(MIN_BARCODE_SIZE)
      .max(MAX_BARCODE_SIZE)
      .optional(),
    showText: z.boolean().optional(),
    backgroundColor: z
      .string()
      .regex(HEX_COLOR, "backgroundColor must be a hex color like #ffffff")
      .optional(),
    barColor: z
      .string()
      .regex(HEX_COLOR, "barColor must be a hex color like #000000")
      .optional(),
    preset: z.enum(["label", "receipt", "large"]).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.preset && (val.width !== undefined || val.height !== undefined)) {
      ctx.addIssue({
        code: "custom",
        path: ["preset"],
        message: "preset cannot be combined with manual width/height",
      });
    }
  });

interface BarcodeInput {
  data: string;
  width?: number;
  height?: number;
  showText?: boolean;
  backgroundColor?: string;
  barColor?: string;
  preset?: "label" | "receipt" | "large";
}

const barcodeCode128: ApiCapability<BarcodeInput, BarcodeResult> = {
  operationId: "barcode.code128",
  version: "v1",
  method: "POST",
  path: "/api/v1/barcode/code128",
  summary: "Generate a Code128 barcode as an SVG string (format pinned by the path).",
  toolSlug: "barcode-generator",
  maxBodyBytes: MAX_BODY_BYTES,
  input: barcodeSchema,
  run: (input) => {
    // The shared module takes a flat BarcodeOptions; presets expand into
    // it (manual width/height were rejected alongside preset above).
    const preset = input.preset ? BARCODE_PRESETS[input.preset] : undefined;
    return generateBarcode({
      data: input.data,
      format: "code128",
      width: input.width ?? preset?.width ?? BARCODE_PRESETS.label.width,
      height: input.height ?? preset?.height ?? BARCODE_PRESETS.label.height,
      showText:
        input.showText ?? preset?.showText ?? BARCODE_PRESETS.label.showText,
      backgroundColor:
        input.backgroundColor ??
        preset?.backgroundColor ??
        BARCODE_PRESETS.label.backgroundColor,
      barColor: input.barColor ?? preset?.barColor ?? BARCODE_PRESETS.label.barColor,
    });
  },
};

// ── Registry ──────────────────────────────────────────

export const CAPABILITIES = {
  "text.repeat": textRepeat,
  "url.extract": urlExtract,
  "html.decode": htmlDecode,
  "sql.validate": sqlValidate,
  "barcode.code128": barcodeCode128,
} as const;

export type CapabilityId = keyof typeof CAPABILITIES;

export const CAPABILITY_LIST: ApiCapability<any, any>[] = Object.values(
  CAPABILITIES
);
