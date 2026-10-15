import JSZip from 'jszip';
import { ConversionOptions } from '../../types/converter';

export async function convertPptxToMarkdown(
  arrayBuffer: ArrayBuffer,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<{ markdown: string; slideCount: number }> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const parser = new DOMParser();

    // Find all slide XML files
    const slideEntries: { name: string; index: number; file: JSZip.JSZipObject }[] = [];

    zip.forEach((relativePath, file) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
      if (match) {
        slideEntries.push({
          name: relativePath,
          index: parseInt(match[1], 10),
          file,
        });
      }
    });

    if (slideEntries.length === 0) {
      throw new Error('No slides found in the presentation.');
    }

    // Sort slides by index
    slideEntries.sort((a, b) => a.index - b.index);

    // Also look for slide relationships to check for notes
    const notesMap = new Map<number, string>();
    if (options.extractNotes) {
      const notesEntries: { index: number; file: JSZip.JSZipObject }[] = [];
      zip.forEach((relativePath, file) => {
        const match = relativePath.match(/^ppt\/notesSlides\/notesSlide(\d+)\.xml$/i);
        if (match) {
          notesEntries.push({
            index: parseInt(match[1], 10),
            file,
          });
        }
      });

      for (const entry of notesEntries) {
        try {
          const notesXml = await entry.file.async('text');
          const doc = parser.parseFromString(notesXml, 'application/xml');
          const paragraphs = doc.getElementsByTagNameNS('*', 'p');
          const noteLines: string[] = [];
          for (let p = 0; p < paragraphs.length; p++) {
            const textRuns = paragraphs[p].getElementsByTagNameNS('*', 't');
            let pText = '';
            for (let t = 0; t < textRuns.length; t++) {
              pText += textRuns[t].textContent || '';
            }
            pText = pText.trim();
            // Ignore slide number indicators
            if (pText && !pText.match(/^\d+$/)) {
              noteLines.push(pText);
            }
          }
          if (noteLines.length > 0) {
            notesMap.set(entry.index, noteLines.join('\n'));
          }
        } catch {
          // ignore notes parse failure
        }
      }
    }

    const slideMarkdowns: string[] = [];

    for (let i = 0; i < slideEntries.length; i++) {
      onProgress?.(Math.round(((i + 1) / slideEntries.length) * 90));
      const entry = slideEntries[i];
      const slideIndex = i + 1;
      const xmlString = await entry.file.async('text');
      const doc = parser.parseFromString(xmlString, 'application/xml');

      let slideTitle = '';
      const bodyElements: string[] = [];

      // 1. Check for shapes
      const shapes = doc.getElementsByTagNameNS('*', 'sp');

      for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];

        // Check if placeholder is title
        const ph = shape.getElementsByTagNameNS('*', 'ph')[0];
        const phType = ph?.getAttribute('type');
        const isTitleShape = phType === 'title' || phType === 'ctrTitle' || phType === 'subTitle';

        const paragraphs = shape.getElementsByTagNameNS('*', 'p');
        const shapeLines: { text: string; lvl: number; isBold: boolean }[] = [];

        for (let p = 0; p < paragraphs.length; p++) {
          const para = paragraphs[p];
          const pPr = para.getElementsByTagNameNS('*', 'pPr')[0];
          const lvl = pPr ? parseInt(pPr.getAttribute('lvl') || '0', 10) : 0;

          let paraText = '';
          const runs = para.getElementsByTagNameNS('*', 'r');

          for (let r = 0; r < runs.length; r++) {
            const run = runs[r];
            const textEl = run.getElementsByTagNameNS('*', 't')[0];
            if (!textEl) continue;
            let runText = textEl.textContent || '';
            const rPr = run.getElementsByTagNameNS('*', 'rPr')[0];
            const isBold = rPr?.getAttribute('b') === '1';
            const isItalic = rPr?.getAttribute('i') === '1';

            if (runText) {
              if (isBold && isItalic) {
                runText = `***${runText.trim()}*** `;
              } else if (isBold) {
                runText = `**${runText.trim()}** `;
              } else if (isItalic) {
                runText = `*${runText.trim()}* `;
              }
              paraText += runText;
            }
          }

          paraText = paraText.trim();
          if (paraText) {
            shapeLines.push({ text: paraText, lvl, isBold: false });
          }
        }

        if (shapeLines.length > 0) {
          if (isTitleShape && !slideTitle) {
            slideTitle = shapeLines.map((l) => l.text.replace(/\*\*/g, '')).join(' ');
          } else {
            for (const line of shapeLines) {
              const indent = '  '.repeat(line.lvl);
              bodyElements.push(`${indent}${options.bulletStyle} ${line.text}`);
            }
          }
        }
      }

      // 2. Check for tables in slide
      const tables = doc.getElementsByTagNameNS('*', 'tbl');
      for (let t = 0; t < tables.length; t++) {
        const table = tables[t];
        const rows = table.getElementsByTagNameNS('*', 'tr');
        const tableRows: string[][] = [];

        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          const cells = row.getElementsByTagNameNS('*', 'tc');
          const cellTexts: string[] = [];

          for (let c = 0; c < cells.length; c++) {
            const cell = cells[c];
            const textEls = cell.getElementsByTagNameNS('*', 't');
            let cellContent = '';
            for (let k = 0; k < textEls.length; k++) {
              cellContent += (textEls[k].textContent || '') + ' ';
            }
            cellTexts.push(cellContent.trim().replace(/\|/g, '\\|') || '-');
          }
          if (cellTexts.length > 0) {
            tableRows.push(cellTexts);
          }
        }

        if (tableRows.length > 0) {
          const maxCols = Math.max(...tableRows.map((r) => r.length));
          const normalizedRows = tableRows.map((r) => {
            while (r.length < maxCols) r.push('-');
            return r;
          });

          const header = normalizedRows[0];
          const divider = new Array(maxCols).fill('---');
          const rest = normalizedRows.slice(1);

          let tableMd = `\n| ${header.join(' | ')} |\n| ${divider.join(' | ')} |\n`;
          for (const row of rest) {
            tableMd += `| ${row.join(' | ')} |\n`;
          }
          bodyElements.push(tableMd);
        }
      }

      // Assemble slide markdown
      let slideMd = `## Slide ${slideIndex}${slideTitle ? `: ${slideTitle}` : ''}\n\n`;

      if (bodyElements.length > 0) {
        slideMd += bodyElements.join('\n') + '\n';
      } else {
        slideMd += `*(Visual slide with no direct text extracted)*\n`;
      }

      // Add speaker notes if found
      const notes = notesMap.get(entry.index);
      if (notes) {
        slideMd += `\n> **Speaker Notes**:\n> ${notes.replace(/\n/g, '\n> ')}\n`;
      }

      slideMarkdowns.push(slideMd.trim());
    }

    const divider = options.includePageBreaks ? '\n\n---\n\n' : '\n\n';
    return {
      markdown: slideMarkdowns.join(divider),
      slideCount: slideEntries.length,
    };
  } catch (error: any) {
    console.error('PPTX conversion error:', error);
    throw new Error(`Failed to convert PowerPoint: ${error.message || 'Invalid or encrypted presentation file'}`);
  }
}
