/**
 * Text to PDF Converter — generates a PDF from text content.
 * Creates a simple PDF document client-side for download.
 */

export interface TextToPdfOptions {
  content: string;
  fontSize: number;
  fontFamily: "courier" | "helvetica" | "times";
  pageSize: "a4" | "letter";
  orientation: "portrait" | "landscape";
  margins: number; // points
  title?: string;
}

export interface TextToPdfResult {
  blob: Blob;
  fileName: string;
  pageCount: number;
  charCount: number;
}

/**
 * Generate a PDF from text content.
 * Creates a minimal but valid PDF file for download.
 */
export function textToPdf(options: TextToPdfOptions): TextToPdfResult {
  const { content, fontSize, pageSize, orientation, margins, title } = options;

  if (!content.trim()) {
    throw new Error("No content to convert");
  }

  // Page dimensions in points (1 point = 1/72 inch)
  const pageWidth = pageSize === "a4"
    ? (orientation === "landscape" ? 842 : 595)
    : (orientation === "landscape" ? 792 : 612);
  const pageHeight = pageSize === "a4"
    ? (orientation === "landscape" ? 595 : 842)
    : (orientation === "landscape" ? 612 : 792);

  const contentWidth = pageWidth - margins * 2;
  const lineHeight = fontSize * 1.4;
  const charsPerLine = Math.floor(contentWidth / (fontSize * 0.6));
  const linesPerPage = Math.floor((pageHeight - margins * 2) / lineHeight);

  // Split content into lines
  const rawLines = content.split("\n");
  const wrappedLines: string[] = [];

  for (const line of rawLines) {
    if (line.length <= charsPerLine) {
      wrappedLines.push(line);
    } else {
      // Word wrap
      const words = line.split(" ");
      let currentLine = "";
      for (const word of words) {
        if (currentLine.length + word.length + 1 <= charsPerLine) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    }
  }

  // Calculate page count
  const pageCount = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

  // Build PDF content
  const pdfContent: string[] = [];
  const objects: string[] = [];
  let objCount = 0;

  // PDF Header
  pdfContent.push("%PDF-1.4");

  // Build text streams for each page
  const pageObjects: number[] = [];

  for (let page = 0; page < pageCount; page++) {
    const startLine = page * linesPerPage;
    const endLine = Math.min(startLine + linesPerPage, wrappedLines.length);
    const pageLines = wrappedLines.slice(startLine, endLine);

    // Build the text stream
    const textStream = pageLines
      .map((line, i) => {
        const y = pageHeight - margins - (i + 1) * lineHeight;
        return `BT\n/F1 ${fontSize} Tf\n${margins} ${y} Td\n(${escapePdf(line)}) Tj\nET`;
      })
      .join("\n");

    // Content stream object
    objCount++;
    const contentObjNum = objCount;
    objects.push(`${contentObjNum} 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream\nendobj`);

    // Page object
    objCount++;
    pageObjects.push(objCount);
    objects.push(`${objCount} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj`);
  }

  // Catalog
  objCount++;
  const catalogObj = objCount;
  const pagesRef = "2 0 R";
  objects.unshift(`${catalogObj} 0 obj\n<< /Type /Catalog /Pages ${pagesRef} >>\nendobj`);

  // Pages object
  objCount++;
  const pagesObj = objCount;
  const pageRefs = pageObjects.map((n) => `${n} 0 R`).join(" ");
  objects.splice(1, 0, `${pagesObj} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>\nendobj`);

  // Font object
  objCount++;
  const fontObj = objCount;
  const fontName = options.fontFamily === "courier" ? "Courier" : options.fontFamily === "times" ? "Times-Roman" : "Helvetica";
  objects.splice(2, 0, `${fontObj} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /${fontName} >>\nendobj`);

  // Assemble PDF
  const fullPdf = pdfContent.join("\n") + "\n" + objects.join("\n\n") + "\n";

  // Cross-reference table
  const xrefOffset = new TextEncoder().encode(fullPdf).length;
  let xref = "xref\n";
  xref += `0 ${objCount + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i <= objCount; i++) {
    xref += `${String(i * 50).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objCount + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const finalPdf = fullPdf + xref + trailer;
  const blob = new Blob([finalPdf], { type: "application/pdf" });

  const fileName = title
    ? `${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`
    : "document.pdf";

  return {
    blob,
    fileName,
    pageCount,
    charCount: content.length,
  };
}

function escapePdf(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
