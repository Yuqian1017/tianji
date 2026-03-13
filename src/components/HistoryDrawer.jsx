import { useState, useCallback } from 'react';
import { formatTimestamp } from '../lib/history.js';

const MODULE_LABELS = {
  liuyao: '六爻',
  meihua: '梅花',
  bazi: '八字',
  ziwei: '紫微',
  qimen: '奇门',
  fengshui: '风水',
  tizhi: '体质',
  ziwu: '子午',
  wuyun: '运气',
  bazihealth: '健康',
  wangzhen: '望诊',
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
                // Qimen: show dunType + juNum + zhifu
                const isQimen = item.module === 'qimen';
                const qimenSummary = isQimen && item.result?.meta
                  ? `${item.result.meta.dunTypeCn}${item.result.meta.juNum}局 · ${item.result.zhifu} · ${item.result.zhishi}`
                  : null;
                // Fengshui: show sitting/facing + geju + yun
                const isFengshui = item.module === 'fengshui';
                const fengshuiSummary = isFengshui && item.result?.meta
                  ? `${item.result.meta.sittingName}山${item.result.meta.facingName}向 · ${item.result.geju?.label || ''} · ${item.result.meta.yunNum}运`
                  : null;
                // Tizhi: primary constitution
                const isTizhi = item.module === 'tizhi';
                const tizhiSummary = isTizhi && item.result?.primary
                  ? `${item.result.primary.name}${item.result.secondary ? ' · ' + item.result.secondary.name : ''}`
                  : null;
                // Ziwu: meridian at time
                const isZiwu = item.module === 'ziwu';
                const ziwuSummary = isZiwu && item.result?.shichen
                  ? `${item.result.shichen.organ}经 · ${item.result.shichen.shichen}`
                  : null;
                // Wuyun: year analysis
                const isWuyun = item.module === 'wuyun';
                const wuyunSummary = isWuyun && item.result?.ganZhi
                  ? `${item.result.ganZhi.ganzi}年 · ${item.result.wuYun?.label || ''}`
                  : null;
                // BaziHealth: pillars + weak elements
                const isBaziHealth = item.module === 'bazihealth';
                const baziHealthSummary = isBaziHealth && item.result?.healthResult
                  ? (item.result.healthResult.weakElements?.length > 0
                    ? `${item.result.healthResult.weakElements.map(e => ({wood:'木',fire:'火',earth:'土',metal:'金',water:'水'}[e])).join('')}偏弱`
                    : '五行均衡')
                  : null;
                // Wangzhen: diagnosis type
                const isWangzhen = item.module === 'wangzhen';
                const wangzhenSummary = isWangzhen && item.input?.type
                  ? ({tongue:'舌诊',face:'面诊',palm:'手诊'}[item.input.type] || '望诊')
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
                        {qimenSummary && (
                          <span className="text-[var(--color-gold)] font-title">{qimenSummary}</span>
                        )}
                        {fengshuiSummary && (
                          <span className="text-[var(--color-gold)] font-title">{fengshuiSummary}</span>
                        )}
                        {tizhiSummary && (
                          <span className="text-[var(--color-gold)] font-title">{tizhiSummary}</span>
                        )}
                        {ziwuSummary && (
                          <span className="text-[var(--color-gold)] font-title">{ziwuSummary}</span>
                        )}
                        {wuyunSummary && (
                          <span className="text-[var(--color-gold)] font-title">{wuyunSummary}</span>
                        )}
                        {baziHealthSummary && (
                          <span className="text-[var(--color-gold)] font-title">{baziHealthSummary}</span>
                        )}
                        {wangzhenSummary && (
                          <span className="text-[var(--color-gold)] font-title">{wangzhenSummary}</span>
                        )}
                        {!isBazi && !isZiwei && !isQimen && !isFengshui && !isTizhi && !isZiwu && !isWuyun && !isBaziHealth && !isWangzhen && guaName && (
                          <span className="text-[var(--color-gold)]">{guaName}</span>
                        )}
                        {!isBazi && !isZiwei && !isQimen && !isFengshui && !isTizhi && !isZiwu && !isWuyun && !isBaziHealth && !isWangzhen && bianName && (
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
