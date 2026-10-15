import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
  FolderArchive,
  Eye,
  FileSpreadsheet,
  FileCode,
  Presentation,
  FileImage,
  BookOpen,
} from 'lucide-react';
import { ConvertedFile } from '../types/converter';

interface FileListProps {
  files: ConvertedFile[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onDownloadFile: (file: ConvertedFile) => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onConvertAll: () => void;
  isProcessing: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  onDeleteFile,
  onRetryFile,
  onDownloadFile,
  onDownloadAllZip,
  onClearAll,
  onConvertAll,
  isProcessing,
}) => {
  if (files.length === 0) return null;

  const successCount = files.filter((f) => f.status === 'success').length;
  const pendingCount = files.filter((f) => f.status === 'idle').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const totalWords = files.reduce((acc, f) => acc + (f.wordCount || 0), 0);

  const getFormatIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['xlsx', 'xls', 'csv', 'tsv'].includes(e)) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
    }
    if (['pptx'].includes(e)) {
      return <Presentation className="h-4 w-4 text-amber-400" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(e)) {
      return <FileImage className="h-4 w-4 text-purple-400" />;
    }
    if (['epub'].includes(e)) {
      return <BookOpen className="h-4 w-4 text-blue-400" />;
    }
    if (['json', 'xml', 'yaml', 'yml', 'html', 'js', 'ts'].includes(e)) {
      return <FileCode className="h-4 w-4 text-cyan-400" />;
    }
    return <FileText className="h-4 w-4 text-emerald-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5">
      {/* Batch Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Document Queue</span>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              ({files.length} {files.length === 1 ? 'file' : 'files'})
            </span>
          </h4>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums">
            <span className="text-emerald-400">{successCount} converted</span>
            {pendingCount > 0 && (
              <>
                <span>·</span>
                <span className="text-neutral-400">{pendingCount} pending</span>
              </>
            )}
            {errorCount > 0 && (
              <>
                <span>·</span>
                <span className="text-rose-400">{errorCount} failed</span>
              </>
            )}
            {totalWords > 0 && (
              <>
                <span>·</span>
                <span className="text-neutral-300">{totalWords.toLocaleString()} words</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={onConvertAll}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Convert Pending</span>
            </button>
          )}

          {successCount > 0 && (
            <button
              onClick={onDownloadAllZip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
            >
              <FolderArchive className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export All (.zip)</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            disabled={isProcessing}
            title="Clear Queue"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* File List Cards */}
      <div className="mt-3 divide-y divide-neutral-800/60 max-h-72 overflow-y-auto pr-1">
        {files.map((file) => {
          const isSelected = selectedFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-neutral-800/70 border-l-2 border-emerald-400 pl-2.5'
                  : 'hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/60">
                  {getFormatIcon(file.extension)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    {file.usedAi && (
                      <span className="text-[10px] text-purple-300 font-mono uppercase tracking-wider">
                        AI
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono tabular-nums">
                    <span>{file.extension.toUpperCase()}</span>
                    <span>·</span>
                    <span>{formatSize(file.size)}</span>
                    {file.status === 'success' && file.wordCount !== undefined && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-300">{file.wordCount} words</span>
                      </>
                    )}
                    {file.pageCount !== undefined && file.pageCount > 1 && (
                      <>
                        <span>·</span>
                        <span>{file.pageCount} pages</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div
                className="flex items-center gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {file.status === 'converting' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="tabular-nums hidden sm:inline">{file.progress}%</span>
                  </div>
                )}

                {file.status === 'success' && (
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready</span>
                    </span>

                    <button
                      onClick={() => onSelectFile(file.id)}
                      title="View Markdown"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onDownloadFile(file)}
                      title="Download .md file"
                      className="p-1.5 text-neutral-300 hover:text-emerald-400 hover:bg-neutral-800 rounded transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {file.status === 'error' && (
                  <div className="flex items-center gap-1.5">
                    <span
                      title={file.error}
                      className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-mono truncate max-w-[120px]"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{file.error || 'Failed'}</span>
                    </span>
                    <button
                      onClick={() => onRetryFile(file.id)}
                      title="Retry conversion"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onDeleteFile(file.id)}
                  title="Remove from queue"
                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
