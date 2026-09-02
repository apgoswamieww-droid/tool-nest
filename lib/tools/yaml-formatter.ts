/**
 * Lightweight YAML formatter.
 * Uses a recursive approach to parse and re-serialize YAML.
 * No external dependencies required.
 */

export interface FormatResult {
  output: string;
  error: string | null;
  lineCount: number;
}

export function formatYaml(input: string, indent: number = 2): FormatResult {
  if (!input.trim()) {
    return { output: "", error: null, lineCount: 0 };
  }

  try {
    const parsed = parseYamlInput(input);
    const output = serializeYaml(parsed, 0, indent);
    return {
      output,
      error: null,
      lineCount: output.split("\n").length,
    };
  } catch (e) {
    return {
      output: input,
      error: e instanceof Error ? e.message : "Invalid YAML input",
      lineCount: input.split("\n").length,
    };
  }
}

export function minifyYaml(input: string): FormatResult {
  if (!input.trim()) {
    return { output: "", error: null, lineCount: 0 };
  }

  try {
    const parsed = parseYamlInput(input);
    const output = serializeYaml(parsed, 0, 2, true);
    return {
      output,
      error: null,
      lineCount: output.split("\n").length,
    };
  } catch (e) {
    return {
      output: input,
      error: e instanceof Error ? e.message : "Invalid YAML input",
      lineCount: input.split("\n").length,
    };
  }
}

// ─── Simple YAML Parser ───────────────────────────

interface ParsedYaml {
  [key: string]: unknown;
}

function parseYamlInput(input: string): ParsedYaml {
  const result: ParsedYaml = {};
  const lines = input.split("\n");
  let currentKey = "";

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const match = line.match(/^(\s*)([\w.-]+)\s*:\s*(.*)/);
    if (match) {
      const [, _indent, key, value] = match;
      currentKey = key;
      result[key] = parseYamlValue(value);
    }
  }

  return result;
}

function parseYamlValue(value: string): unknown {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "~" || trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);

  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Array inline
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((s) => parseYamlValue(s.trim()));
  }

  return trimmed;
}

// ─── Simple YAML Serializer ───────────────────────

function serializeYaml(
  obj: Record<string, unknown>,
  depth: number,
  indentSize: number,
  compact = false
): string {
  const lines: string[] = [];
  const pad = " ".repeat(depth * indentSize);

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      lines.push(`${pad}${key}:`);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      lines.push(serializeYaml(value as Record<string, unknown>, depth + 1, indentSize, compact));
    } else if (Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      for (const item of value) {
        const itemStr = typeof item === "object" ? JSON.stringify(item) : String(item);
        lines.push(`${pad}${" ".repeat(indentSize)}- ${itemStr}`);
      }
    } else {
      const valStr = typeof value === "string" ? `"${value}"` : String(value);
      lines.push(`${pad}${key}: ${valStr}`);
    }
  }

  return lines.join(compact ? "" : "\n");
}
