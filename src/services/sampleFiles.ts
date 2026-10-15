export interface SampleFileItem {
  id: string;
  name: string;
  category: string;
  sizeDesc: string;
  description: string;
  file: File;
}

export function getSampleFiles(): SampleFileItem[] {
  // 1. Financial Spreadsheet (CSV)
  const csvContent = `Quarter,Product Line,Region,Revenue ($M),Growth YoY,Gross Margin (%),Active Customers
Q1 2026,Cloud AI Suite,North America,48.2,+34.2%,78.4%,1420
Q1 2026,Developer APIs,EMEA,29.5,+21.8%,82.1%,2890
Q2 2026,Enterprise Security,APAC,34.1,+44.5%,74.6%,890
Q2 2026,Data Pipelines,Latin America,16.8,+18.2%,71.2%,640
Q3 2026,Cloud AI Suite,North America,56.4,+38.1%,79.1%,1680
Q3 2026,Developer APIs,EMEA,35.2,+26.4%,83.0%,3240
Total / Avg,All Portfolios,Global,220.2,+30.5%,78.1%,10760`;

  const csvFile = new File([csvContent], 'Financial_Forecast_2026.csv', {
    type: 'text/csv',
  });

  // 2. Technical Release Document (HTML)
  const htmlContent = `<!DOCTYPE html>
<html>
<head><title>System Architecture & v4.2 Release Notes</title></head>
<body>
  <h1>Platform Core Architecture 4.2</h1>
  <p>This document specifies the updated distributed worker protocol and storage specifications for the 2026 production tier.</p>
  
  <h2>1. Primary Objectives</h2>
  <ul>
    <li><strong>Sub-50ms Latency:</strong> Regional routing using edge worker clusters.</li>
    <li><strong>Zero-Trust Authorization:</strong> Granular cryptographic token verification on every RPC call.</li>
    <li><strong>Deterministic Serialization:</strong> Universal schema validation for all incoming payloads.</li>
  </ul>

  <h2>2. Configuration Specifications</h2>
  <blockquote>
    All clusters must verify epoch timestamps prior to executing write consensus algorithms.
  </blockquote>

  <table>
    <thead>
      <tr>
        <th>Component</th>
        <th>Runtime</th>
        <th>Memory Limit</th>
        <th>Failover SLA</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ingestion Gateway</td>
        <td>Rust / Axum</td>
        <td>512 MB</td>
        <td>&lt; 250ms</td>
      </tr>
      <tr>
        <td>Transformer Node</td>
        <td>Node.js 22 LTS</td>
        <td>2048 MB</td>
        <td>&lt; 500ms</td>
      </tr>
      <tr>
        <td>Persistence Engine</td>
        <td>PostgreSQL 17</td>
        <td>8192 MB</td>
        <td>&lt; 2.0s</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Example Worker Handler</h2>
  <pre><code>async function handleIngest(request) {
  const payload = await request.json();
  const valid = validateHeader(payload.signature);
  if (!valid) throw new Error("Unauthorized payload");
  return { status: "accepted", queuedAt: Date.now() };
}</code></pre>
</body>
</html>`;

  const htmlFile = new File([htmlContent], 'Architecture_Specs_v4.2.html', {
    type: 'text/html',
  });

  // 3. API Data Catalog (JSON)
  const jsonContent = JSON.stringify(
    [
      {
        endpoint: '/v1/convert/document',
        method: 'POST',
        auth: 'Bearer token',
        maxPayloadMB: 50,
        supportedFormats: ['pdf', 'docx', 'pptx', 'xlsx', 'html'],
        averageLatencyMs: 140,
        status: 'production',
      },
      {
        endpoint: '/v1/convert/batch',
        method: 'POST',
        auth: 'Bearer token',
        maxPayloadMB: 200,
        supportedFormats: ['zip', 'tar', 'multipart'],
        averageLatencyMs: 420,
        status: 'production',
      },
      {
        endpoint: '/v1/ocr/transcribe',
        method: 'POST',
        auth: 'Bearer token',
        maxPayloadMB: 25,
        supportedFormats: ['png', 'jpg', 'webp', 'tiff'],
        averageLatencyMs: 850,
        status: 'beta',
      },
      {
        endpoint: '/v1/export/markdown',
        method: 'GET',
        auth: 'API Key',
        maxPayloadMB: 10,
        supportedFormats: ['md', 'gfm', 'commonmark'],
        averageLatencyMs: 45,
        status: 'production',
      },
    ],
    null,
    2
  );

  const jsonFile = new File([jsonContent], 'API_Endpoints_Catalog.json', {
    type: 'application/json',
  });

  // 4. Executive Strategy Memo (Plain Text with Hierarchy)
  const txtContent = `EXECUTIVE MEMORANDUM: Q3 STRATEGY & ROADMAP
Date: September 2026
Author: Engineering & Product Strategy Team
Status: Approved for Execution

1. EXECUTIVE SUMMARY
Over the past two quarters, enterprise document workflows have shifted heavily toward AI agents and automated knowledge graphs. Plain text Markdown (.md) has emerged as the universal lingua franca for LLM context ingestion, RAG vector indexing, and git-tracked documentation.

2. KEY INITIATIVES FOR Q3
• Privacy-First Browser Execution:
  Eliminate client document upload vulnerabilities by parsing PDF, PPTX, and DOCX 100% locally within client sandboxes.
• High-Fidelity Table Reconstruction:
  Ensure complex multi-column spreadsheets and presentation tables convert into pristine GitHub Flavored Markdown (GFM).
• Dual-Engine Flexibility:
  Provide instant local deterministic parsing with optional server-side multimodal OCR fallback for scanned pages.
• Mobile & Cross-Browser Parity:
  Full responsive touch controls across Firefox, Chromium, Safari, and mobile viewports.

3. RESOURCE ALLOCATION & TARGET DATES
- Phase 1: Core Client Parsers (PDF.js, Mammoth, SheetJS, JSZip) — Complete
- Phase 2: Dual-Pane Live Editor & GFM Preview — Complete
- Phase 3: Batch Zip Packaging & Offline Worker Cache — Complete

4. COMPLIANCE & DATA PRIVACY
All local document parsing operations execute in ephemeral memory; no user documents or files are saved without user consent.`;

  const txtFile = new File([txtContent], 'Executive_Strategy_Memo.txt', {
    type: 'text/plain',
  });

  return [
    {
      id: 'sample-csv',
      name: 'Financial_Forecast_2026.csv',
      category: 'Spreadsheet',
      sizeDesc: '1.2 KB',
      description: 'Tabular financial figures with column alignments and numeric data',
      file: csvFile,
    },
    {
      id: 'sample-html',
      name: 'Architecture_Specs_v4.2.html',
      category: 'Web Markup',
      sizeDesc: '2.4 KB',
      description: 'Semantic HTML with headings, quotes, code block, and tables',
      file: htmlFile,
    },
    {
      id: 'sample-json',
      name: 'API_Endpoints_Catalog.json',
      category: 'Structured Data',
      sizeDesc: '1.8 KB',
      description: 'Structured JSON records converted automatically into a table',
      file: jsonFile,
    },
    {
      id: 'sample-txt',
      name: 'Executive_Strategy_Memo.txt',
      category: 'Document Memo',
      sizeDesc: '1.9 KB',
      description: 'Structured text memo with bullet items and numbered headings',
      file: txtFile,
    },
  ];
}
