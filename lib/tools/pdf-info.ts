/**
 * PDF Info Viewer — extracts metadata from PDF files client-side.
 * Uses a lightweight PDF header parser (no external libraries).
 */

export interface PdfInfo {
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  pdfVersion: string;
  pageCount: number | null;
  title: string | null;
  author: string | null;
  creator: string | null;
  producer: string | null;
  creationDate: string | null;
  modDate: string | null;
  isEncrypted: boolean;
  format: string;
}

export async function extractPdfInfo(file: File): Promise<PdfInfo> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const info: PdfInfo = {
    fileName: file.name,
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    pdfVersion: "Unknown",
    pageCount: null,
    title: null,
    author: null,
    creator: null,
    producer: null,
    creationDate: null,
    modDate: null,
    isEncrypted: false,
    format: "PDF",
  };

  // Check PDF header
  const header = String.fromCharCode(...data.slice(0, 8));
  if (!header.startsWith("%PDF")) {
    throw new Error("Not a valid PDF file");
  }

  info.pdfVersion = header.trim().replace("%", "");

  // Extract text content for metadata parsing
  const text = new TextDecoder("latin1").decode(data);

  // Count pages by finding /Type /Page entries (excluding /Type /Pages)
  const pageMatches = text.match(/\/Type\s*\/Page\b(?!s)/g);
  info.pageCount = pageMatches ? pageMatches.length : null;

  // Extract metadata
  info.title = extractMetaField(text, "Title");
  info.author = extractMetaField(text, "Author");
  info.creator = extractMetaField(text, "Creator");
  info.producer = extractMetaField(text, "Producer");
  info.creationDate = extractMetaField(text, "CreationDate");
  info.modDate = extractMetaField(text, "ModDate");

  // Check encryption
  info.isEncrypted = text.includes("/Encrypt");

  return info;
}

function extractMetaField(text: string, field: string): string | null {
  // Match both plain and hex-encoded metadata
  const regex = new RegExp(`/\\b${field}\\s*\\(([^)]+)\\)`, "i");
  const match = text.match(regex);
  if (match) return match[1].trim();

  // Try /Title <hex> format
  const hexRegex = new RegExp(`/\\b${field}\\s*<([0-9a-fA-F]+)>`, "i");
  const hexMatch = text.match(hexRegex);
  if (hexMatch) {
    try {
      const hex = hexMatch[1];
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str.trim();
    } catch {
      return null;
    }
  }

  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFile(file: File | null): string | null {
  if (!file) return "Please select a PDF file.";
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf"))
    return "File must be a PDF document.";
  if (file.size > 50 * 1024 * 1024)
    return "File size must be under 50 MB.";
  return null;
}
