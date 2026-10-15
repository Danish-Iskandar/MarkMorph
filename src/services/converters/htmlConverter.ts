import { createTurndownService } from '../turndownService';
import { ConversionOptions } from '../../types/converter';

export function convertHtmlToMarkdown(
  htmlContent: string,
  options: ConversionOptions
): { markdown: string } {
  try {
    // Sanitize HTML by removing scripts, style, iframe, head metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove unwanted elements
    const unwanted = doc.querySelectorAll('script, style, noscript, svg, iframe');
    unwanted.forEach((el) => el.remove());

    const turndown = createTurndownService({
      headingStyle: options.headingStyle,
      bulletStyle: options.bulletStyle,
    });

    const bodyContent = doc.body.innerHTML || htmlContent;
    let markdown = turndown.turndown(bodyContent);

    // Clean up excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return { markdown };
  } catch (error: any) {
    console.error('HTML conversion error:', error);
    throw new Error(`Failed to convert HTML to Markdown: ${error.message}`);
  }
}
