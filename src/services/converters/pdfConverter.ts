import * as pdfjsLib from 'pdfjs-dist';
import { ConversionOptions } from '../../types/converter';

// Setup worker
if (typeof window !== 'undefined') {
  try {
    // Use worker from unpkg or cdnjs corresponding to pdfjs version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch {
    // Ignore fallback
  }
}

interface TextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  hasEOL?: boolean;
}

export async function convertPdfToMarkdown(
  arrayBuffer: ArrayBuffer,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<{ markdown: string; pageCount: number }> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const pageMarkdowns: string[] = [];

    // Collect all font sizes across document to determine median body font size
    const allFontSizes: number[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      for (const item of textContent.items as any[]) {
        if ('str' in item && item.str.trim()) {
          const fontSize = Math.abs(item.transform?.[0] || item.height || 12);
          if (fontSize > 4 && fontSize < 100) {
            allFontSizes.push(fontSize);
          }
        }
      }
    }

    // Calculate median font size
    allFontSizes.sort((a, b) => a - b);
    const medianFontSize =
      allFontSizes.length > 0
        ? allFontSizes[Math.floor(allFontSizes.length / 2)]
        : 12;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      onProgress?.(Math.round((pageNum / pageCount) * 90));
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const items: TextItem[] = [];

      for (const item of textContent.items as any[]) {
        if ('str' in item && item.str.trim()) {
          const tx = item.transform || [1, 0, 0, 1, 0, 0];
          const fontSize = Math.abs(tx[0] || item.height || 12);
          const x = tx[4] || 0;
          const y = tx[5] || 0;

          items.push({
            str: item.str,
            x,
            y,
            fontSize,
            hasEOL: item.hasEOL,
          });
        }
      }

      if (items.length === 0) {
        // Scanned or empty page
        pageMarkdowns.push(`*Page ${pageNum} appears to contain no extractable text (it may be a scanned image).*`);
        continue;
      }

      // Sort items: PDF coordinate system has Y=0 at bottom, so higher Y means higher on page.
      // Sort primarily by Y descending (top to bottom), then by X ascending (left to right).
      items.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 4) {
          return yDiff;
        }
        return a.x - b.x;
      });

      // Group items into lines
      const lines: { text: string; fontSize: number; y: number }[] = [];
      let currentLineItems: TextItem[] = [];
      let currentY = items[0].y;

      for (const item of items) {
        if (currentLineItems.length === 0) {
          currentLineItems.push(item);
          currentY = item.y;
        } else if (Math.abs(item.y - currentY) <= 4) {
          currentLineItems.push(item);
        } else {
          // Finish line
          currentLineItems.sort((a, b) => a.x - b.x);
          const lineText = currentLineItems.map((i) => i.str).join(' ').trim();
          const maxFontSize = Math.max(...currentLineItems.map((i) => i.fontSize));
          if (lineText) {
            lines.push({ text: lineText, fontSize: maxFontSize, y: currentY });
          }
          currentLineItems = [item];
          currentY = item.y;
        }
      }

      if (currentLineItems.length > 0) {
        currentLineItems.sort((a, b) => a.x - b.x);
        const lineText = currentLineItems.map((i) => i.str).join(' ').trim();
        const maxFontSize = Math.max(...currentLineItems.map((i) => i.fontSize));
        if (lineText) {
          lines.push({ text: lineText, fontSize: maxFontSize, y: currentY });
        }
      }

      // Format lines into markdown paragraphs & headings
      const pageOutput: string[] = [];
      let currentParagraph: string[] = [];

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          pageOutput.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const text = line.text;

        // Check if heading based on font size threshold
        const isH1 = line.fontSize >= medianFontSize * 1.8;
        const isH2 = !isH1 && line.fontSize >= medianFontSize * 1.4;
        const isH3 = !isH1 && !isH2 && line.fontSize >= medianFontSize * 1.2 && text.length < 80;

        // Check if bullet point
        const isBullet = /^[•–—\*\-]\s+/.test(text) || /^\d+[\.\)]\s+/.test(text);

        if (isH1 || isH2 || isH3) {
          flushParagraph();
          const headingLevel = isH1 ? '#' : isH2 ? '##' : '###';
          pageOutput.push(`${headingLevel} ${text.replace(/^#+\s*/, '')}\n`);
        } else if (isBullet) {
          flushParagraph();
          const bulletText = text.replace(/^[•–—\*\-]\s+/, `${options.bulletStyle} `);
          pageOutput.push(bulletText);
        } else {
          // Check vertical distance to previous line
          const prevLine = lines[i - 1];
          if (prevLine && Math.abs(prevLine.y - line.y) > line.fontSize * 2.2) {
            flushParagraph();
          }
          currentParagraph.push(text);
        }
      }

      flushParagraph();

      let pageMd = pageOutput.join('\n\n');
      if (options.includePageBreaks && pageCount > 1) {
        pageMd = `<!-- Page ${pageNum} -->\n\n${pageMd}`;
      }
      pageMarkdowns.push(pageMd);
    }

    const divider = options.includePageBreaks ? '\n\n---\n\n' : '\n\n';
    return {
      markdown: pageMarkdowns.join(divider),
      pageCount,
    };
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to parse PDF: ${err.message || 'Unknown error'}`);
  }
}
