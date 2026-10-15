import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware to parse JSON payloads up to 50MB (for base64 files / OCR)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health / Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI OCR & Conversion Endpoint for Scanned Documents / Images / Complex Layouts
app.post('/api/ai-convert', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Client-side conversion is used instead.',
      });
    }

    const { fileName, mimeType, base64Data, instructions } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing base64Data or mimeType' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are an expert document-to-markdown conversion engine.
Please convert the provided document/file ("${fileName || 'document'}") into clean, semantic, well-formatted Markdown (.md).

Rules:
1. Preserve all content, hierarchy, headings (#, ##, ###), lists, blockquotes, code blocks, and tables faithfully.
2. For tables, use standard GitHub Flavored Markdown (GFM) table syntax.
3. If there are mathematical formulas, format them in standard LaTeX ($inline$ or $$display$$).
4. Do NOT wrap the final response in an outer markdown code block (like \`\`\`markdown ... \`\`\`). Return pure, raw Markdown text directly.
5. If the document has multiple slides/pages, clearly delineate them with "---" and a quiet header like "## Page X" or "## Slide X: [Title]".
${instructions ? `Special Instructions: ${instructions}` : ''}
`;

    // Clean base64 if data URI prefix was sent
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
    });

    let markdown = response.text || '';
    // Strip accidental outer ```markdown wrappers if present
    if (markdown.startsWith('```markdown')) {
      markdown = markdown.replace(/^```markdown\n?/, '').replace(/\n?```$/, '');
    } else if (markdown.startsWith('```md')) {
      markdown = markdown.replace(/^```md\n?/, '').replace(/\n?```$/, '');
    }

    res.json({
      success: true,
      markdown,
      fileName,
    });
  } catch (error: any) {
    console.error('AI conversion error:', error);
    res.status(500).json({
      error: error.message || 'Failed to convert document with AI',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
