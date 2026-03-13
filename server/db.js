import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'tianji.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// === Create tables ===

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    question TEXT,
    module TEXT NOT NULL,
    throws TEXT,
    result TEXT,
    method TEXT,
    input TEXT,
    chat_messages TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id);
  CREATE INDEX IF NOT EXISTS idx_history_user_module ON history(user_id, module);
`);

// === JWT Secret (auto-generate on first run) ===

function getOrCreateJwtSecret() {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('jwt_secret');
  if (row) return row.value;

  const secret = crypto.randomBytes(64).toString('hex');
  db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('jwt_secret', secret);
  console.log('[db] Generated new JWT secret');
  return secret;
}

export const JWT_SECRET = getOrCreateJwtSecret();

// === Seed accounts ===

function seedAccounts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return; // Already seeded

  console.log('[db] Seeding initial accounts...');

  const junshiHash = bcrypt.hashSync('tianji123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  const insert = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');

  insert.run('junshi', junshiHash, 'user');
  insert.run('admin', adminHash, 'admin');

  console.log('[db] Created accounts: junshi (user), admin (admin)');
}

seedAccounts();

export default db;
