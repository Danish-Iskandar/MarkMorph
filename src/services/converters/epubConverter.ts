import JSZip from 'jszip';
import { convertHtmlToMarkdown } from './htmlConverter';
import { ConversionOptions } from '../../types/converter';

export async function convertEpubToMarkdown(
  arrayBuffer: ArrayBuffer,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<{ markdown: string; chapterCount: number }> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const parser = new DOMParser();

    // 1. Locate container.xml
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid EPUB file: META-INF/container.xml missing');
    }

    const containerXml = await containerFile.async('text');
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfileEl = containerDoc.getElementsByTagNameNS('*', 'rootfile')[0];
    const opfPath = rootfileEl?.getAttribute('full-path');

    if (!opfPath) {
      throw new Error('Invalid EPUB: Unable to find OPF package path');
    }

    // 2. Read OPF file
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error(`OPF package file not found at ${opfPath}`);
    }

    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfXml = await opfFile.async('text');
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    // Read title from metadata
    const titleEl = opfDoc.getElementsByTagNameNS('*', 'title')[0];
    const bookTitle = titleEl?.textContent?.trim() || '';

    // Manifest map: id -> href
    const manifestItems = opfDoc.getElementsByTagNameNS('*', 'item');
    const idToHref = new Map<string, string>();
    for (let i = 0; i < manifestItems.length; i++) {
      const item = manifestItems[i];
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        idToHref.set(id, href);
      }
    }

    // Spine itemrefs
    const itemrefs = opfDoc.getElementsByTagNameNS('*', 'itemref');
    const chapterHrefs: string[] = [];
    for (let i = 0; i < itemrefs.length; i++) {
      const idref = itemrefs[i].getAttribute('idref');
      if (idref && idToHref.has(idref)) {
        chapterHrefs.push(idToHref.get(idref)!);
      }
    }

    const chapterMarkdowns: string[] = [];
    if (bookTitle) {
      chapterMarkdowns.push(`# ${bookTitle}\n`);
    }

    for (let i = 0; i < chapterHrefs.length; i++) {
      onProgress?.(Math.round(((i + 1) / chapterHrefs.length) * 90));
      const href = chapterHrefs[i];
      // Resolve path relative to OPF dir
      const fullPath = opfDir + href;
      const chapterFile = zip.file(fullPath) || zip.file(href);

      if (chapterFile) {
        const chapterHtml = await chapterFile.async('text');
        const res = convertHtmlToMarkdown(chapterHtml, options);
        if (res.markdown.trim()) {
          chapterMarkdowns.push(res.markdown.trim());
        }
      }
    }

    const divider = options.includePageBreaks ? '\n\n---\n\n' : '\n\n';
    return {
      markdown: chapterMarkdowns.join(divider),
      chapterCount: chapterHrefs.length,
    };
  } catch (error: any) {
    console.error('EPUB conversion error:', error);
    throw new Error(`Failed to convert EPUB: ${error.message}`);
  }
}
