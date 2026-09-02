/**
 * ═══════════════════════════════════════════════════
 * PDF OPERATIONS — Core processing using pdf-lib
 * Returns Uint8Array from pdf-lib save().
 * ═══════════════════════════════════════════════════
 */

import { PDFDocument, rgb } from "pdf-lib";

// ─── Remove Metadata ───────────────────────────────

export async function removeMetadata(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));
  return pdfDoc.save();
}

// ─── Remove Bookmarks ──────────────────────────────

export async function removeBookmarks(fileBuffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  try {
    const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
    if (catalog && typeof catalog === "object" && "dict" in catalog) {
      const dict = (catalog as any).dict;
      if (dict) { dict.delete("Outlines"); dict.delete("PageLabels"); }
    }
  } catch { /* outline may not exist */ }
  return pdfDoc.save();
}

// ─── Remove Margins ────────────────────────────────

export async function removeMargins(
  fileBuffer: ArrayBuffer, top: number, bottom: number, left: number, right: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const nw = width - left - right;
    const nh = height - top - bottom;
    if (nw <= 0 || nh <= 0) throw new Error(`Margins too large for page (${width}×${height}pt)`);
    page.setCropBox(left, bottom, nw, nh);
  }
  return pdfDoc.save();
}

// ─── Reverse Pages ─────────────────────────────────

export async function reversePages(
  fileBuffer: ArrayBuffer, pageOrder?: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(fileBuffer);
  const srcPages = srcDoc.getPages();
  const total = srcPages.length;
  const order = pageOrder || Array.from({ length: total }, (_, i) => total - 1 - i);
  for (const idx of order) {
    if (idx < 0 || idx >= total) throw new Error(`Invalid page index: ${idx + 1}`);
  }
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, order);
  for (const page of copiedPages) newDoc.addPage(page);
  return newDoc.save();
}

// ─── CSV to PDF ────────────────────────────────────

export async function csvToPdf(
  csvContent: string,
  options: {
    fontSize: number;
    fontFamily: "courier" | "helvetica" | "times";
    pageSize: "a4" | "letter";
    orientation: "portrait" | "landscape";
    margins: number;
    title?: string;
    delimiter: string;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(
    options.fontFamily === "courier" ? "Courier"
    : options.fontFamily === "times" ? "TimesRoman" : "Helvetica"
  );

  const pw = options.pageSize === "a4"
    ? (options.orientation === "landscape" ? 842 : 595)
    : (options.orientation === "landscape" ? 792 : 612);
  const ph = options.pageSize === "a4"
    ? (options.orientation === "landscape" ? 595 : 842)
    : (options.orientation === "landscape" ? 612 : 792);

  const m = options.margins;
  const cw = pw - m * 2;
  const lh = options.fontSize * 1.4;

  const rows = csvContent.split("\n").filter((r) => r.trim());
  const parsedRows = rows.map((row) => {
    const cells: string[] = [];
    let cur = "";
    let iq = false;
    for (const ch of row) {
      if (ch === '"') iq = !iq;
      else if (ch === options.delimiter && !iq) { cells.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });

  if (!parsedRows.length) throw new Error("CSV is empty");
  const maxCols = Math.max(...parsedRows.map((r) => r.length));

  let page = pdfDoc.addPage([pw, ph]);
  let y = ph - m;

  if (options.title) {
    page.drawText(options.title, { x: m, y, size: options.fontSize + 4, font, color: rgb(0, 0, 0) });
    y -= lh * 2;
  }

  for (const row of parsedRows) {
    if (y < m + lh) { page = pdfDoc.addPage([pw, ph]); y = ph - m; }
    let x = m;
    for (let c = 0; c < maxCols; c++) {
      page.drawText((row[c] || "").slice(0, 80), { x, y, size: options.fontSize, font, color: rgb(0, 0, 0) });
      x += cw / maxCols;
    }
    y -= lh;
  }

  return pdfDoc.save();
}

// ─── Add QR Code ───────────────────────────────────

export async function addQrCodeToPdf(
  fileBuffer: ArrayBuffer, qrData: string,
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
  size: number, pageRange?: { start: number; end: number }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const qrImageBytes = await generateQrCodePng(size * 2);
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  const pages = pdfDoc.getPages();
  const si = pageRange ? Math.max(0, pageRange.start - 1) : 0;
  const ei = pageRange ? Math.min(pages.length, pageRange.end) : pages.length;

  for (let i = si; i < ei; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    let x: number, y: number;
    switch (position) {
      case "top-left": x = 20; y = height - size - 20; break;
      case "top-right": x = width - size - 20; y = height - size - 20; break;
      case "bottom-left": x = 20; y = 20; break;
      case "bottom-right": x = width - size - 20; y = 20; break;
      default: x = (width - size) / 2; y = (height - size) / 2;
    }
    page.drawImage(qrImage, { x, y, width: size, height: size });
  }
  return pdfDoc.save();
}

async function generateQrCodePng(size: number): Promise<Uint8Array> {
  if (typeof document === "undefined") return new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000000";
  const ms = size / 25;
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      const fp = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
      if (fp) {
        const b = r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
          (r >= 20 && r <= 22 && c >= 2 && c <= 4) ||
          (r < 7 && c > 17 && (c === 18 || c === 24)) ||
          (r > 17 && c < 7 && (r === 18 || r === 24));
        if (b) ctx.fillRect(c * ms, r * ms, ms, ms);
      } else if ((r + c) % 3 === 0) {
        ctx.fillRect(c * ms, r * ms, ms, ms);
      }
    }
  }
  return new Promise<Uint8Array>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      } else {
        resolve(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
      }
    }, "image/png");
  });
}
