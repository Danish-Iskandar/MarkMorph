import mammoth from 'mammoth';
import { createTurndownService } from '../turndownService';
import { ConversionOptions } from '../../types/converter';

export async function convertDocxToMarkdown(
  arrayBuffer: ArrayBuffer,
  options: ConversionOptions
): Promise<{ markdown: string }> {
  try {
    const conversionResult = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        includeDefaultStyleMap: true,
      }
    );

    const html = conversionResult.value;
    const turndown = createTurndownService({
      headingStyle: options.headingStyle,
      bulletStyle: options.bulletStyle,
    });

    let markdown = turndown.turndown(html);

    // Clean up excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return { markdown };
  } catch (error: any) {
    console.error('DOCX conversion error:', error);
    throw new Error(`Failed to convert Word document: ${error.message || 'Corrupted or unsupported document format'}`);
  }
}
