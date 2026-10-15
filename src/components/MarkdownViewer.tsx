import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Code2,
  BookOpen,
  Columns,
  Maximize2,
  Minimize2,
  FileText,
  Search,
} from 'lucide-react';
import { ConvertedFile } from '../types/converter';

interface MarkdownViewerProps {
  file: ConvertedFile | null;
  onUpdateMarkdown: (id: string, newMarkdown: string) => void;
  onDownloadFile: (file: ConvertedFile) => void;
}

type ViewMode = 'split' | 'raw' | 'preview';

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  file,
  onUpdateMarkdown,
  onDownloadFile,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  if (!file) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-500 mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-white">No Document Selected</h4>
        <p className="mt-1 text-xs text-neutral-400 max-w-sm">
          Upload or select a converted document from the queue to view, edit, and export its Markdown.
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lineCount = useMemo(() => {
    return file.markdown.split('\n').length;
  }, [file.markdown]);

  return (
    <div
      className={`flex flex-col w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 rounded-xl bg-neutral-950 shadow-2xl overflow-hidden'
          : 'h-[720px]'
      }`}
    >
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900/90">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            {file.extension.toUpperCase()}
          </span>
          <span className="text-neutral-600">/</span>
          <h3 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {file.name.replace(/\.[^/.]+$/, '')}.md
          </h3>
        </div>

        {/* Middle: Clean view mode switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Markdown Code</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Rendered Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search text"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Markdown"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700/60 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDownloadFile(file)}
            title="Download .md"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export .md</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Search Bar if toggled */}
      {showSearch && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-800 bg-neutral-950/60">
          <Search className="h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search within markdown content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Editor & Preview Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Raw Markdown Editor */}
        {(viewMode === 'split' || viewMode === 'raw') && (
          <div
            className={`flex flex-col h-full overflow-hidden ${
              viewMode === 'split' ? 'w-full md:w-1/2 border-r border-neutral-800' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/70 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span>SOURCE MARKDOWN</span>
              <span className="tabular-nums">{lineCount} lines</span>
            </div>

            <div className="flex-1 flex relative overflow-hidden bg-neutral-950/40">
              {/* Line Numbers Gutter */}
              <div
                aria-hidden="true"
                className="select-none py-3 px-2 text-right font-mono text-xs text-neutral-600 bg-neutral-950/60 border-r border-neutral-800/60 w-12 shrink-0 overflow-hidden"
              >
                {Array.from({ length: Math.min(lineCount, 1000) }).map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Text Area */}
              <textarea
                value={file.markdown}
                onChange={(e) => onUpdateMarkdown(file.id, e.target.value)}
                spellCheck={false}
                className="flex-1 resize-none bg-transparent p-3 font-mono text-xs sm:text-sm text-neutral-200 leading-6 focus:outline-none overflow-y-auto selection:bg-emerald-500/20"
                placeholder="Markdown content will appear here..."
              />
            </div>
          </div>
        )}

        {/* Right: Rendered Markdown Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`flex flex-col h-full overflow-hidden ${
              viewMode === 'split' ? 'hidden md:flex md:w-1/2' : 'w-full'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-950/70 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span>GFM PREVIEW</span>
              <span className="text-emerald-400/80">LIVE SYNC</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950/20 prose-dark">
              <MarkdownRenderer content={file.markdown} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status & Telemetry Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-800 bg-neutral-950/90 text-xs text-neutral-400 font-mono tabular-nums">
        <div className="flex items-center gap-3">
          <span>{file.wordCount || 0} words</span>
          <span>·</span>
          <span>{(file.charCount || 0).toLocaleString()} characters</span>
          <span>·</span>
          <span>~{file.readingTimeMin || 1} min read</span>
        </div>

        <div className="flex items-center gap-2">
          {file.pageCount && file.pageCount > 1 && (
            <span>{file.pageCount} sections/pages</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Safe, clean GFM Markdown Renderer
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const elements = useMemo(() => {
    return parseMarkdownToReact(content);
  }, [content]);

  return <div className="space-y-4 text-neutral-200 text-sm leading-relaxed">{elements}</div>;
};

function parseMarkdownToReact(md: string): React.ReactNode[] {
  if (!md) return [<p key="empty" className="text-neutral-500 italic">No content</p>];

  const lines = md.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;

  // Check frontmatter
  if (lines[0]?.trim() === '---') {
    const endIdx = lines.slice(1).findIndex((l) => l.trim() === '---');
    if (endIdx !== -1) {
      const frontmatterLines = lines.slice(1, endIdx + 1);
      elements.push(
        <div
          key="frontmatter"
          className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-xs font-mono text-neutral-400 space-y-1"
        >
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">
            Metadata Frontmatter
          </div>
          {frontmatterLines.map((line, fIdx) => (
            <div key={fIdx} className="text-neutral-300">
              {line}
            </div>
          ))}
        </div>
      );
      i = endIdx + 2;
    }
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Fenced Code Block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div
          key={`code-${i}`}
          className="my-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-mono"
        >
          {lang && (
            <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/60 px-3.5 py-1.5 text-[11px] text-neutral-400">
              <span>{lang}</span>
            </div>
          )}
          <pre className="overflow-x-auto p-4 text-emerald-300/90 leading-5">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 3. Table Block
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        const bodyRows = tableLines.slice(2).map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-200">
                <tr>
                  {headerCells.map((cell, cIdx) => (
                    <th key={cIdx} className="px-4 py-2.5 font-semibold text-neutral-100">
                      {parseInlineFormatting(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-900/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 text-neutral-300 font-mono text-xs tabular-nums">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-neutral-800" />);
      i++;
      continue;
    }

    // 5. Headings (# - ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClasses = [
        '',
        'text-2xl font-bold text-white mt-6 mb-3 tracking-tight border-b border-neutral-800/80 pb-2',
        'text-xl font-semibold text-white mt-5 mb-2.5 tracking-tight',
        'text-lg font-semibold text-neutral-100 mt-4 mb-2',
        'text-base font-semibold text-neutral-200 mt-3 mb-1.5',
        'text-sm font-semibold text-neutral-300 mt-2 mb-1',
        'text-xs font-semibold text-neutral-400 mt-2 mb-1 uppercase tracking-wider',
      ];

      elements.push(
        <div key={`h-${i}`} className={headingClasses[level]}>
          {parseInlineFormatting(text)}
        </div>
      );
      i++;
      continue;
    }

    // 6. Blockquote (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 border-l-2 border-emerald-500/80 text-neutral-300 italic bg-neutral-900/30 py-2 pr-3 rounded-r-lg"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{parseInlineFormatting(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 7. Unordered / Ordered / Task List Items
    if (/^([*+-]|\d+\.)\s+/.test(trimmed)) {
      const listItems: { text: string; checked?: boolean; isTask?: boolean }[] = [];
      while (i < lines.length && /^([*+-]|\d+\.)\s+/.test(lines[i].trim())) {
        let itemText = lines[i].trim().replace(/^([*+-]|\d+\.)\s+/, '');
        const isTask = itemText.startsWith('[ ] ') || itemText.startsWith('[x] ');
        let checked = false;
        if (isTask) {
          checked = itemText.startsWith('[x] ');
          itemText = itemText.replace(/^\[[ x]\]\s+/, '');
        }
        listItems.push({ text: itemText, isTask, checked });
        i++;
      }

      elements.push(
        <ul key={`list-${i}`} className="my-2 space-y-1 pl-5 list-disc text-neutral-300 text-xs sm:text-sm">
          {listItems.map((item, lIdx) => {
            if (item.isTask) {
              return (
                <li key={lIdx} className="list-none flex items-center gap-2 -ml-5">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-800 text-emerald-500"
                  />
                  <span className={item.checked ? 'line-through text-neutral-500' : ''}>
                    {parseInlineFormatting(item.text)}
                  </span>
                </li>
              );
            }
            return <li key={lIdx}>{parseInlineFormatting(item.text)}</li>;
          })}
        </ul>
      );
      continue;
    }

    // 8. Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
        {parseInlineFormatting(trimmed)}
      </p>
    );
    i++;
  }

  return elements;
}

// Parses inline bold, italic, code, links
function parseInlineFormatting(text: string): React.ReactNode {
  // Simple regex replacement split
  const parts: React.ReactNode[] = [];
  let remaining = text;

  // Pattern matches: `code`, **bold**, *italic*, [link](url), ~~strike~~
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|~~[^~]+~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-neutral-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      parts.push(
        <span key={match.index} className="line-through text-neutral-500">
          {token.slice(2, -2)}
        </span>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
