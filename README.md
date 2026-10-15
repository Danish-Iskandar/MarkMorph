# MarkMorph — Universal Document to Markdown Converter

**MarkMorph** is a privacy-first, in-browser document conversion engine that transforms documents, spreadsheets, presentations, and code files into clean, standard Markdown (`.md`). It runs client-side in the browser, ensuring your files never leave your machine, with full compatibility across Chromium, Firefox, Safari, and mobile web viewports.

---

### ✨ Key Features

- **🔒 100% Client-Side & Private:** Processes documents directly in browser memory using WebAssembly and JavaScript parsers. Zero telemetry, zero external storage.
- **⚡ Batch Conversion & ZIP Export:** Drag-and-drop multiple files at once, convert them concurrently, and download all generated `.md` files in a single `.zip` archive or individually.
- **🖥️ Dual-Pane Studio:** Side-by-side or tabbed workspace with an editable Markdown source editor (line numbers, search, word/char counters) and a live GitHub Flavored Markdown (GFM) preview.
- **⚙️ Configurable Formatting:**
  - Optional YAML frontmatter metadata (source file, conversion timestamp, file size, section counts).
  - Heading syntax selection (ATX `#` vs. Setext `===`).
  - Bullet list marker choices (`-`, `*`, `+`).
  - Slide/page delimiters and PowerPoint presenter notes extraction.
- **🤖 Optional Multimodal AI OCR:** Optional server-side AI fallback powered by Google Gemini 2.5 Flash for transcribing scanned PDFs, whiteboard photos, receipts, and complex formulas.
- **📱 Fully Responsive:** Clean, touch-friendly UI that works seamlessly across desktop and mobile browsers.

---

### 📂 Supported File Formats

| Category | Formats | Processing Details |
| :--- | :--- | :--- |
| **Documents** | `.pdf` | Reconstructs headings via relative font-size hierarchy, paragraph flow, and page breaks. |
| **Word Processing** | `.docx`, `.doc` | Converts styles, tables, nested lists, quotes, bold, and italics. |
| **Presentations** | `.pptx` | Extracts slide titles, nested bullet hierarchies, embedded tables, and speaker notes. |
| **Spreadsheets** | `.xlsx`, `.xls`, `.csv`, `.tsv` | Generates formatted GitHub Flavored Markdown tables for each sheet. |
| **Web & E-Books** | `.html`, `.htm`, `.epub` | Sanitizes markup and transforms chapters, headers, and code blocks into CommonMark. |
| **Data & Code** | `.json`, `.yaml`, `.xml`, source code | Converts record arrays into tables or syntax-highlighted code fences. |
| **Plain Text** | `.txt`, `.rtf`, `.log` | Normalizes paragraphs, indentations, and list indicators. |
| **Images & Scans** | `.png`, `.jpg`, `.jpeg`, `.webp` | Multimodal AI OCR transcription for scanned documents and notes. |

---

### 🛠️ Built With

- **React 19 & TypeScript**
- **Tailwind CSS**
- **PDF.js** (PDF parsing)
- **Mammoth.js & Turndown** (Word & HTML conversion)
- **SheetJS (xlsx)** (Spreadsheets)
- **JSZip** (PPTX/EPUB extraction & batch ZIP export)
- **Express & Google Gen AI SDK** (AI OCR endpoint)
