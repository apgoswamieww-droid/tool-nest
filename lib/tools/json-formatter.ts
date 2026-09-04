/**
 * JSON Formatter — validate, beautify, and minify JSON.
 * Pure client-side logic: JSON.parse is the validator, so trailing
 * commas, comments, and single quotes are rejected with a position.
 */

export type JsonMode = "format" | "minify";
export type JsonIndent = 2 | 4 | "\t";

export interface JsonFormatOptions {
  mode: JsonMode;
  indent?: JsonIndent;
}

export type JsonFormatResult =
  | {
      ok: true;
      output: string;
      chars: number;
      lines: number;
      bytes: number;
    }
  | {
      ok: false;
      error: string;
      /** Best-effort 1-based location of the parse failure. */
      line: number | null;
      column: number | null;
    };

function extractPosition(message: string): { position: number | null; line: number | null; column: number | null } {
  // V8/Chrome: "Unexpected token } in JSON at position 12"
  const pos = /position\s+(\d+)/i.exec(message);
  if (pos) {
    return { position: Number(pos[1]), line: null, column: null };
  }
  // Some engines: "at line 1 column 5"
  const lc = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message);
  if (lc) {
    return { position: null, line: Number(lc[1]), column: Number(lc[2]) };
  }
  return { position: null, line: null, column: null };
}

/** Convert a 0-based character offset into 1-based line/column. */
function offsetToLineColumn(input: string, offset: number): { line: number; column: number } {
  const upTo = input.slice(0, Math.max(0, Math.min(offset, input.length)));
  const lines = upTo.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function cleanErrorMessage(message: string): string {
  return message.replace(/^JSON\.parse:\s*/i, "").replace(/\s*at (position|line).*$/i, "");
}

export function formatJson(input: string, options: JsonFormatOptions): JsonFormatResult {
  const mode = options.mode;
  const indent = options.indent ?? 2;

  if (!input.trim()) {
    return { ok: false, error: "Input is empty — paste some JSON to format.", line: null, column: null };
  }

  try {
    // Throws on invalid syntax (trailing commas, comments, single quotes…).
    const parsed: unknown = JSON.parse(input);
    const output =
      mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
    if (output === undefined) {
      return { ok: false, error: "Input is not serializable JSON.", line: null, column: null };
    }
    return {
      ok: true,
      output,
      chars: output.length,
      lines: output.split("\n").length,
      bytes: new TextEncoder().encode(output).length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const { position, line, column } = extractPosition(message);

    if (position !== null) {
      const loc = offsetToLineColumn(input, position);
      return {
        ok: false,
        error: `${cleanErrorMessage(message) || "Invalid JSON"} — at line ${loc.line}, column ${loc.column}.`,
        line: loc.line,
        column: loc.column,
      };
    }
    if (line !== null && column !== null) {
      return {
        ok: false,
        error: `${cleanErrorMessage(message) || "Invalid JSON"} — at line ${line}, column ${column}.`,
        line,
        column,
      };
    }
    return { ok: false, error: cleanErrorMessage(message) || "Invalid JSON.", line: null, column: null };
  }
}

/** A sample document shown on first load so the tool demos instantly. */
export const JSON_FORMATTER_SAMPLE = `{
  "name": "ToolNest",
  "tagline": "Free online tools",
  "tools": 50,
  "premium": true,
  "categories": ["text", "developer", "pdf", "calculators"],
  "urls": {
    "site": "https://toolnest.example",
    "status": "up"
  }
}`;
