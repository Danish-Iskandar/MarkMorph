import * as XLSX from 'xlsx';
import { ConversionOptions } from '../../types/converter';

export function convertSpreadsheetToMarkdown(
  data: ArrayBuffer | string,
  options: ConversionOptions,
  fileExtension: string
): { markdown: string; sheetCount: number } {
  try {
    let workbook: XLSX.WorkBook;

    if (typeof data === 'string') {
      workbook = XLSX.read(data, { type: 'string' });
    } else {
      workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    }

    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return { markdown: '*Empty spreadsheet*', sheetCount: 0 };
    }

    const sheetMarkdowns: string[] = [];

    for (const name of sheetNames) {
      const sheet = workbook.Sheets[name];
      if (!sheet) continue;

      // Convert sheet to array of rows (header: 1 gives raw 2D array)
      const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: '',
      });

      if (!rawRows || rawRows.length === 0) {
        if (sheetNames.length > 1) {
          sheetMarkdowns.push(`## Sheet: ${name}\n\n*Empty sheet*`);
        }
        continue;
      }

      // Filter out completely empty trailing rows
      const nonEmptyRows = rawRows.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')
      );

      if (nonEmptyRows.length === 0) continue;

      // Find max columns
      const maxCols = Math.max(...nonEmptyRows.map((r) => r.length));
      if (maxCols === 0) continue;

      // Format table
      const formattedRows: string[][] = nonEmptyRows.map((row) => {
        const cells: string[] = [];
        for (let c = 0; c < maxCols; c++) {
          const val = row[c] !== undefined && row[c] !== null ? String(row[c]) : '';
          cells.push(val.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>'));
        }
        return cells;
      });

      const headerRow = formattedRows[0];
      const separatorRow = new Array(maxCols).fill('---');
      const dataRows = formattedRows.slice(1);

      let tableMd = '';
      if (sheetNames.length > 1 || fileExtension.includes('xls')) {
        tableMd += `## Sheet: ${name}\n\n`;
      }

      tableMd += '| ' + headerRow.join(' | ') + ' |\n';
      tableMd += '| ' + separatorRow.join(' | ') + ' |\n';

      for (const row of dataRows) {
        tableMd += '| ' + row.join(' | ') + ' |\n';
      }

      sheetMarkdowns.push(tableMd.trim());
    }

    const divider = options.includePageBreaks ? '\n\n---\n\n' : '\n\n';
    return {
      markdown: sheetMarkdowns.join(divider) || '*No tabular data could be extracted*',
      sheetCount: sheetNames.length,
    };
  } catch (error: any) {
    console.error('Spreadsheet conversion error:', error);
    throw new Error(`Failed to convert spreadsheet: ${error.message || 'Invalid tabular format'}`);
  }
}
