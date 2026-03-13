import { useState } from 'react';
import { apiFetch, setToken } from '../lib/api.js';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      if (password.length < 4) {
        setError('密码至少 4 个字符');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      setToken(data.token);
      onLogin({ username: data.username, role: data.role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-title text-[var(--color-gold)] tracking-wider mb-2">天机卷</h1>
          <p className="text-sm text-[var(--color-text-dim)] font-body">玄学综合工具</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-6">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-[var(--color-surface-border)] overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 px-3 py-2 text-sm font-body transition-colors
                ${mode === 'login'
                  ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 px-3 py-2 text-sm font-body transition-colors
                ${mode === 'register'
                  ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-[var(--color-text-dim)] mb-1 font-body">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="输入用户名"
                autoComplete="username"
                className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] text-sm
                  focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-[var(--color-text-dim)] mb-1 font-body">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="输入密码"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] text-sm
                  focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
              />
            </div>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-[var(--color-text-dim)] mb-1 font-body">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] text-sm
                    focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-sm text-red-400 font-body bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--color-gold-bg)] text-[var(--color-gold)] rounded-lg text-sm font-body font-medium
                hover:bg-[var(--color-gold-bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册')}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-text-dim)] mt-6 font-body opacity-60">
          玄机在握，天道自明
        </p>
      </div>
    </div>
  );
}
