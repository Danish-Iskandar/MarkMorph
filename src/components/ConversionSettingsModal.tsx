import React from 'react';
import { X, Sliders, Sparkles, Check, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConversionOptions } from '../types/converter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ConversionOptions;
  onChangeOptions: (newOptions: ConversionOptions) => void;
  aiAvailable: boolean;
}

export const ConversionSettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  options,
  onChangeOptions,
  aiAvailable,
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<ConversionOptions>) => {
    onChangeOptions({ ...options, ...partial });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Conversion Preferences</h3>
              <p className="text-xs text-neutral-400">Configure Markdown output formatting & AI parsing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. YAML Frontmatter */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
            <div>
              <p className="text-xs font-semibold text-white">Include YAML Frontmatter</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Prepends document metadata (title, file size, conversion date, source format) in YAML block.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={options.includeFrontmatter}
              onClick={() => update({ includeFrontmatter: !options.includeFrontmatter })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                options.includeFrontmatter ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  options.includeFrontmatter ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Heading Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white">Heading Syntax</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ headingStyle: 'atx' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                  options.headingStyle === 'atx'
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">ATX Style</div>
                  <div className="font-mono text-[11px] text-emerald-400 mt-0.5"># Header 1</div>
                </div>
                {options.headingStyle === 'atx' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => update({ headingStyle: 'setext' })}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                  options.headingStyle === 'setext'
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-white'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">Setext Style</div>
                  <div className="font-mono text-[11px] text-emerald-400 mt-0.5">Header 1\n===</div>
                </div>
                {options.headingStyle === 'setext' && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* 3. Bullet Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white">List Bullet Marker</label>
            <div className="grid grid-cols-3 gap-2">
              {(['-', '*', '+'] as const).map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => update({ bulletStyle: char })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    options.bulletStyle === char
                      ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400 font-bold'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-sm">{char}</span>
                  <span>dash ({char})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Page & Slide Dividers */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
            <div>
              <p className="text-xs font-semibold text-white">Page & Slide Delineators</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Inserts horizontal dividers (<code className="text-neutral-300">---</code>) and page/slide comments between document sections.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={options.includePageBreaks}
              onClick={() => update({ includePageBreaks: !options.includePageBreaks })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                options.includePageBreaks ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  options.includePageBreaks ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. PPTX Speaker Notes */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
            <div>
              <p className="text-xs font-semibold text-white">Extract Speaker Notes (Presentations)</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Extracts hidden presenter notes in PowerPoint slides into formatted Markdown blockquotes.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={options.extractNotes}
              onClick={() => update({ extractNotes: !options.extractNotes })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                options.extractNotes ? 'bg-emerald-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  options.extractNotes ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 6. AI OCR / Enhancement */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">AI-Assisted OCR & Restructuring</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={options.useAIIfAvailable}
                onClick={() => update({ useAIIfAvailable: !options.useAIIfAvailable })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  options.useAIIfAvailable ? 'bg-purple-600' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    options.useAIIfAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When enabled, complex scanned documents or images automatically utilize multimodal AI (Gemini 2.5 Flash) for mathematical LaTeX extraction, handwritten notes, and structural table reconstruction.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
              {aiAvailable ? (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Gemini AI Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>AI key not configured; fast client parser used</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-neutral-800 bg-neutral-950/80">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
