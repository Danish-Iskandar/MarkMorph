import React from 'react';
import { ShieldCheck, Cpu, Lock, Globe2, Sparkles, CheckCircle2 } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Data Leakage Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Private, Local-First In-Browser Conversion
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            MarkMorph processes files inside your browser's client sandbox. Your proprietary documents,
            spreadsheets, slides, and code never leave your device unless you explicitly opt into multimodal AI features.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Client-Side WASM & JS</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Uses Mozilla's PDF.js, Mammoth, SheetJS, and Turndown directly in browser memory.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Ephemeral Memory</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Documents exist only in memory buffers during the conversion lifecycle and are cleared on page close.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe2 className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Universal Browser Compatibility</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tested for Firefox, Google Chrome, Microsoft Edge, Brave, and mobile iOS Safari & Android Chrome.
            </p>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Deterministic Parsing Pipeline</span>
          </h4>
          <ul className="space-y-2 text-xs text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="text-neutral-500">·</span>
              <span><strong>PDF:</strong> Reconstructs headings based on relative font size distribution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-500">·</span>
              <span><strong>Word (.docx):</strong> Translates Word styles, paragraphs, tables, and nested lists.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-500">·</span>
              <span><strong>PowerPoint (.pptx):</strong> Unzips presentation XML to extract slide titles, bullets, tables, and notes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-500">·</span>
              <span><strong>Spreadsheets (.xlsx / .csv):</strong> Renders clean GitHub Flavored Markdown (GFM) tables.</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Multimodal AI Vision & OCR Tier</span>
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            For scanned paper pages, photos of whiteboards, receipts, or complex scientific formulas, MarkMorph provides an optional server-side multimodal OCR tier via Google Gemini 2.5 Flash.
          </p>
          <div className="pt-2 text-xs text-neutral-400 font-mono">
            <span>Payload limit: </span>
            <span className="text-white font-bold tabular-nums">50 MB</span>
            <span className="mx-2">·</span>
            <span>Latency SLA: </span>
            <span className="text-emerald-400 tabular-nums">~1.2s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
