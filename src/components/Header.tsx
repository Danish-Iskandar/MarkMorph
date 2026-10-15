import React from 'react';
import { FileText, Settings, Sparkles, FolderDown, UploadCloud } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenFormats: () => void;
  onLoadSamples: () => void;
  onTriggerUpload: () => void;
  hasFiles: boolean;
  onDownloadAllZip: () => void;
  activeTab: 'converter' | 'formats' | 'privacy';
  setActiveTab: (tab: 'converter' | 'formats' | 'privacy') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenFormats,
  onLoadSamples,
  onTriggerUpload,
  hasFiles,
  onDownloadAllZip,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('converter');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
            <span>MarkMorph</span>
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('converter')}
            className={`transition-colors hover:text-white pb-0.5 ${
              activeTab === 'converter' ? 'text-white border-b-2 border-emerald-500' : ''
            }`}
          >
            Converter Studio
          </button>
          <button
            onClick={() => {
              setActiveTab('formats');
              onOpenFormats();
            }}
            className={`transition-colors hover:text-white pb-0.5 ${
              activeTab === 'formats' ? 'text-white border-b-2 border-emerald-500' : ''
            }`}
          >
            Supported Formats
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`transition-colors hover:text-white pb-0.5 ${
              activeTab === 'privacy' ? 'text-white border-b-2 border-emerald-500' : ''
            }`}
          >
            Browser Privacy & Engine
          </button>
          <button
            onClick={onLoadSamples}
            className="text-emerald-400/90 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Sample Files</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSettings}
            title="Conversion Settings"
            aria-label="Conversion Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>

          {hasFiles && (
            <button
              onClick={onDownloadAllZip}
              title="Download All as ZIP"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <FolderDown className="h-4 w-4 text-emerald-400" />
              <span>Download ZIP</span>
            </button>
          )}

          <button
            onClick={onTriggerUpload}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Documents</span>
          </button>
        </div>
      </div>
    </header>
  );
};
