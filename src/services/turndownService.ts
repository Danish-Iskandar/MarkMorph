import TurndownService from 'turndown';

export function createTurndownService(options?: {
  headingStyle?: 'setext' | 'atx';
  bulletStyle?: '-' | '*' | '+';
}): TurndownService {
  const service = new TurndownService({
    headingStyle: options?.headingStyle || 'atx',
    bulletListMarker: options?.bulletStyle || '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  // Table handling rule
  service.addRule('table', {
    filter: ['table'],
    replacement: function (_content: string, node: Node) {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.rows);
      if (rows.length === 0) return '';

      const tableData: string[][] = [];
      let maxCols = 0;

      for (const row of rows) {
        const cells = Array.from(row.cells).map((cell) => {
          return cell.textContent?.trim().replace(/\|/g, '\\|').replace(/\n+/g, ' ') || '';
        });
        if (cells.length > maxCols) maxCols = cells.length;
        tableData.push(cells);
      }

      if (maxCols === 0) return '';

      // Normalize row lengths
      for (const row of tableData) {
        while (row.length < maxCols) {
          row.push('');
        }
      }

      const headerRow = tableData[0];
      const separatorRow = new Array(maxCols).fill('---');
      const bodyRows = tableData.slice(1);

      let markdown = '\n\n';
      markdown += '| ' + headerRow.join(' | ') + ' |\n';
      markdown += '| ' + separatorRow.join(' | ') + ' |\n';

      for (const row of bodyRows) {
        markdown += '| ' + row.join(' | ') + ' |\n';
      }

      return markdown + '\n';
    },
  });

  // Strikethrough rule
  service.addRule('strikethrough', {
    filter: (node) => ['DEL', 'S', 'STRIKE'].includes(node.nodeName),
    replacement: function (content: string) {
      return '~~' + content + '~~';
    },
  });

  // Underline to emphasis or underline text
  service.addRule('underline', {
    filter: (node) => ['U', 'INS'].includes(node.nodeName),
    replacement: function (content: string) {
      return '_' + content + '_';
    },
  });

  // Highlight/Mark
  service.addRule('mark', {
    filter: (node) => node.nodeName === 'MARK',
    replacement: function (content: string) {
      return '==' + content + '==';
    },
  });

  return service;
}
