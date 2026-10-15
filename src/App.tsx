/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  Header,
} from './components/Header';
import { DropZone } from './components/DropZone';
import { FileList } from './components/FileList';
import { MarkdownViewer } from './components/MarkdownViewer';
import { ConversionSettingsModal } from './components/ConversionSettingsModal';
import { SupportedFormatsModal } from './components/SupportedFormatsModal';
import { PrivacyNotice } from './components/PrivacyNotice';
import { ConvertedFile, ConversionOptions } from './types/converter';
import { convertFileToMarkdown } from './services/conversionManager';
import { getSampleFiles } from './services/sampleFiles';

const DEFAULT_OPTIONS: ConversionOptions = {
  includeFrontmatter: true,
  headingStyle: 'atx',
  bulletStyle: '-',
  includePageBreaks: true,
  preserveTables: true,
  extractNotes: true,
  useAIIfAvailable: true,
};

export default function App() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFormatsOpen, setIsFormatsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'formats' | 'privacy'>('converter');
  const [aiAvailable, setAiAvailable] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend status / AI availability
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        setAiAvailable(Boolean(data.aiAvailable));
      })
      .catch(() => {
        setAiAvailable(false);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Convert an individual file
  const processFile = useCallback(
    async (fileObj: ConvertedFile, currentOpts: ConversionOptions) => {
      if (!fileObj.originalFile) return;

      setFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: 'converting', progress: 10 } : f))
      );

      try {
        const result = await convertFileToMarkdown(
          fileObj.originalFile,
          currentOpts,
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f))
            );
          }
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? {
                  ...f,
                  status: 'success',
                  progress: 100,
                  markdown: result.markdown,
                  pageCount: result.pageCount,
                  wordCount: result.wordCount,
                  charCount: result.charCount,
                  readingTimeMin: result.readingTimeMin,
                  convertedAt: new Date().toISOString(),
                  usedAi: result.usedAi,
                }
              : f
          )
        );
      } catch (err: any) {
        console.error('Conversion failed for', fileObj.name, err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? {
                  ...f,
                  status: 'error',
                  progress: 0,
                  error: err.message || 'Conversion failed',
                }
              : f
          )
        );
      }
    },
    []
  );

  // Handle new incoming files
  const handleFilesSelected = useCallback(
    async (rawFiles: FileList | File[]) => {
      const fileArray = Array.from(rawFiles);
      if (fileArray.length === 0) return;

      const newConvertedFiles: ConvertedFile[] = fileArray.map((file) => {
        const ext = file.name.includes('.')
          ? file.name.split('.').pop()!.toLowerCase()
          : '';
        return {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: ext,
          status: 'idle',
          progress: 0,
          markdown: '',
          originalFile: file,
        };
      });

      setFiles((prev) => [...prev, ...newConvertedFiles]);

      // Select first file if none selected
      if (!selectedFileId && newConvertedFiles.length > 0) {
        setSelectedFileId(newConvertedFiles[0].id);
      }

      setIsProcessing(true);

      // Process all concurrently
      await Promise.all(
        newConvertedFiles.map((fileItem) => processFile(fileItem, options))
      );

      setIsProcessing(false);

      // Trigger celebratory confetti for batch completion
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#34d399', '#10b981', '#059669'],
        });
      } catch {
        // Ignore confetti if blocked
      }

      showToast(`Processed ${newConvertedFiles.length} file(s)`);
    },
    [options, processFile, selectedFileId]
  );

  // Load sample files
  const handleLoadSamples = useCallback(() => {
    const samples = getSampleFiles();
    const filesToLoad = samples.map((s) => s.file);
    handleFilesSelected(filesToLoad);
    setActiveTab('converter');
  }, [handleFilesSelected]);

  // Download single file
  const handleDownloadFile = useCallback((file: ConvertedFile) => {
    if (!file.markdown) return;
    const blob = new Blob([file.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${file.name.replace(/\.[^/.]+$/, '')}.md`);
  }, []);

  // Download all files as a ZIP archive
  const handleDownloadAllZip = useCallback(async () => {
    const successFiles = files.filter((f) => f.status === 'success' && f.markdown);
    if (successFiles.length === 0) {
      showToast('No converted Markdown files available to export');
      return;
    }

    try {
      const zip = new JSZip();
      const folder = zip.folder('markdown_export');

      for (const file of successFiles) {
        const mdName = `${file.name.replace(/\.[^/.]+$/, '')}.md`;
        folder?.file(mdName, file.markdown);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MarkMorph_Export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${successFiles.length} files as ZIP archive`);
    } catch (err: any) {
      console.error('ZIP generation error:', err);
      showToast('Failed to create ZIP export');
    }
  }, [files]);

  // Retry single file
  const handleRetryFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      processFile(file, options);
    }
  };

  // Convert all pending files
  const handleConvertAll = () => {
    const pending = files.filter((f) => f.status === 'idle' || f.status === 'error');
    if (pending.length === 0) return;
    setIsProcessing(true);
    Promise.all(pending.map((f) => processFile(f, options))).finally(() => {
      setIsProcessing(false);
    });
  };

  // Delete file
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Clear all
  const handleClearAll = () => {
    setFiles([]);
    setSelectedFileId(null);
  };

  // Update markdown in editor
  const handleUpdateMarkdown = (id: string, newMarkdown: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const wordCount = newMarkdown.trim().split(/\s+/).filter(Boolean).length;
          const charCount = newMarkdown.length;
          const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
          return {
            ...f,
            markdown: newMarkdown,
            wordCount,
            charCount,
            readingTimeMin,
          };
        }
        return f;
      })
    );
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Hidden file input triggered by header action */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.tsv,.html,.htm,.epub,.json,.xml,.yaml,.yml,.txt,.rtf,.png,.jpg,.jpeg,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Top Bar Contract (3 zones) */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFormats={() => setIsFormatsOpen(true)}
        onLoadSamples={handleLoadSamples}
        onTriggerUpload={() => fileInputRef.current?.click()}
        hasFiles={files.some((f) => f.status === 'success')}
        onDownloadAllZip={handleDownloadAllZip}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-8 py-6 space-y-6">
        {/* Tab 1: Converter Studio */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {/* Hero / Upload Drop Zone */}
            <DropZone
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              isProcessing={isProcessing}
            />

            {/* Document Queue & Stats */}
            {files.length > 0 && (
              <FileList
                files={files}
                selectedFileId={selectedFileId}
                onSelectFile={setSelectedFileId}
                onDeleteFile={handleDeleteFile}
                onRetryFile={handleRetryFile}
                onDownloadFile={handleDownloadFile}
                onDownloadAllZip={handleDownloadAllZip}
                onClearAll={handleClearAll}
                onConvertAll={handleConvertAll}
                isProcessing={isProcessing}
              />
            )}

            {/* Markdown Workspace & Editor */}
            {files.length > 0 && (
              <div className="pt-2">
                <MarkdownViewer
                  file={selectedFile}
                  onUpdateMarkdown={handleUpdateMarkdown}
                  onDownloadFile={handleDownloadFile}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Supported Formats Matrix */}
        {activeTab === 'formats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Universal Format Matrix
                </h2>
                <p className="text-xs text-neutral-400">
                  Comprehensive listing of client-side and AI-assisted file formats supported by MarkMorph.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('converter')}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Back to Converter
              </button>
            </div>
            <PrivacyNotice />
          </div>
        )}

        {/* Tab 3: Privacy & Architecture Guarantee */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Browser Architecture & Privacy Guarantee
                </h2>
                <p className="text-xs text-neutral-400">
                  Zero telemetry. Zero external database storage. 100% in-browser sandboxed processing.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('converter')}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Back to Converter
              </button>
            </div>
            <PrivacyNotice />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 px-4 sm:px-8 py-5 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">MarkMorph</span>
            <span>·</span>
            <span>Universal Document to Markdown Converter</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>Local WASM & Client Sandbox</span>
            <span>·</span>
            <span>GFM Spec</span>
            <span>·</span>
            <span>Chromium · Firefox · Safari</span>
          </div>
        </div>
      </footer>

      {/* Conversion Settings Dialog */}
      <ConversionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        options={options}
        onChangeOptions={setOptions}
        aiAvailable={aiAvailable}
      />

      {/* Supported Formats Dialog */}
      <SupportedFormatsModal
        isOpen={isFormatsOpen}
        onClose={() => setIsFormatsOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 border border-neutral-700/80 px-4 py-2.5 text-xs font-medium text-white shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
