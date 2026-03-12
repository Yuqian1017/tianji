import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tianji-intro-collapsed';

/**
 * ModuleIntro — shared intro card for each divination module.
 * Shows origin/background + what types of questions it's best for.
 * Collapsible, remembers state per-module in localStorage.
 */
export default function ModuleIntro({ moduleId, origin, strengths }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return !!stored[moduleId];
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      stored[moduleId] = collapsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch { /* ignore */ }
  }, [collapsed, moduleId]);

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-surface-border)] rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--color-surface-dim)] transition-colors"
      >
        <span className="text-[var(--color-gold-muted)] text-xs font-title tracking-wide">
          关于此术
        </span>
        <span className={`text-[var(--color-text-dim)] text-xs transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>
          ▾
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2 animate-meihua-reveal">
          {/* Origin */}
          <p className="text-[var(--color-text-dim)] text-xs leading-relaxed font-body">
            <span className="text-[var(--color-gold-muted)] font-medium">源流：</span>
            {origin}
          </p>

          {/* Strengths */}
          <div className="text-[var(--color-text-dim)] text-xs leading-relaxed font-body">
            <span className="text-[var(--color-gold-muted)] font-medium">擅长：</span>
            {Array.isArray(strengths) ? strengths.join(' · ') : strengths}
          </div>
        </div>
      )}
    </div>
  );
}
