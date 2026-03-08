import { useState, useCallback } from 'react';
import { formatTimestamp } from '../lib/history.js';

const MODULE_LABELS = {
  liuyao: '六爻',
  meihua: '梅花',
};

export default function HistoryDrawer({ show, history, onClose, onLoad, onDelete, activeModule }) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  if (!show && !closing) return null;

  // Filter history by active module (show all if no filter)
  const filtered = activeModule
    ? history.filter(item => (item.module || 'liuyao') === activeModule)
    : history;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Drawer panel */}
      <div
        className={`relative w-80 max-w-[85vw] h-full bg-[#0e0d0a] border-l border-[rgba(200,149,108,0.2)] flex flex-col
          ${closing ? 'animate-drawer-out' : 'animate-drawer-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(200,149,108,0.15)]">
          <h2 className="text-[var(--color-gold)] font-bold">卜算历史</h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-[var(--color-text-dim)] text-sm text-center py-12">
              暂无历史记录
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filtered.map((item) => {
                const moduleName = MODULE_LABELS[item.module || 'liuyao'] || item.module;
                // Get display name based on module type
                const guaName = item.module === 'meihua'
                  ? item.result?.benGua?.name
                  : item.result?.benGua?.name;
                const bianName = item.module === 'meihua'
                  ? item.result?.bianGua?.name
                  : item.result?.bianGua?.name;

                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-[rgba(200,149,108,0.05)] cursor-pointer transition-colors group"
                    onClick={() => onLoad(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[var(--color-text-dim)] text-xs">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(200,149,108,0.1)] text-[var(--color-gold)] opacity-70">
                        {moduleName}
                      </span>
                    </div>
                    <div className="text-[var(--color-text)] text-sm truncate mb-1">
                      {item.question || '综合运势'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        {guaName && (
                          <span className="text-[var(--color-gold)]">{guaName}</span>
                        )}
                        {bianName && (
                          <>
                            <span className="text-[var(--color-text-dim)] mx-1">→</span>
                            <span className="text-[var(--color-jade)]">{bianName}</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="text-[var(--color-text-dim)] hover:text-[var(--color-cinnabar)] text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1"
                      >
                        删除
                      </button>
                    </div>
                    {item.chatMessages?.some(m => m.role === 'assistant') && (
                      <div className="text-[var(--color-text-dim)] text-xs mt-1 opacity-60">
                        含 AI 解读
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
