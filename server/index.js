import express from 'express';
import authRoutes from './routes/auth.js';
import historyRoutes from './routes/history.js';

const app = express();
const PORT = 5821;

// Parse JSON bodies (history records with chatMessages can be large)
app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`[server] 天机卷 API running on http://localhost:${PORT}`);
});
