import { Tool } from "@/types";
import {
  FileText,
  FileOutput,
  Eraser,
  BookmarkMinus,
  Scissors,
  ArrowDownUp,
  QrCode,
} from "lucide-react";

/**
 * ═══════════════════════════════════════════════════
 * PDF TOOLS — Registry entries for Phase 4 PDF tools
 * These use the pdf-lib Web Worker architecture.
 * ═══════════════════════════════════════════════════
 */
export const PDF_TOOL_ENTRIES: Tool[] = [
  {
    slug: "csv-to-pdf",
    name: "CSV to PDF",
    description: "Convert CSV and spreadsheet data into formatted PDF documents.",
    longDescription:
      "Upload a CSV file and convert it to a clean, formatted PDF document. Choose font, page size, orientation, and margins. Supports custom delimiters and generates multi-page output for large datasets.",
    icon: FileOutput,
    category: "pdf-tools",
    tags: ["csv", "pdf", "convert", "spreadsheet", "data", "document"],
    relatedCategories: ["text-tools"],
    featured: true,
  },
  {
    slug: "pdf-metadata-remover",
    name: "PDF Metadata Remover",
    description: "Strip all metadata from PDF files for privacy and security.",
    longDescription:
      "Remove title, author, creator, producer, creation date, and all other metadata from PDF files. Essential for sharing documents privately without exposing authorship or editing history.",
    icon: Eraser,
    category: "pdf-tools",
    tags: ["pdf", "metadata", "remove", "privacy", "security", "clean", "strip"],
    featured: true,
  },
  {
    slug: "pdf-bookmark-remover",
    name: "Remove PDF Bookmarks",
    description: "Remove all bookmarks and outline tree from PDF documents.",
    longDescription:
      "Strip the bookmark/outline navigation from PDF files. Useful when sharing PDFs where internal navigation structure should not be visible, or when simplifying complex documents.",
    icon: BookmarkMinus,
    category: "pdf-tools",
    tags: ["pdf", "bookmarks", "outline", "remove", "navigation"],
  },
  {
    slug: "pdf-margin-remover",
    name: "Remove PDF Margins",
    description: "Crop or trim margins from PDF pages to save printing space.",
    longDescription:
      "Reduce the margins on PDF pages by setting custom crop areas. Useful for fitting more content on a page, reducing print costs, or preparing documents for specific layouts.",
    icon: Scissors,
    category: "pdf-tools",
    tags: ["pdf", "margins", "crop", "trim", "resize", "layout"],
  },
  {
    slug: "pdf-page-reverser",
    name: "Reverse PDF Pages",
    description: "Reverse the page order of a PDF or create custom page sequences.",
    longDescription:
      "Flip the page order of a PDF document — page 1 becomes the last page, and vice versa. Also supports custom page ordering for complex reorganization tasks.",
    icon: ArrowDownUp,
    category: "pdf-tools",
    tags: ["pdf", "reverse", "reorder", "pages", "flip", "sequence"],
  },
  {
    slug: "pdf-qr-code",
    name: "Add QR Code to PDF",
    description: "Overlay QR codes on PDF pages for branding, links, or tracking.",
    longDescription:
      "Embed QR codes onto your PDF pages at any position (corners or center). Useful for adding website links, contact information, or tracking codes to printed documents. Choose which pages receive the QR code.",
    icon: QrCode,
    category: "pdf-tools",
    tags: ["pdf", "qr", "code", "overlay", "branding", "link", "tracking"],
    relatedCategories: ["qr-barcode-tools"],
  },
];
