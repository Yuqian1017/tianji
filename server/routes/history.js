import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/history — list user's history records
router.get('/', (req, res) => {
  const { module } = req.query;

  let rows;
  if (module) {
    rows = db.prepare('SELECT * FROM history WHERE user_id = ? AND module = ? ORDER BY timestamp DESC').all(req.userId, module);
  } else {
    rows = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC').all(req.userId);
  }

  // Parse JSON fields
  const items = rows.map(deserializeRow);
  res.json(items);
});

// GET /api/history/export — export all history as JSON
router.get('/export', (req, res) => {
  const rows = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC').all(req.userId);
  const items = rows.map(deserializeRow);
  res.json(items);
});

// POST /api/history — upsert a single record
router.post('/', (req, res) => {
  const item = req.body;
  if (!item.id || !item.module) {
    return res.status(400).json({ error: 'Missing required fields: id, module' });
  }

  // Check ownership if record exists
  const existing = db.prepare('SELECT user_id FROM history WHERE id = ?').get(item.id);
  if (existing && existing.user_id !== req.userId) {
    return res.status(403).json({ error: '无权修改此记录' });
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO history (id, user_id, timestamp, question, module, throws, result, method, input, chat_messages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    item.id,
    req.userId,
    item.timestamp || Date.now(),
    item.question || '综合运势',
    item.module,
    safeStringify(item.throws),
    safeStringify(item.result),
    safeStringify(item.method),
    safeStringify(item.input),
    safeStringify(item.chatMessages),
  );

  res.json({ ok: true });
});

// DELETE /api/history/all — clear all user history
router.delete('/all', (req, res) => {
  const result = db.prepare('DELETE FROM history WHERE user_id = ?').run(req.userId);
  console.log(`[history] Cleared ${result.changes} records for user ${req.username}`);
  res.json({ deleted: result.changes });
});

// DELETE /api/history/:id — delete one record
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const result = db.prepare('DELETE FROM history WHERE id = ? AND user_id = ?').run(id, req.userId);
  if (result.changes === 0) {
    return res.status(404).json({ error: '记录不存在或无权删除' });
  }

  res.json({ ok: true });
});

// POST /api/history/migrate — bulk import from localStorage
router.post('/migrate', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Expected an array of history items' });
  }

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO history (id, user_id, timestamp, question, module, throws, result, method, input, chat_messages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const migrate = db.transaction((records) => {
    for (const item of records) {
      if (!item.id) continue;
      const result = stmt.run(
        item.id,
        req.userId,
        item.timestamp || Date.now(),
        item.question || '综合运势',
        item.module || 'liuyao',
        safeStringify(item.throws),
        safeStringify(item.result),
        safeStringify(item.method),
        safeStringify(item.input),
        safeStringify(item.chatMessages),
      );
      if (result.changes > 0) inserted++;
    }
  });

  migrate(items);
  console.log(`[history] Migrated ${inserted}/${items.length} records for user ${req.username}`);
  res.json({ inserted, total: items.length });
});

// === Helpers ===

function safeStringify(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
}

function safeParse(val) {
  if (val === null || val === undefined) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

function deserializeRow(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    question: row.question,
    module: row.module,
    throws: safeParse(row.throws),
    result: safeParse(row.result),
    method: safeParse(row.method),
    input: safeParse(row.input),
    chatMessages: safeParse(row.chat_messages),
  };
}

export default router;
