/**
 * ═══════════════════════════════════════════════════
 * PDF FILE VALIDATORS
 * Validates file type, size, and basic PDF structure.
 * Runs on the main thread before handing off to workers.
 * ═══════════════════════════════════════════════════
 */

import { FileValidation, PdfValidationOptions } from "./types";

const DEFAULT_OPTIONS: Required<PdfValidationOptions> = {
  maxSizeMB: 100,
  minPages: 1,
  maxPages: 500,
  allowEncrypted: false,
};

/**
 * Validate a file is a valid PDF with correct structure.
 */
export async function validatePdfFile(
  file: File,
  options?: PdfValidationOptions
): Promise<FileValidation> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check file extension
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "File must be a PDF (.pdf)" };
  }

  // Check MIME type (allow common PDF MIME types)
  const validMimes = [
    "application/pdf",
    "application/x-pdf",
    "application/x-download",
  ];
  if (file.type && !validMimes.includes(file.type) && !file.type.includes("pdf")) {
    // Some browsers don't set MIME correctly; check header instead
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > opts.maxSizeMB) {
    return {
      valid: false,
      error: `File size (${sizeMB.toFixed(1)} MB) exceeds the ${opts.maxSizeMB} MB limit.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  // Read header to verify PDF structure
  try {
    const headerBuffer = await file.slice(0, 8).arrayBuffer();
    const header = new TextDecoder("latin1").decode(headerBuffer);

    if (!header.startsWith("%PDF")) {
      return { valid: false, error: "File does not appear to be a valid PDF." };
    }

    // Extract PDF version
    const version = header.trim().replace("%", "");

    // Count pages by scanning for /Type /Page entries
    const fullBuffer = await file.arrayBuffer();
    const fullText = new TextDecoder("latin1").decode(new Uint8Array(fullBuffer));

    const pageMatches = fullText.match(/\/Type\s*\/Page\b(?!s)/g);
    const pageCount = pageMatches ? pageMatches.length : 0;

    if (pageCount < opts.minPages) {
      return {
        valid: false,
        error: `PDF must have at least ${opts.minPages} page(s). Found ${pageCount}.`,
      };
    }

    if (pageCount > opts.maxPages) {
      return {
        valid: false,
        error: `PDF has ${pageCount} pages, exceeding the ${opts.maxPages} page limit.`,
      };
    }

    // Check encryption
    if (!opts.allowEncrypted && fullText.includes("/Encrypt")) {
      return {
        valid: false,
        error: "Encrypted PDFs are not supported. Please decrypt the file first.",
      };
    }

    return {
      valid: true,
      fileType: `PDF ${version}`,
      pageCount,
    };
  } catch {
    return { valid: false, error: "Unable to read the file. It may be corrupted." };
  }
}

/**
 * Validate a CSV file.
 */
export function validateCsvFile(file: File): FileValidation {
  const validExtensions = [".csv", ".tsv", ".txt"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

  if (!validExtensions.includes(ext)) {
    return { valid: false, error: "File must be a CSV, TSV, or TXT file." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be under 10 MB." };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty." };
  }

  return { valid: true, fileType: "CSV" };
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Estimate processing time based on file size and page count.
 */
export function estimateProcessingTime(sizeMB: number, pageCount: number): string {
  const baseTime = sizeMB * 0.5; // ~0.5 seconds per MB
  const pageTime = pageCount * 0.1; // ~0.1 seconds per page
  const total = Math.max(1, Math.ceil(baseTime + pageTime));

  if (total <= 3) return "a few seconds";
  if (total <= 10) return `${total} seconds`;
  return `${Math.ceil(total / 60)} minute(s)`;
}
