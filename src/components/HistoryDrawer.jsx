import { useState, useCallback } from 'react';
import { formatTimestamp } from '../lib/history.js';

const MODULE_LABELS = {
  liuyao: '六爻',
  meihua: '梅花',
  bazi: '八字',
  ziwei: '紫微',
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
      <div className="absolute inset-0 bg-black/30" />

      {/* Drawer panel */}
      <div
        className={`relative w-80 max-w-[85vw] h-full border-l border-[var(--color-gold-border-light)] flex flex-col
          ${closing ? 'animate-drawer-out' : 'animate-drawer-in'}`}
        style={{ backgroundColor: 'var(--color-drawer-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-gold-border-light)]">
          <h2 className="text-[var(--color-gold)] font-title">卜算历史</h2>
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
            <div className="text-[var(--color-text-dim)] text-sm text-center py-12 font-body">
              暂无历史记录
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-surface-border)]">
              {filtered.map((item) => {
                const moduleName = MODULE_LABELS[item.module || 'liuyao'] || item.module;
                const guaName = item.result?.benGua?.name;
                const bianName = item.result?.bianGua?.name;
                // Bazi: show four pillars summary
                const isBazi = item.module === 'bazi';
                const baziSummary = isBazi && item.result?.pillars
                  ? `${item.result.pillars.year.stem}${item.result.pillars.year.branch} ${item.result.pillars.month.stem}${item.result.pillars.month.branch} ${item.result.pillars.day.stem}${item.result.pillars.day.branch} ${item.result.pillars.hour.stem}${item.result.pillars.hour.branch}`
                  : null;
                // Ziwei: show mingGong main stars summary
                const isZiwei = item.module === 'ziwei';
                const ziweiSummary = isZiwei && item.result?.mingGongStars
                  ? `命宫${item.result.mingGong?.branch || ''} ${item.result.mingGongStars.join(' ') || '空宫'} · ${item.result.juName || ''}`
                  : null;

                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-[var(--color-gold-bg-faint)] cursor-pointer transition-colors group"
                    onClick={() => onLoad(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[var(--color-text-dim)] text-xs font-body">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-gold-bg-faint)] text-[var(--color-gold)] opacity-70 font-body">
                        {moduleName}
                      </span>
                    </div>
                    <div className="text-[var(--color-text)] text-sm truncate mb-1 font-body">
                      {item.question || '综合运势'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        {baziSummary && (
                          <span className="text-[var(--color-gold)] font-title tracking-wider">{baziSummary}</span>
                        )}
                        {ziweiSummary && (
                          <span className="text-[var(--color-gold)] font-title">{ziweiSummary}</span>
                        )}
                        {!isBazi && !isZiwei && guaName && (
                          <span className="text-[var(--color-gold)]">{guaName}</span>
                        )}
                        {!isBazi && !isZiwei && bianName && (
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
                        className="text-[var(--color-text-dim)] hover:text-[var(--color-cinnabar)] text-xs opacity-0 group-hover:opacity-100 transition-opacity px-1 font-body"
                      >
                        删除
                      </button>
                    </div>
                    {item.chatMessages?.some(m => m.role === 'assistant') && (
                      <div className="text-[var(--color-text-dim)] text-xs mt-1 opacity-60 font-body">
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
