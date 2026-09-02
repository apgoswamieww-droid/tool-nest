/**
 * ═══════════════════════════════════════════════════
 * PDF PROCESSING ARCHITECTURE — Shared Types
 * Used by workers, operations, UI components, and tool pages.
 * ═══════════════════════════════════════════════════
 */

// ─── Worker Messages ───────────────────────────────

/** Messages sent FROM the main thread TO the worker */
export type WorkerRequest =
  | { type: "process"; operation: string; payload: unknown; id: string }
  | { type: "cancel"; id: string };

/** Messages sent FROM the worker TO the main thread */
export type WorkerResponse =
  | { type: "progress"; id: string; progress: number; message: string }
  | { type: "complete"; id: string; result: ProcessResult }
  | { type: "error"; id: string; error: string };

// ─── Processing Result ─────────────────────────────

export interface ProcessResult {
  success: boolean;
  data?: ArrayBuffer;
  fileName: string;
  mimeType: string;
  pageCount?: number;
  originalSize: number;
  outputSize: number;
  metadata?: Record<string, unknown>;
  error?: string;
}

// ─── File Validation ───────────────────────────────

export interface FileValidation {
  valid: boolean;
  error?: string;
  fileType?: string;
  pageCount?: number;
}

export interface PdfValidationOptions {
  maxSizeMB?: number; // default 100
  minPages?: number; // default 1
  maxPages?: number; // default 500
  allowEncrypted?: boolean; // default false
}

// ─── Progress Tracking ─────────────────────────────

export interface ProcessingState {
  status: "idle" | "reading" | "processing" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  error?: string;
}

// ─── Operation Payloads ────────────────────────────

export interface MetadataRemovalPayload {
  fileBuffer: ArrayBuffer;
}

export interface BookmarkRemovalPayload {
  fileBuffer: ArrayBuffer;
}

export interface MarginRemovalPayload {
  fileBuffer: ArrayBuffer;
  top: number; // points
  bottom: number;
  left: number;
  right: number;
}

export interface PageReversePayload {
  fileBuffer: ArrayBuffer;
  pageOrder?: number[]; // custom order, or undefined for full reverse
}

export interface CsvToPdfPayload {
  csvContent: string;
  options: {
    fontSize: number;
    fontFamily: "courier" | "helvetica" | "times";
    pageSize: "a4" | "letter";
    orientation: "portrait" | "landscape";
    margins: number;
    title?: string;
    delimiter: string;
  };
}

export interface QrCodePayload {
  fileBuffer: ArrayBuffer;
  qrData: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size: number; // points
  pageRange?: { start: number; end: number }; // 1-indexed, undefined = all pages
}

// ─── Operation Registry ────────────────────────────

export interface PdfOperation {
  name: string;
  label: string;
  description: string;
  needsFile: boolean;
  needsOptions: boolean;
  optionsComponent?: string; // for dynamic rendering
}
