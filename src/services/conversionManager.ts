import { ConvertedFile, ConversionOptions, SupportedFormatInfo } from '../types/converter';
import { convertPdfToMarkdown } from './converters/pdfConverter';
import { convertDocxToMarkdown } from './converters/docxConverter';
import { convertPptxToMarkdown } from './converters/pptxConverter';
import { convertSpreadsheetToMarkdown } from './converters/spreadsheetConverter';
import { convertHtmlToMarkdown } from './converters/htmlConverter';
import { convertEpubToMarkdown } from './converters/epubConverter';
import { convertTextToMarkdown } from './converters/textConverter';

export const SUPPORTED_FORMATS: SupportedFormatInfo[] = [
  {
    extension: 'pdf',
    name: 'Portable Document Format',
    category: 'Document',
    description: 'Extracts headings, paragraphs, bullet points, and structures with font-size hierarchy.',
    clientSupported: true,
    aiEnhanced: true,
  },
  {
    extension: 'docx',
    name: 'Microsoft Word Document',
    category: 'Document',
    description: 'Converts Word headings, styled lists, tables, bold/italic, and quotes into clean Markdown.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'doc',
    name: 'Legacy Word Document',
    category: 'Document',
    description: 'Converts text content and layout elements via AI/binary parser.',
    clientSupported: true,
    aiEnhanced: true,
  },
  {
    extension: 'pptx',
    name: 'Microsoft PowerPoint Presentation',
    category: 'Presentation',
    description: 'Extracts slide titles, nested bullet points, tables, and presenter speaker notes.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'xlsx',
    name: 'Microsoft Excel Spreadsheet',
    category: 'Spreadsheet',
    description: 'Transforms multi-sheet workbooks into clean GitHub-Flavored Markdown tables.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'xls',
    name: 'Legacy Excel Spreadsheet',
    category: 'Spreadsheet',
    description: 'Parses legacy Excel sheets into Markdown tabular data.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'csv',
    name: 'Comma-Separated Values',
    category: 'Spreadsheet',
    description: 'Converts comma-delimited data directly into formatted Markdown tables.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'tsv',
    name: 'Tab-Separated Values',
    category: 'Spreadsheet',
    description: 'Converts tab-delimited records into aligned Markdown tables.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'html',
    name: 'HyperText Markup Language',
    category: 'Web & Ebook',
    description: 'Sanitizes and converts web markup, tables, code tags, and links into Markdown.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'epub',
    name: 'Electronic Publication',
    category: 'Web & Ebook',
    description: 'Unpacks chapters and extracts e-book titles, headings, and prose.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'json',
    name: 'JavaScript Object Notation',
    category: 'Data & Code',
    description: 'Auto-converts record arrays into tables or formatted JSON blocks.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'yaml',
    name: 'YAML Data File',
    category: 'Data & Code',
    description: 'Encapsulates YAML configurations in clean syntax-highlighted blocks.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'xml',
    name: 'Extensible Markup Language',
    category: 'Data & Code',
    description: 'Parses XML nodes or code blocks into readable Markdown.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'txt',
    name: 'Plain Text Document',
    category: 'Document',
    description: 'Formats paragraphs, list markers, and indentation.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'rtf',
    name: 'Rich Text Format',
    category: 'Document',
    description: 'Strips RTF control tokens into formatted Markdown text.',
    clientSupported: true,
    aiEnhanced: false,
  },
  {
    extension: 'png',
    name: 'PNG Image / Document Scan',
    category: 'Image & OCR',
    description: 'OCR transcribes document screenshots, receipts, handwritten notes, and diagrams to Markdown.',
    clientSupported: false,
    aiEnhanced: true,
  },
  {
    extension: 'jpg',
    name: 'JPEG Image / Document Scan',
    category: 'Image & OCR',
    description: 'OCR transcribes document photos, whiteboard notes, and formulas to Markdown.',
    clientSupported: false,
    aiEnhanced: true,
  },
];

export async function convertFileToMarkdown(
  file: File,
  options: ConversionOptions,
  onProgress?: (progress: number) => void
): Promise<{
  markdown: string;
  pageCount?: number;
  wordCount: number;
  charCount: number;
  readingTimeMin: number;
  usedAi: boolean;
}> {
  const ext = file.name.includes('.')
    ? file.name.split('.').pop()!.toLowerCase()
    : '';

  let rawMarkdown = '';
  let pageCount: number | undefined;
  let usedAi = false;

  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext);

  // Check if AI conversion requested or required (e.g. image OCR)
  if (isImage || (options.useAIIfAvailable && ['doc', 'pdf'].includes(ext))) {
    try {
      onProgress?.(30);
      const aiResult = await tryAiConversion(file);
      if (aiResult) {
        rawMarkdown = aiResult;
        usedAi = true;
        onProgress?.(100);
      }
    } catch (aiErr) {
      console.warn('AI conversion fallback to client parser:', aiErr);
      if (isImage) {
        throw new Error(
          'Image OCR requires the Gemini API key. Please check that GEMINI_API_KEY is configured in your environment.'
        );
      }
    }
  }

  // If not handled by AI, use client-side parser
  if (!rawMarkdown) {
    onProgress?.(20);

    if (ext === 'pdf') {
      const buffer = await file.arrayBuffer();
      const res = await convertPdfToMarkdown(buffer, options, onProgress);
      rawMarkdown = res.markdown;
      pageCount = res.pageCount;
    } else if (ext === 'docx') {
      const buffer = await file.arrayBuffer();
      const res = await convertDocxToMarkdown(buffer, options);
      rawMarkdown = res.markdown;
    } else if (ext === 'pptx') {
      const buffer = await file.arrayBuffer();
      const res = await convertPptxToMarkdown(buffer, options, onProgress);
      rawMarkdown = res.markdown;
      pageCount = res.slideCount;
    } else if (['xlsx', 'xls', 'csv', 'tsv'].includes(ext)) {
      if (ext === 'csv' || ext === 'tsv') {
        const text = await file.text();
        const res = convertSpreadsheetToMarkdown(text, options, ext);
        rawMarkdown = res.markdown;
        pageCount = res.sheetCount;
      } else {
        const buffer = await file.arrayBuffer();
        const res = convertSpreadsheetToMarkdown(buffer, options, ext);
        rawMarkdown = res.markdown;
        pageCount = res.sheetCount;
      }
    } else if (ext === 'html' || ext === 'htm') {
      const text = await file.text();
      const res = convertHtmlToMarkdown(text, options);
      rawMarkdown = res.markdown;
    } else if (ext === 'epub') {
      const buffer = await file.arrayBuffer();
      const res = await convertEpubToMarkdown(buffer, options, onProgress);
      rawMarkdown = res.markdown;
      pageCount = res.chapterCount;
    } else {
      // Default plain text / JSON / XML / RTF / Code
      const text = await file.text();
      const res = convertTextToMarkdown(text, file.name, ext, options);
      rawMarkdown = res.markdown;
    }
  }

  onProgress?.(95);

  // Apply frontmatter if enabled
  let finalMarkdown = rawMarkdown;
  if (options.includeFrontmatter) {
    const frontmatter = generateFrontmatter(file, ext, pageCount);
    finalMarkdown = `${frontmatter}\n\n${rawMarkdown}`;
  }

  // Calculate statistics
  const wordCount = finalMarkdown.trim().split(/\s+/).filter(Boolean).length;
  const charCount = finalMarkdown.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  onProgress?.(100);

  return {
    markdown: finalMarkdown,
    pageCount,
    wordCount,
    charCount,
    readingTimeMin,
    usedAi,
  };
}

async function tryAiConversion(file: File): Promise<string | null> {
  const base64Data = await fileToBase64(file);
  const response = await fetch('/api/ai-convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64Data,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned ${response.status}`);
  }

  const data = await response.json();
  return data.markdown || null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateFrontmatter(file: File, ext: string, count?: number): string {
  const title = file.name.replace(/\.[^/.]+$/, '');
  const dateStr = new Date().toISOString();
  const sizeKb = (file.size / 1024).toFixed(1);

  return `---
title: "${title.replace(/"/g, '\\"')}"
source_filename: "${file.name.replace(/"/g, '\\"')}"
source_format: "${ext.toUpperCase()}"
file_size: "${sizeKb} KB"
converted_date: "${dateStr}"${count ? `\ncount: ${count}` : ''}
generator: "MarkMorph"
---`;
}
