import { Router } from 'express';
import db from '../db.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { requireAuth } from '../middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (username.length < 2 || username.length > 30) {
    return res.status(400).json({ error: '用户名长度 2-30 个字符' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: '密码至少 4 个字符' });
  }

  // Check uniqueness
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const hash = hashPassword(password);
  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, 'user');

  const token = signToken({ id: result.lastInsertRowid, username, role: 'user' });
  console.log(`[auth] Registered new user: ${username}`);
  res.json({ token, username, role: 'user' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = db.prepare('SELECT id, username, password_hash, role FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role });
  console.log(`[auth] User logged in: ${username}`);
  res.json({ token, username: user.username, role: user.role });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.username, role: req.role });
});

export default router;
