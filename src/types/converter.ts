export interface ConversionOptions {
  includeFrontmatter: boolean;
  headingStyle: 'atx' | 'setext'; // atx: #, setext: ===
  bulletStyle: '-' | '*' | '+';
  includePageBreaks: boolean;
  preserveTables: boolean;
  extractNotes: boolean; // For presentations
  useAIIfAvailable: boolean;
}

export type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

export interface ConvertedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  status: ConversionStatus;
  progress: number; // 0 - 100
  markdown: string;
  error?: string;
  convertedAt?: string;
  pageCount?: number;
  wordCount?: number;
  charCount?: number;
  readingTimeMin?: number;
  originalFile?: File;
  usedAi?: boolean;
}

export interface SupportedFormatInfo {
  extension: string;
  name: string;
  category: 'Document' | 'Presentation' | 'Spreadsheet' | 'Web & Ebook' | 'Data & Code' | 'Image & OCR';
  description: string;
  clientSupported: boolean;
  aiEnhanced: boolean;
}
