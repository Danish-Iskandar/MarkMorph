import { ConversionOptions } from '../../types/converter';

export function convertTextToMarkdown(
  content: string,
  fileName: string,
  extension: string,
  options: ConversionOptions
): { markdown: string } {
  const ext = extension.toLowerCase();

  // 1. JSON conversion
  if (ext === 'json') {
    try {
      const parsed = JSON.parse(content);

      // Check if it's an array of flat objects -> convert to Markdown table
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === 'object' &&
        parsed[0] !== null
      ) {
        const keys = Array.from(
          new Set(
            parsed.flatMap((item) =>
              typeof item === 'object' && item !== null ? Object.keys(item) : []
            )
          )
        );

        if (keys.length > 0 && keys.length <= 15) {
          let tableMd = `| ${keys.join(' | ')} |\n`;
          tableMd += `| ${keys.map(() => '---').join(' | ')} |\n`;

          for (const item of parsed) {
            const row = keys.map((k) => {
              const val = item?.[k];
              if (val === undefined || val === null) return '';
              if (typeof val === 'object') return JSON.stringify(val).replace(/\|/g, '\\|');
              return String(val).replace(/\|/g, '\\|').replace(/\n/g, ' ');
            });
            tableMd += `| ${row.join(' | ')} |\n`;
          }

          return { markdown: `## ${fileName.replace(/\.json$/i, '')}\n\n${tableMd}` };
        }
      }

      // Default JSON formatting
      return {
        markdown: `\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``,
      };
    } catch {
      return {
        markdown: `\`\`\`json\n${content}\n\`\`\``,
      };
    }
  }

  // 2. RTF (Rich Text Format)
  if (ext === 'rtf') {
    const plain = cleanRtf(content);
    return { markdown: formatPlainText(plain, options) };
  }

  // 3. Known Programming / Scripting code files
  const codeLanguages: Record<string, string> = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    php: 'php',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    css: 'css',
    scss: 'scss',
    dockerfile: 'dockerfile',
    env: 'properties',
    ini: 'ini',
    toml: 'toml',
  };

  if (codeLanguages[ext]) {
    const lang = codeLanguages[ext];
    return {
      markdown: `### ${fileName}\n\n\`\`\`${lang}\n${content.trim()}\n\`\`\``,
    };
  }

  // 4. Plain text / logs / markdown
  return {
    markdown: formatPlainText(content, options),
  };
}

function cleanRtf(rtf: string): string {
  // Strip RTF header and groups
  let text = rtf.replace(/\\([a-z]{1,32})(-?\d+)? ?/gi, (match, word) => {
    if (word === 'par' || word === 'line') return '\n';
    if (word === 'tab') return '\t';
    return '';
  });

  // Remove curly braces from RTF groups
  text = text.replace(/[{}]/g, '');
  return text.trim();
}

function formatPlainText(raw: string, options: ConversionOptions): string {
  const lines = raw.split(/\r?\n/);
  const formatted: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      formatted.push('');
      continue;
    }

    // Convert bullet-like characters
    if (/^[•–—\*\-]\s+/.test(trimmed)) {
      formatted.push(trimmed.replace(/^[•–—\*\-]\s+/, `${options.bulletStyle} `));
    } else {
      formatted.push(line);
    }
  }

  return formatted.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
