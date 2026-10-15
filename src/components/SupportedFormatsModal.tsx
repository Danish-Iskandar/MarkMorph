import React, { useState } from 'react';
import { X, Search, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { SUPPORTED_FORMATS } from '../services/conversionManager';
import { SupportedFormatInfo } from '../types/converter';

interface FormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportedFormatsModal: React.FC<FormatsModalProps> = ({ isOpen, onClose }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Document', 'Presentation', 'Spreadsheet', 'Web & Ebook', 'Data & Code', 'Image & OCR'];

  const filtered = SUPPORTED_FORMATS.filter((item) => {
    const matchesCat = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch =
      item.extension.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Supported Formats & Engines</h3>
              <p className="text-xs text-neutral-400">All major document, presentation, and data formats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/30 space-y-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-xs">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search formats by name or extension (e.g., pdf, pptx, xlsx)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder-neutral-500 focus:outline-none w-full"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Formats Grid */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {filtered.map((item) => (
            <div
              key={item.extension}
              className="flex items-start justify-between gap-3 p-3 rounded-xl border border-neutral-800/80 bg-neutral-950/40 hover:bg-neutral-950/70 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    .{item.extension}
                  </span>
                  <span className="text-xs font-semibold text-white">{item.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
              </div>

              {/* Unboxed metadata tags */}
              <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono">
                {item.clientSupported && (
                  <span className="text-emerald-400/90 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Browser</span>
                  </span>
                )}
                {item.aiEnhanced && (
                  <span className="text-purple-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI OCR</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500">
              No formats matched your search query.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/80 shrink-0 text-xs text-neutral-400">
          <span>{filtered.length} formats listed</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
