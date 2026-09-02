/**
 * SQL Validator — validates SQL syntax and structure.
 * Client-side validation with detailed error reporting.
 * No server dependencies.
 */

export interface SqlValidationError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
  code: string;
}

export interface SqlValidationResult {
  isValid: boolean;
  errors: SqlValidationError[];
  warnings: SqlValidationError[];
  statements: SqlStatement[];
  lineCount: number;
}

export interface SqlStatement {
  type: string;
  startLine: number;
  endLine: number;
  raw: string;
}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "VIEW", "AND", "OR",
  "NOT", "IN", "LIKE", "BETWEEN", "IS", "NULL", "AS", "ON", "JOIN", "LEFT",
  "RIGHT", "INNER", "OUTER", "GROUP", "BY", "ORDER", "ASC", "DESC", "HAVING",
  "LIMIT", "OFFSET", "UNION", "ALL", "DISTINCT", "COUNT", "SUM", "AVG",
  "MIN", "MAX", "CASE", "WHEN", "THEN", "ELSE", "END", "EXISTS", "ANY",
  "SOME", "TOP", "FETCH", "NEXT", "ROWS", "ONLY", "WITH", "RECURSIVE",
  "GRANT", "REVOKE", "COMMIT", "ROLLBACK", "BEGIN", "TRANSACTION", "SAVEPOINT",
  "IF", "EXISTS", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "CONSTRAINT",
  "DEFAULT", "CHECK", "UNIQUE", "AUTO_INCREMENT", "SERIAL", "INT", "INTEGER",
  "BIGINT", "SMALLINT", "DECIMAL", "FLOAT", "DOUBLE", "VARCHAR", "CHAR",
  "TEXT", "BOOLEAN", "DATE", "TIMESTAMP", "DATETIME", "BLOB", "JSON",
];

const PAIRED_KEYWORDS: Record<string, string> = {
  SELECT: "FROM",
  INSERT: "VALUES",
  UPDATE: "SET",
  LEFT: "JOIN",
  RIGHT: "JOIN",
  INNER: "JOIN",
  GROUP: "BY",
  ORDER: "BY",
};

/**
 * Validate SQL input and return structured results.
 */
export function validateSql(input: string): SqlValidationResult {
  const errors: SqlValidationError[] = [];
  const warnings: SqlValidationError[] = [];
  const statements: SqlStatement[] = [];

  if (!input.trim()) {
    return {
      isValid: false,
      errors: [{ line: 1, column: 1, message: "Empty SQL input", severity: "error", code: "E001" }],
      warnings: [],
      statements: [],
      lineCount: 0,
    };
  }

  const lines = input.split("\n");
  const stripped = input.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  // Split into statements
  const stmts = stripped.split(";").filter((s) => s.trim());
  let currentLine = 1;

  for (const stmt of stmts) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;

    const firstWord = trimmed.split(/\s+/)[0]?.toUpperCase();
    const type = firstWord || "UNKNOWN";
    const startLine = currentLine;
    const endLine = currentLine + (stmt.split("\n").length - 1);

    statements.push({ type, startLine, endLine, raw: trimmed });
    currentLine = endLine + 1;

    // Validate common issues
    validateStatement(trimmed, type, startLine, errors, warnings);
  }

  // Check for unbalanced parentheses
  validateParentheses(input, errors);

  // Check for unbalanced quotes
  validateQuotes(input, errors);

  // Check for missing semicolons
  if (stmts.length > 0 && !input.trim().endsWith(";")) {
    warnings.push({
      line: lines.length,
      column: lines[lines.length - 1]?.length || 0,
      message: "SQL statements should end with a semicolon (;)",
      severity: "warning",
      code: "W001",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    statements,
    lineCount: lines.length,
  };
}

function validateStatement(
  stmt: string,
  type: string,
  line: number,
  errors: SqlValidationError[],
  warnings: SqlValidationError[]
) {
  const upper = stmt.toUpperCase();

  // SELECT without FROM
  if (type === "SELECT" && !upper.includes("FROM")) {
    if (!upper.match(/SELECT\s+(NOW|CURRENT_DATE|CURRENT_TIMESTAMP|1|VERSION)\b/)) {
      warnings.push({
        line,
        column: 1,
        message: "SELECT without FROM clause — did you forget the table?",
        severity: "warning",
        code: "W002",
      });
    }
  }

  // DELETE/UPDATE without WHERE
  if ((type === "DELETE" || type === "UPDATE") && !upper.includes("WHERE")) {
    warnings.push({
      line,
      column: 1,
      message: `${type} statement without WHERE clause — this will affect ALL rows`,
      severity: "warning",
      code: "W003",
    });
  }

  // DROP without IF EXISTS
  if (type === "DROP" && !upper.includes("IF EXISTS")) {
    warnings.push({
      line,
      column: 1,
      message: "DROP without IF EXISTS — statement will fail if object doesn't exist",
      severity: "info",
      code: "I001",
    });
  }

  // LIKE without wildcards
  const likeMatch = upper.match(/LIKE\s+'([^']*)'/);
  if (likeMatch && !likeMatch[1].includes("%") && !likeMatch[1].includes("_")) {
    warnings.push({
      line,
      column: 1,
      message: "LIKE without wildcards (%) — consider using = instead",
      severity: "info",
      code: "I002",
    });
  }

  // SELECT * warning
  if (upper.includes("SELECT *")) {
    warnings.push({
      line,
      column: upper.indexOf("SELECT *") + 1,
      message: "SELECT * is not recommended in production — specify columns explicitly",
      severity: "info",
      code: "I003",
    });
  }
}

function validateParentheses(input: string, errors: SqlValidationError[]) {
  let count = 0;
  let line = 1;
  let col = 0;

  for (const char of input) {
    col++;
    if (char === "\n") {
      line++;
      col = 0;
    }
    if (char === "(") count++;
    if (char === ")") count--;
    if (count < 0) {
      errors.push({
        line,
        column: col,
        message: "Unmatched closing parenthesis",
        severity: "error",
        code: "E002",
      });
      return;
    }
  }

  if (count > 0) {
    errors.push({
      line,
      column: col,
      message: `${count} unclosed parenthesis${count > 1 ? "es" : ""}`,
      severity: "error",
      code: "E003",
    });
  }
}

function validateQuotes(input: string, errors: SqlValidationError[]) {
  // Check for unmatched single quotes (ignoring escaped quotes)
  let inSingle = false;
  let inDouble = false;
  let line = 1;
  let col = 0;
  let startLine = 0;
  let startCol = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    col++;
    if (char === "\n") {
      line++;
      col = 0;
    }

    // Skip escaped quotes
    if (char === "\\" && i + 1 < input.length) {
      col++;
      i++;
      continue;
    }

    if (char === "'" && !inDouble) {
      if (!inSingle) {
        inSingle = true;
        startLine = line;
        startCol = col;
      } else {
        inSingle = false;
      }
    }

    if (char === '"' && !inSingle) {
      if (!inDouble) {
        inDouble = true;
        startLine = line;
        startCol = col;
      } else {
        inDouble = false;
      }
    }
  }

  if (inSingle) {
    errors.push({
      line: startLine,
      column: startCol,
      message: "Unterminated single-quoted string",
      severity: "error",
      code: "E004",
    });
  }

  if (inDouble) {
    errors.push({
      line: startLine,
      column: startCol,
      message: "Unterminated double-quoted identifier",
      severity: "error",
      code: "E005",
    });
  }
}

export function formatSql(input: string): string {
  const keywords = SQL_KEYWORDS;
  let result = input;

  // Add newlines before major keywords
  const majorKeywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "INSERT", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "ALTER", "DROP"];

  for (const kw of majorKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    result = result.replace(regex, `\n${kw}`);
  }

  // Clean up extra newlines
  result = result.replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n");

  // Capitalize keywords
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, "g");
    result = result.replace(regex, kw);
  }

  return result.trim();
}
