/**
 * ═══════════════════════════════════════════════════
 * PDF PROCESSING WEB WORKER
 * Uses inline code with dynamic pdf-lib import.
 * ═══════════════════════════════════════════════════
 */

// This file serves as the source for the inline worker code.
// The actual worker is created via Blob URL in use-pdf-worker.ts.

interface WorkerMessage {
  type: string;
  id: string;
  operation: string;
  payload: any;
}

// The worker logic is inlined in use-pdf-worker.ts
// This file is kept for reference and future extraction

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, operation, payload } = event.data;
  if (type !== "process") return;

  try {
    const { PDFDocument, rgb } = await import("pdf-lib");

    function send(msg: any) { (self as any).postMessage(msg); }
    function sendProgress(rid: string, progress: number, message: string) {
      send({ type: "progress", id: rid, progress, message });
    }
    function sendComplete(rid: string, result: any) {
      send({ type: "complete", id: rid, result });
    }
    function sendError(rid: string, error: string) {
      send({ type: "error", id: rid, error });
    }

    switch (operation) {
      case "remove-metadata": {
        sendProgress(id, 10, "Loading PDF…");
        const pdfDoc = await PDFDocument.load(payload.fileBuffer);
        sendProgress(id, 40, "Clearing metadata…");
        pdfDoc.setTitle(""); pdfDoc.setAuthor(""); pdfDoc.setSubject("");
        pdfDoc.setKeywords([]); pdfDoc.setProducer(""); pdfDoc.setCreator("");
        pdfDoc.setCreationDate(new Date(0)); pdfDoc.setModificationDate(new Date(0));
        sendProgress(id, 80, "Saving…");
        const result = await pdfDoc.save();
        sendComplete(id, { success: true, data: result, fileName: payload.fileName || "cleaned.pdf", mimeType: "application/pdf", pageCount: pdfDoc.getPageCount(), originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
        break;
      }
      case "remove-bookmarks": {
        sendProgress(id, 10, "Loading PDF…");
        const pdfDoc = await PDFDocument.load(payload.fileBuffer);
        sendProgress(id, 50, "Removing bookmarks…");
        try {
          const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
          if (catalog && (catalog as any).dict) {
            (catalog as any).dict.delete("Outlines");
            (catalog as any).dict.delete("PageLabels");
          }
        } catch (e) { /* ok */ }
        sendProgress(id, 80, "Saving…");
        const result = await pdfDoc.save();
        sendComplete(id, { success: true, data: result, fileName: payload.fileName || "no-bookmarks.pdf", mimeType: "application/pdf", pageCount: pdfDoc.getPageCount(), originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
        break;
      }
      case "remove-margins": {
        sendProgress(id, 10, "Loading PDF…");
        const pdfDoc = await PDFDocument.load(payload.fileBuffer);
        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length; i++) {
          sendProgress(id, 10 + 70 * i / pages.length, "Page " + (i + 1) + "/" + pages.length);
          const { width, height } = pages[i].getSize();
          const nw = width - payload.left - payload.right;
          const nh = height - payload.top - payload.bottom;
          if (nw <= 0 || nh <= 0) { sendError(id, "Margins too large for page " + (i + 1)); return; }
          pages[i].setCropBox(payload.left, payload.bottom, nw, nh);
        }
        sendProgress(id, 90, "Saving…");
        const result = await pdfDoc.save();
        sendComplete(id, { success: true, data: result, fileName: payload.fileName || "trimmed.pdf", mimeType: "application/pdf", pageCount: pages.length, originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
        break;
      }
      case "reverse-pages": {
        sendProgress(id, 10, "Loading PDF…");
        const srcDoc = await PDFDocument.load(payload.fileBuffer);
        const srcPages = srcDoc.getPages();
        const total = srcPages.length;
        const order = payload.pageOrder || Array.from({ length: total }, (_: any, i: number) => total - 1 - i);
        sendProgress(id, 40, "Reversing " + total + " pages…");
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, order);
        for (const p of copiedPages) newDoc.addPage(p);
        sendProgress(id, 80, "Saving…");
        const result = await newDoc.save();
        sendComplete(id, { success: true, data: result, fileName: payload.fileName || "reversed.pdf", mimeType: "application/pdf", pageCount: total, originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
        break;
      }
      case "csv-to-pdf": {
        sendProgress(id, 10, "Creating PDF…");
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(payload.options.fontFamily === "courier" ? "Courier" : payload.options.fontFamily === "times" ? "TimesRoman" : "Helvetica");
        const pw = payload.options.pageSize === "a4" ? (payload.options.orientation === "landscape" ? 842 : 595) : (payload.options.orientation === "landscape" ? 792 : 612);
        const ph = payload.options.pageSize === "a4" ? (payload.options.orientation === "landscape" ? 595 : 842) : (payload.options.orientation === "landscape" ? 612 : 792);
        const m = payload.options.margins;
        const cw = pw - m * 2;
        const lh = payload.options.fontSize * 1.4;
        const rows = payload.csvContent.split("\n").filter((r: string) => r.trim());
        const parsed = rows.map((row: string) => { const cells: string[] = []; let cur = ""; let iq = false; for (const ch of row) { if (ch === '"') { iq = !iq; } else if (ch === payload.options.delimiter && !iq) { cells.push(cur.trim()); cur = ""; } else { cur += ch; } } cells.push(cur.trim()); return cells; });
        if (!parsed.length) { sendError(id, "CSV is empty"); return; }
        const maxCols = Math.max(...parsed.map((r: string[]) => r.length));
        let page = pdfDoc.addPage([pw, ph]); let y = ph - m;
        if (payload.options.title) { page.drawText(payload.options.title, { x: m, y, size: payload.options.fontSize + 4, font, color: rgb(0, 0, 0) }); y -= lh * 2; }
        for (let r = 0; r < parsed.length; r++) {
          if (r % 50 === 0) sendProgress(id, 30 + 60 * r / parsed.length, "Row " + (r + 1) + "/" + parsed.length);
          if (y < m + lh) { page = pdfDoc.addPage([pw, ph]); y = ph - m; }
          let x = m;
          for (let c = 0; c < maxCols; c++) { page.drawText((parsed[r][c] || "").slice(0, 80), { x, y, size: payload.options.fontSize, font, color: rgb(0, 0, 0) }); x += cw / maxCols; }
          y -= lh;
        }
        sendProgress(id, 95, "Saving…");
        const result = await pdfDoc.save();
        sendComplete(id, { success: true, data: result, fileName: (payload.options.title || "data").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + ".pdf", mimeType: "application/pdf", pageCount: pdfDoc.getPageCount(), originalSize: payload.csvContent.length, outputSize: result.byteLength });
        break;
      }
      case "add-qr-code": {
        sendProgress(id, 10, "Loading PDF…");
        const pdfDoc = await PDFDocument.load(payload.fileBuffer);
        sendProgress(id, 30, "Creating QR image…");
        // Generate QR placeholder
        const sz = payload.size * 2;
        let qrBytes: Uint8Array;
        if (typeof OffscreenCanvas !== "undefined") {
          const c = new OffscreenCanvas(sz, sz);
          const ctx = c.getContext("2d")!;
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, sz, sz); ctx.fillStyle = "#000";
          const ms = sz / 25;
          for (let r = 0; r < 25; r++) for (let col = 0; col < 25; col++) {
            const fp = (r < 7 && col < 7) || (r < 7 && col > 17) || (r > 17 && col < 7);
            if (fp) { const b = r === 0 || r === 6 || col === 0 || col === 6 || (r >= 2 && r <= 4 && col >= 2 && col <= 4) || (r >= 2 && r <= 4 && col >= 20 && col <= 22) || (r >= 20 && r <= 22 && col >= 2 && col <= 4) || (r < 7 && col > 17 && (col === 18 || col === 24)) || (r > 17 && col < 7 && (r === 18 || r === 24)); if (b) ctx.fillRect(col * ms, r * ms, ms, ms); }
            else if ((r + col) % 3 === 0) ctx.fillRect(col * ms, r * ms, ms, ms);
          }
          const blob = await c.convertToBlob({ type: "image/png" });
          qrBytes = new Uint8Array(await blob.arrayBuffer());
        } else {
          qrBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        }
        const qrImg = await pdfDoc.embedPng(qrBytes);
        sendProgress(id, 50, "Placing QR codes…");
        const pages = pdfDoc.getPages();
        const si = payload.pageRange ? Math.max(0, payload.pageRange.start - 1) : 0;
        const ei = payload.pageRange ? Math.min(pages.length, payload.pageRange.end) : pages.length;
        for (let i = si; i < ei; i++) {
          const pg = pages[i]; const { width: w, height: h } = pg.getSize();
          let x: number, y: number;
          switch (payload.position) {
            case "top-left": x = 20; y = h - payload.size - 20; break;
            case "top-right": x = w - payload.size - 20; y = h - payload.size - 20; break;
            case "bottom-left": x = 20; y = 20; break;
            case "bottom-right": x = w - payload.size - 20; y = 20; break;
            default: x = (w - payload.size) / 2; y = (h - payload.size) / 2;
          }
          pg.drawImage(qrImg, { x, y, width: payload.size, height: payload.size });
        }
        sendProgress(id, 90, "Saving…");
        const result = await pdfDoc.save();
        sendComplete(id, { success: true, data: result, fileName: payload.fileName || "qr-added.pdf", mimeType: "application/pdf", pageCount: pdfDoc.getPageCount(), originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
        break;
      }
      default:
        sendError(id, "Unknown operation: " + operation);
    }
  } catch (err: any) {
    const { id: rid } = event.data;
    (self as any).postMessage({ type: "error", id: rid, error: err.message || "Processing failed" });
  }
};
