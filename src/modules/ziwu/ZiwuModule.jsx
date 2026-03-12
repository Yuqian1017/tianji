import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentShichen, getNextShichen, formatForAI } from './engine.js';
import { ZIWU_LIUZHU, MERIDIAN_ACUPOINTS, WUXING_COLORS } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { ZIWU_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';

// ===== SVG 时辰钟 =====
function MeridianClock({ activeIndex, progress }) {
  const cx = 150, cy = 150, outerR = 130, innerR = 85, textR = 108;
  const n = 12;

  const segments = ZIWU_LIUZHU.map((entry, i) => {
    const startAngle = (i * 30 - 90) * (Math.PI / 180); // 30° per segment, -90 to start at top
    const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
    const isActive = i === activeIndex;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle);
    const y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle);
    const y2i = cy + innerR * Math.sin(startAngle);

    const path = `M${x1o},${y1o} A${outerR},${outerR} 0 0,1 ${x2o},${y2o} L${x1i},${y1i} A${innerR},${innerR} 0 0,0 ${x2i},${y2i} Z`;

    // Text position
    const midAngle = ((i + 0.5) * 30 - 90) * (Math.PI / 180);
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);

    return { path, tx, ty, isActive, entry, color: WUXING_COLORS[entry.wuxing] };
  });

  // Clock hand for progress within current shichen
  const handAngle = ((activeIndex + progress / 100) * 30 - 90) * (Math.PI / 180);
  const handX = cx + (innerR - 10) * Math.cos(handAngle);
  const handY = cy + (innerR - 10) * Math.sin(handAngle);

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
      {/* Segments */}
      {segments.map((seg, i) => (
        <g key={i}>
          <path
            d={seg.path}
            fill={seg.isActive ? seg.color : 'var(--color-surface-dim)'}
            fillOpacity={seg.isActive ? 0.35 : 0.5}
            stroke={seg.isActive ? seg.color : 'var(--color-gold-border)'}
            strokeWidth={seg.isActive ? 2 : 0.5}
          />
          <text x={seg.tx} y={seg.ty} textAnchor="middle" dominantBaseline="middle"
            className={`text-[9px] font-title ${seg.isActive ? 'font-bold' : ''}`}
            fill={seg.isActive ? seg.color : 'var(--color-text-dim)'}
          >
            {seg.entry.shichen}·{seg.entry.organ}
          </text>
        </g>
      ))}
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--color-bg-card)" stroke="var(--color-gold-border)" strokeWidth="0.5" />
      {/* Clock hand */}
      <line x1={cx} y1={cy} x2={handX} y2={handY} stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="var(--color-gold)" />
      {/* Center text */}
      <text x={cx} y={cy - 15} textAnchor="middle" className="text-lg font-title" fill="var(--color-gold)">
        {ZIWU_LIUZHU[activeIndex]?.shichen}时
      </text>
      <text x={cx} y={cy + 5} textAnchor="middle" className="text-[10px] font-body" fill="var(--color-text-dim)">
        {ZIWU_LIUZHU[activeIndex]?.organ}经当令
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" className="text-[9px] font-body" fill="var(--color-text-dim)">
        {ZIWU_LIUZHU[activeIndex]?.hours}
      </text>
    </svg>
  );
}

// ===== 经络详情卡 =====
function MeridianCard({ entry, acupoints }) {
  const color = WUXING_COLORS[entry.wuxing];
  const wuxingCN = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-title" style={{ color }}>{entry.organ}</span>
        <div>
          <div className="text-sm text-[var(--color-gold)] font-title">{entry.meridian}</div>
          <div className="text-xs text-[var(--color-text-dim)]">{entry.hours} · 五行{wuxingCN[entry.wuxing]}</div>
        </div>
      </div>

      <div className="text-sm text-[var(--color-text)] leading-relaxed">{entry.yangsheng}</div>

      <div className="bg-[var(--color-wx-wood)]/10 border border-[var(--color-wx-wood)]/20 rounded-lg p-2">
        <div className="text-xs text-[var(--color-wx-wood)] font-title mb-1">养生建议</div>
        <div className="text-sm text-[var(--color-text)]">{entry.advice}</div>
      </div>

      <div className="bg-[var(--color-cinnabar)]/10 border border-[var(--color-cinnabar)]/20 rounded-lg p-2">
        <div className="text-xs text-[var(--color-cinnabar)] font-title mb-1">易发症状</div>
        <div className="text-sm text-[var(--color-text)]">{entry.illness}</div>
      </div>

      {/* 穴位推荐 */}
      {acupoints && acupoints.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs text-[var(--color-gold-muted)] font-title">推荐穴位</div>
          {acupoints.map((acu, i) => (
            <div key={i} className="bg-[var(--color-surface-dim)] rounded-lg p-2">
              <div className="text-sm font-title text-[var(--color-gold)]">{acu.point}</div>
              <div className="text-xs text-[var(--color-text-dim)]">位置: {acu.location}</div>
              <div className="text-xs text-[var(--color-text)]">功效: {acu.benefit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 十二时辰总览 =====
function FullDayTable({ activeIndex }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--color-surface-dim)] hover:bg-[var(--color-gold-bg)] transition-colors"
      >
        <span className="text-xs font-title text-[var(--color-gold)]">十二时辰总览</span>
        <span className="text-xs text-[var(--color-text-dim)]">{expanded ? '▴' : '▾'}</span>
      </button>
      {expanded && (
        <div className="divide-y divide-[var(--color-surface-border)]">
          {ZIWU_LIUZHU.map((entry, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-xs ${i === activeIndex ? 'bg-[var(--color-gold-bg)]' : ''}`}>
              <span className="w-6 font-title" style={{ color: WUXING_COLORS[entry.wuxing] }}>{entry.shichen}</span>
              <span className="w-20 text-[var(--color-text-dim)]">{entry.hours}</span>
              <span className="w-6 text-[var(--color-gold)]">{entry.organ}</span>
              <span className="flex-1 text-[var(--color-text)] truncate">{entry.advice}</span>
              {i === activeIndex && <span className="text-[var(--color-gold)]">← 当前</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 主组件 =====
export default function ZiwuModule({
  aiConfig, setShowSettings, upsertHistory,
  activeHistoryId, setActiveHistoryId,
  pendingHistoryLoad, clearPendingHistoryLoad,
}) {
  // --- 时间状态 ---
  const [now, setNow] = useState(new Date());
  const [shichenData, setShichenData] = useState(() => getCurrentShichen());

  // --- AI ---
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const chatEndRef = useRef(null);
  const historyIdRef = useRef(activeHistoryId || crypto.randomUUID());

  // Real-time clock update every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      setShichenData(getCurrentShichen(d));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  // Load from history
  useEffect(() => {
    if (pendingHistoryLoad?.module === 'ziwu') {
      const d = pendingHistoryLoad;
      if (d.chatMessages) setChatMessages(d.chatMessages);
      historyIdRef.current = activeHistoryId || crypto.randomUUID();
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad]);

  const { index: activeIndex, entry: activeEntry, progress } = shichenData;
  const acupoints = MERIDIAN_ACUPOINTS[activeEntry?.organ] || [];
  const nextEntry = getNextShichen(activeIndex);

  // AI interpretation
  const handleAI = useCallback(async () => {
    const key = getActiveApiKey(aiConfig);
    if (!key) { setShowSettings(true); return; }

    const userText = formatForAI(now);
    const msgs = [{ role: 'user', content: userText }];
    setIsStreaming(true);
    setStreamingText('');

    try {
      let full = '';
      await aiInterpret(aiConfig, ZIWU_SYSTEM_PROMPT, msgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [
        { role: 'user', content: userText },
        { role: 'assistant', content: full },
      ];
      setChatMessages(finalMsgs);
      setStreamingText('');

      upsertHistory(historyIdRef.current, `${activeEntry.shichen}时·${activeEntry.organ}经`,
        { module: 'ziwu', result: { shichen: activeEntry, time: now.toISOString() } }, finalMsgs);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [aiConfig, now, activeEntry, setShowSettings, upsertHistory]);

  // Follow-up
  const handleFollowUp = useCallback(async (text) => {
    const key = getActiveApiKey(aiConfig);
    if (!key) { setShowSettings(true); return; }
    if (!text.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMsgs);
    setFollowUpInput('');
    setIsStreaming(true);
    setStreamingText('');

    try {
      let full = '';
      await aiInterpret(aiConfig, ZIWU_SYSTEM_PROMPT, newMsgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [...newMsgs, { role: 'assistant', content: full }];
      setChatMessages(finalMsgs);
      setStreamingText('');
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [aiConfig, chatMessages, setShowSettings]);

  // Time display
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="space-y-4 font-body">
      <ModuleIntro
        moduleId="ziwu"
        origin="源于《黄帝内经·灵枢》经脉理论，金元时期何若愚系统化。根据十二经脉与十二时辰的对应关系，指导不同时段的养生活动。"
        strengths="实时经络养生指导 · 最佳服药/进食时间 · 穴位按揉时机 · 作息规律调整"
      />

      {/* 时辰钟 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
        <div className="text-center text-xs text-[var(--color-text-dim)] mb-1">
          当前时间 <span className="text-[var(--color-gold)] font-title text-sm">{timeStr}</span>
        </div>
        <MeridianClock activeIndex={activeIndex} progress={progress} />
        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-[var(--color-text-dim)]">
            <span>{activeEntry.shichen}时进度</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-[var(--color-surface-dim)] rounded-full overflow-hidden mt-0.5">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, backgroundColor: WUXING_COLORS[activeEntry.wuxing] }} />
          </div>
          <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
            下一时辰: {nextEntry.shichen}时 ({nextEntry.hours}) · {nextEntry.organ}经
          </div>
        </div>
      </div>

      {/* 当令经络详情 */}
      <MeridianCard entry={activeEntry} acupoints={acupoints} />

      {/* 十二时辰总览 */}
      <FullDayTable activeIndex={activeIndex} />

      {/* AI 按钮 + 对话 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
        {chatMessages.length === 0 && !isStreaming && (
          <button
            onClick={handleAI}
            className="w-full py-2.5 bg-[var(--color-gold)] text-white rounded-lg text-sm font-title hover:opacity-90 transition-opacity"
          >
            AI 养生解读
          </button>
        )}

        {(chatMessages.length > 0 || isStreaming) && (
          <>
            <div className="text-xs text-[var(--color-gold-muted)] mb-2 font-title">AI 养生建议</div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {chatMessages.filter(m => m.role === 'assistant').map((msg, i) => (
                <div key={i} className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              ))}
              {isStreaming && streamingText && (
                <div className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{streamingText}<span className="animate-pulse">▌</span></div>
              )}
              {isStreaming && !streamingText && (
                <div className="text-sm text-[var(--color-text-dim)] animate-pulse">思考中...</div>
              )}
              <div ref={chatEndRef} />
            </div>

            {chatMessages.length >= 2 && !isStreaming && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--color-surface-border)]">
                <input
                  type="text"
                  value={followUpInput}
                  onChange={e => setFollowUpInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFollowUp(followUpInput)}
                  placeholder="继续提问..."
                  className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] font-body"
                />
                <button
                  onClick={() => handleFollowUp(followUpInput)}
                  className="px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity font-body"
                >
                  发送
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
