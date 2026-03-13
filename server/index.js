import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5821;

// Parse JSON bodies (history records with chatMessages can be large)
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Production: serve Vite build output ---
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
// SPA fallback: any non-API route → index.html (Express 5 wildcard syntax)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`[server] 天机卷 API running on http://localhost:${PORT}`);
});
