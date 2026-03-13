import { verifyToken } from './auth.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.id;
    req.username = payload.username;
    req.role = payload.role;
    next();
  } catch (err) {
    console.warn('[auth] Invalid token:', err.message);
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}
