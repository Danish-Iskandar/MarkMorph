import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
  isProcessing: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/[0.04] scale-[1.005]'
            : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.tsv,.html,.htm,.epub,.json,.xml,.yaml,.yml,.txt,.rtf,.png,.jpg,.jpeg,.webp"
          onChange={handleInputChange}
          disabled={isProcessing}
        />

        {/* Central Icon */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 transition-all">
          <UploadCloud className="h-7 w-7" />
        </div>

        {/* Primary Prompt */}
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Drop your files here or{' '}
          <span className="text-emerald-400 underline underline-offset-4 decoration-emerald-500/40 group-hover:decoration-emerald-400">
            browse documents
          </span>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-lg">
          Universal conversion to pristine Markdown (<code className="text-emerald-300 font-mono">.md</code>).
          Runs directly in your browser without uploading to external servers.
        </p>

        {/* Supported formats unboxed text list */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-neutral-400 font-mono">
          <span className="text-neutral-300">PDF</span>
          <span>·</span>
          <span className="text-neutral-300">DOCX / Word</span>
          <span>·</span>
          <span className="text-neutral-300">PPTX / Slides</span>
          <span>·</span>
          <span className="text-neutral-300">XLSX / CSV</span>
          <span>·</span>
          <span className="text-neutral-300">HTML</span>
          <span>·</span>
          <span className="text-neutral-300">EPUB</span>
          <span>·</span>
          <span className="text-neutral-300">JSON / Code</span>
          <span>·</span>
          <span className="text-neutral-300">Images (OCR)</span>
        </div>

        {/* Sample Files Quick Action */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSamples();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/60 hover:border-emerald-700 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Try Sample Demo Documents</span>
          </button>
        </div>
      </div>

      {/* Feature highlights unboxed bar */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900/30 border border-neutral-800/80">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-200">100% Client-Side:</strong> Files processed locally in memory.
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900/30 border border-neutral-800/80">
          <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-200">Instant Speed:</strong> Fast text and table extraction.
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900/30 border border-neutral-800/80">
          <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-200">Cross-Browser:</strong> Chromium, Firefox, Safari & Mobile ready.
          </span>
        </div>
      </div>
    </div>
  );
};
