export interface RepeatOptions {
  text: string;
  count: number;
  separator: string;
  lineBreak: boolean;
}

export interface RepeatResult {
  output: string;
  charCount: number;
  lineCount: number;
}

const MAX_REPEAT = 10000;
const MAX_TEXT_LENGTH = 10000;

export function repeatText(options: RepeatOptions): RepeatResult {
  const { text, count, separator, lineBreak } = options;

  if (!text.trim()) {
    return { output: "", charCount: 0, lineCount: 0 };
  }

  const safeCount = Math.min(Math.max(1, Math.floor(count)), MAX_REPEAT);
  const safeText = text.slice(0, MAX_TEXT_LENGTH);
  const sep = lineBreak ? "\n" : separator;

  const parts: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    parts.push(safeText);
  }

  const output = parts.join(sep);
  const lineCount = lineBreak ? safeCount : output.split("\n").length;

  return {
    output,
    charCount: output.length,
    lineCount,
  };
}

export function validateRepeatInput(text: string, count: number): string | null {
  if (!text.trim()) return "Please enter some text to repeat.";
  if (text.length > MAX_TEXT_LENGTH) return `Text must be under ${MAX_TEXT_LENGTH} characters.`;
  if (count < 1) return "Count must be at least 1.";
  if (count > MAX_REPEAT) return `Count cannot exceed ${MAX_REPEAT}.`;
  return null;
}
