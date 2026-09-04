/**
 * PDF Merger — combines multiple PDF files into one.
 * Client-side implementation using pdf-lib.
 */

import { PDFDocument } from "pdf-lib";

export interface MergeResult {
  success: boolean;
  fileName: string;
  pageCount: number;
  fileSize: number;
  fileSizeFormatted: string;
  /** The merged PDF as a downloadable blob (present on success). */
  blob?: Blob;
  error?: string;
}

function failure(error: string): MergeResult {
  return {
    success: false,
    fileName: "",
    pageCount: 0,
    fileSize: 0,
    fileSizeFormatted: "",
    error,
  };
}

/**
 * Merge multiple PDF files into a single PDF.
 * Uses pdf-lib so the output is a valid PDF with correct cross-reference
 * tables, page counts, and object offsets (raw byte concatenation would
 * produce a corrupt file for most real-world PDFs).
 */
export async function mergePdfs(files: File[]): Promise<MergeResult> {
  if (files.length === 0) {
    return failure("No files provided");
  }

  try {
    if (files.length === 1) {
      // Single file — pass it through unchanged, just renamed.
      const file = files[0];
      return {
        success: true,
        fileName: file.name.replace(/\.pdf$/i, "") + "-merged.pdf",
        pageCount: await countPdfPages(file),
        fileSize: file.size,
        fileSizeFormatted: formatFileSize(file.size),
        blob: file, // File is a Blob
      };
    }

    // Multiple files — copy every page into a fresh document.
    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (const file of files) {
      try {
        const src = await PDFDocument.load(await file.arrayBuffer(), {
          ignoreEncryption: true,
        });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
        totalPages += pages.length;
      } catch {
        return failure(
          `"${file.name}" could not be read — it may be corrupted or password-protected.`
        );
      }
    }

    const bytes = await merged.save();
    // `.slice()` copies into a fresh ArrayBuffer — required for BlobPart typing.
    const blob = new Blob([bytes.slice()], { type: "application/pdf" });
    const firstName = files[0].name.replace(/\.pdf$/i, "");

    return {
      success: true,
      fileName: `${firstName}-merged.pdf`,
      pageCount: totalPages,
      fileSize: blob.size,
      fileSizeFormatted: formatFileSize(blob.size),
      blob,
    };
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to merge PDFs");
  }
}

async function countPdfPages(file: File): Promise<number> {
  try {
    const doc = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true,
    });
    return doc.getPageCount();
  } catch {
    // Fall back to a rough textual count for unusual PDFs.
    const text = new TextDecoder("latin1").decode(
      new Uint8Array(await file.arrayBuffer())
    );
    const matches = text.match(/\/Type\s*\/Page\b(?!s)/g);
    return matches ? matches.length : 0;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFiles(files: File[]): string | null {
  if (files.length === 0) return "Select at least one PDF file.";
  if (files.length > 10) return "Maximum 10 files at once.";
  for (const f of files) {
    if (!f.name.endsWith(".pdf") && f.type !== "application/pdf")
      return `${f.name} is not a PDF file.`;
    if (f.size > 50 * 1024 * 1024)
      return `${f.name} exceeds 50 MB limit.`;
  }
  return null;
}