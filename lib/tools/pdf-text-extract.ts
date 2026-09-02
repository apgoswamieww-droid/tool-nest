/**
 * PDF Text Extractor — extracts text content from PDF files.
 * Lightweight client-side extraction using PDF.js patterns.
 */

export interface ExtractionResult {
  text: string;
  wordCount: number;
  lineCount: number;
  charCount: number;
}

/**
 * Extract text from a PDF file.
 * Uses a simplified parser that finds text streams in the PDF.
 */
export async function extractPdfText(file: File): Promise<ExtractionResult> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const text = new TextDecoder("latin1").decode(data);

  // Validate PDF
  if (!text.startsWith("%PDF")) {
    throw new Error("Not a valid PDF file");
  }

  // Extract text between BT and ET markers (text objects in PDF)
  const extractedTexts: string[] = [];
  const btEtRegex = /BT[\s\S]*?ET/g;
  let match;

  while ((match = btEtRegex.exec(text)) !== null) {
    const textBlock = match[0];
    // Extract strings from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
      extractedTexts.push(tjMatch[1]);
    }

    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrayMatch;
    while ((tjArrayMatch = tjArrayRegex.exec(textBlock)) !== null) {
      const parts = tjArrayMatch[1].match(/\(([^)]*)\)/g);
      if (parts) {
        extractedTexts.push(
          parts.map((p) => p.slice(1, -1)).join("")
        );
      }
    }
  }

  const fullText = extractedTexts.join("\n").trim();

  // Calculate stats
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const lines = fullText.split("\n").filter((l) => l.trim().length > 0);

  return {
    text: fullText || "[No text content found — this may be a scanned/image PDF]",
    wordCount: words.length,
    lineCount: lines.length,
    charCount: fullText.length,
  };
}

export function validatePdfForExtraction(file: File | null): string | null {
  if (!file) return "Please select a PDF file.";
  if (!file.name.endsWith(".pdf") && file.type !== "application/pdf")
    return "File must be a PDF.";
  if (file.size > 50 * 1024 * 1024) return "File size must be under 50 MB.";
  return null;
}
