"use client";

/**
 * ═══════════════════════════════════════════════════
 * usePdfWorker — React hook for PDF Web Worker
 * Manages worker lifecycle, message passing, and state.
 * ═══════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ProcessResult, ProcessingState } from "./types";
import { useAnalytics } from "@/components/tool/AnalyticsProvider";
import { analytics } from "@/lib/analytics";

let workerInstance: Worker | null = null;
let requestCounter = 0;

function getWorker(): Worker {
  if (workerInstance) return workerInstance;

  // Create worker from inline blob for Next.js compatibility
  // This avoids issues with worker file paths in bundlers
  const workerCode = `
    // Inline the worker logic — in production, this would be a bundled worker file
    // For now, we use dynamic import inside the worker
    self.onmessage = async function(event) {
      const { type, id, operation, payload } = event.data;
      if (type !== 'process') return;

      try {
        // Dynamic import of pdf-lib inside the worker
        const pdfLibModule = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
        const { PDFDocument, rgb } = pdfLibModule;

        function send(msg) { self.postMessage(msg); }
        function sendProgress(id, progress, message) { send({ type: 'progress', id, progress, message }); }
        function sendComplete(id, result) { send({ type: 'complete', id, result }); }
        function sendError(id, error) { send({ type: 'error', id, error }); }

        switch (operation) {
          case 'remove-metadata': {
            sendProgress(id, 10, 'Loading PDF…');
            const pdfDoc = await PDFDocument.load(payload.fileBuffer);
            sendProgress(id, 40, 'Clearing metadata…');
            pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject('');
            pdfDoc.setKeywords([]); pdfDoc.setProducer(''); pdfDoc.setCreator('');
            pdfDoc.setCreationDate(new Date(0)); pdfDoc.setModificationDate(new Date(0));
            sendProgress(id, 80, 'Saving…');
            const result = await pdfDoc.save();
            sendComplete(id, { success: true, data: result, fileName: payload.fileName || 'cleaned.pdf', mimeType: 'application/pdf', pageCount: pdfDoc.getPageCount(), originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
            break;
          }
          case 'remove-bookmarks': {
            sendProgress(id, 10, 'Loading PDF…');
            const pdfDoc = await PDFDocument.load(payload.fileBuffer);
            sendProgress(id, 50, 'Removing bookmarks…');
            try {
              const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
              if (catalog && catalog.dict) { catalog.dict.delete('Outlines'); catalog.dict.delete('PageLabels'); }
            } catch(e) {}
            sendProgress(id, 80, 'Saving…');
            const result = await pdfDoc.save();
            sendComplete(id, { success: true, data: result, fileName: payload.fileName || 'no-bookmarks.pdf', mimeType: 'application/pdf', pageCount: pdfDoc.getPageCount(), originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
            break;
          }
          case 'remove-margins': {
            sendProgress(id, 10, 'Loading PDF…');
            const pdfDoc = await PDFDocument.load(payload.fileBuffer);
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
              sendProgress(id, 10 + 70 * i / pages.length, 'Page ' + (i+1) + '/' + pages.length);
              const { width, height } = pages[i].getSize();
              const nw = width - payload.left - payload.right;
              const nh = height - payload.top - payload.bottom;
              if (nw <= 0 || nh <= 0) { sendError(id, 'Margins too large for page ' + (i+1)); return; }
              pages[i].setCropBox(payload.left, payload.bottom, nw, nh);
            }
            sendProgress(id, 90, 'Saving…');
            const result = await pdfDoc.save();
            sendComplete(id, { success: true, data: result, fileName: payload.fileName || 'trimmed.pdf', mimeType: 'application/pdf', pageCount: pages.length, originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
            break;
          }
          case 'reverse-pages': {
            sendProgress(id, 10, 'Loading PDF…');
            const srcDoc = await PDFDocument.load(payload.fileBuffer);
            const srcPages = srcDoc.getPages();
            const total = srcPages.length;
            const order = payload.pageOrder || Array.from({length:total},(_,i)=>total-1-i);
            sendProgress(id, 40, 'Reversing ' + total + ' pages…');
            const newDoc = await PDFDocument.create();
            const copied = await newDoc.copyPages(srcPages, order);
            for (const p of copied) newDoc.addPage(p);
            sendProgress(id, 80, 'Saving…');
            const result = await newDoc.save();
            sendComplete(id, { success: true, data: result, fileName: payload.fileName || 'reversed.pdf', mimeType: 'application/pdf', pageCount: total, originalSize: payload.fileBuffer.byteLength, outputSize: result.byteLength });
            break;
          }
          case 'csv-to-pdf': {
            sendProgress(id, 10, 'Creating PDF…');
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(payload.options.fontFamily === 'courier' ? 'Courier' : payload.options.fontFamily === 'times' ? 'TimesRoman' : 'Helvetica');
            const pw = payload.options.pageSize === 'a4' ? (payload.options.orientation === 'landscape' ? 842 : 595) : (payload.options.orientation === 'landscape' ? 792 : 612);
            const ph = payload.options.pageSize === 'a4' ? (payload.options.orientation === 'landscape' ? 595 : 842) : (payload.options.orientation === 'landscape' ? 612 : 792);
            const m = payload.options.margins;
            const cw = pw - m * 2;
            const lh = payload.options.fontSize * 1.4;
            const rows = payload.csvContent.split('\\n').filter(r => r.trim());
            const parsed = rows.map(row => { const cells=[];let cur='';let iq=false; for(const ch of row){if(ch==='"'){iq=!iq}else if(ch===payload.options.delimiter&&!iq){cells.push(cur.trim());cur=''}else{cur+=ch}} cells.push(cur.trim()); return cells; });
            if(!parsed.length){sendError(id,'CSV is empty');return;}
            const maxCols = Math.max(...parsed.map(r=>r.length));
            let page = pdfDoc.addPage([pw,ph]); let y = ph - m;
            if(payload.options.title){page.drawText(payload.options.title,{x:m,y,size:payload.options.fontSize+4,font,color:rgb(0,0,0)});y-=lh*2;}
            for(let r=0;r<parsed.length;r++){
              if(r%50===0) sendProgress(id,30+60*r/parsed.length,'Row '+(r+1)+'/'+parsed.length);
              if(y<m+lh){page=pdfDoc.addPage([pw,ph]);y=ph-m;}
              let x=m;
              for(let c=0;c<maxCols;c++){page.drawText((parsed[r][c]||'').slice(0,80),{x,y,size:payload.options.fontSize,font,color:rgb(0,0,0)});x+=cw/maxCols;}
              y-=lh;
            }
            sendProgress(id,95,'Saving…');
            const result = await pdfDoc.save();
            sendComplete(id,{success:true,data:result,fileName:(payload.options.title||'data').replace(/[^a-zA-Z0-9]/g,'-').toLowerCase()+'.pdf',mimeType:'application/pdf',pageCount:pdfDoc.getPageCount(),originalSize:payload.csvContent.length,outputSize:result.byteLength});
            break;
          }
          case 'add-qr-code': {
            sendProgress(id,10,'Loading PDF…');
            const pdfDoc = await PDFDocument.load(payload.fileBuffer);
            sendProgress(id,30,'Creating QR image…');
            // Generate QR placeholder
            const sz = payload.size*2;
            const c = typeof OffscreenCanvas!=='undefined' ? new OffscreenCanvas(sz,sz) : null;
            let qrBytes;
            if(c){
              const ctx=c.getContext('2d');
              ctx.fillStyle='#fff';ctx.fillRect(0,0,sz,sz);ctx.fillStyle='#000';
              const ms=sz/25;
              for(let r=0;r<25;r++)for(let col=0;col<25;col++){
                const fp=(r<7&&col<7)||(r<7&&col>17)||(r>17&&col<7);
                if(fp){const b=r===0||r===6||col===0||col===6||(r>=2&&r<=4&&col>=2&&col<=4)||(r>=2&&r<=4&&col>=20&&col<=22)||(r>=20&&r<=22&&col>=2&&col<=4)||(r<7&&col>17&&(col===18||col===24))||(r>17&&col<7&&(r===18||r===24));if(b)ctx.fillRect(col*ms,r*ms,ms,ms);}
                else if((r+col)%3===0)ctx.fillRect(col*ms,r*ms,ms,ms);
              }
              const blob=await c.convertToBlob({type:'image/png'});
              qrBytes=new Uint8Array(await blob.arrayBuffer());
            } else { qrBytes=new Uint8Array([0x89,0x50,0x4e,0x47]); }
            const qrImg = await pdfDoc.embedPng(qrBytes);
            sendProgress(id,50,'Placing QR codes…');
            const pages=pdfDoc.getPages();
            const si=payload.pageRange?Math.max(0,payload.pageRange.start-1):0;
            const ei=payload.pageRange?Math.min(pages.length,payload.pageRange.end):pages.length;
            for(let i=si;i<ei;i++){
              const pg=pages[i];const{width:w,height:h}=pg.getSize();
              let x,y;
              switch(payload.position){
                case'top-left':x=20;y=h-payload.size-20;break;
                case'top-right':x=w-payload.size-20;y=h-payload.size-20;break;
                case'bottom-left':x=20;y=20;break;
                case'bottom-right':x=w-payload.size-20;y=20;break;
                default:x=(w-payload.size)/2;y=(h-payload.size)/2;
              }
              pg.drawImage(qrImg,{x,y,width:payload.size,height:payload.size});
            }
            sendProgress(id,90,'Saving…');
            const result = await pdfDoc.save();
            sendComplete(id,{success:true,data:result,fileName:payload.fileName||'qr-added.pdf',mimeType:'application/pdf',pageCount:pdfDoc.getPageCount(),originalSize:payload.fileBuffer.byteLength,outputSize:result.byteLength});
            break;
          }
          default:
            sendError(id, 'Unknown operation: ' + operation);
        }
      } catch(err) {
        sendError(id, err.message || 'Processing failed');
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  workerInstance = new Worker(url);

  // Clean up blob URL after worker is created
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return workerInstance;
}

export interface UsePdfWorkerReturn {
  process: (operation: string, payload: Record<string, unknown>) => Promise<ProcessResult>;
  cancel: () => void;
  state: ProcessingState;
  isSupported: boolean;
}

export function usePdfWorker(): UsePdfWorkerReturn {
  const [state, setState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const resolveRef = useRef<(result: ProcessResult) => void | null>(null);
  const startAtRef = useRef<number>(0);
  // Tool-scoped context provided by <AnalyticsProvider /> on tool pages.
  const { toolSlug } = useAnalytics();

  useEffect(() => {
    return () => {
      // Cleanup: terminate worker on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const isSupported = typeof window !== "undefined" && typeof Worker !== "undefined";

  const process = useCallback(
    (operation: string, payload: Record<string, unknown>): Promise<ProcessResult> => {
      return new Promise((resolve, reject) => {
        if (!isSupported) {
          reject(new Error("Web Workers are not supported in this browser"));
          return;
        }

        const id = `req-${++requestCounter}`;
        requestIdRef.current = id;
        resolveRef.current = resolve;
        startAtRef.current = Date.now();

        setState({ status: "processing", progress: 0, message: "Starting…" });

        const worker = getWorker();
        workerRef.current = worker;

        const handleMessage = (event: MessageEvent) => {
          const msg = event.data;
          if (msg.id !== id) return;

          switch (msg.type) {
            case "progress":
              setState({
                status: "processing",
                progress: msg.progress,
                message: msg.message,
              });
              break;

            case "complete":
              worker.removeEventListener("message", handleMessage);
              setState({
                status: "complete",
                progress: 100,
                message: "Processing complete",
              });
              // Funnel: file_uploaded → file_processed → file_downloaded.
              if (toolSlug) {
                analytics.fileProcessed(
                  toolSlug,
                  Date.now() - startAtRef.current
                );
              }
              resolve(msg.result);
              break;

            case "error":
              worker.removeEventListener("message", handleMessage);
              setState({
                status: "error",
                progress: 0,
                message: msg.error,
                error: msg.error,
              });
              reject(new Error(msg.error));
              break;
          }
        };

        worker.addEventListener("message", handleMessage);
        worker.postMessage({ type: "process", id, operation, payload });
      });
    },
    [isSupported, toolSlug]
  );

  const cancel = useCallback(() => {
    if (workerRef.current && requestIdRef.current) {
      workerRef.current.postMessage({
        type: "cancel",
        id: requestIdRef.current,
      });
      setState({ status: "idle", progress: 0, message: "Cancelled" });
    }
  }, []);

  return { process, cancel, state, isSupported };
}
