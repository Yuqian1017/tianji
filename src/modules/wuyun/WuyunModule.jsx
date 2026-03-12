import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { analyzeYear, formatForAI, getYearGanZhi } from './engine.js';
import { WUXING_COLORS, QI_INFO, RECENT_YUNQI } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { WUYUN_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';

// ===== 运/气 时间轴条 =====
function Timeline({ items, type }) {
  const isYun = type === 'yun';
  return (
    <div className="space-y-1">
      <div className="text-xs text-[var(--color-gold-muted)] font-title">{isYun ? '五运 (主运 vs 客运)' : '六气 (主气 vs 客气)'}</div>
      <div className="space-y-1">
        {items.map((item, i) => {
          const primaryColor = isYun ? (WUXING_COLORS[item.primary] || '#888') : (QI_INFO[item.primary]?.color || '#888');
          const guestColor = isYun ? (WUXING_COLORS[item.guest] || '#888') : (QI_INFO[item.guest]?.color || '#888');

          return (
            <div key={i} className="flex items-center gap-2 bg-[var(--color-surface-dim)] rounded-lg px-2 py-1.5">
              <div className="w-10 text-[10px] text-[var(--color-text-dim)] shrink-0">{item.stage}</div>
              <div className="flex-1 flex gap-1">
                {/* Primary */}
                <div className="flex-1 rounded px-1.5 py-0.5 text-[10px] text-center" style={{ backgroundColor: primaryColor + '20', color: primaryColor, border: `1px solid ${primaryColor}40` }}>
                  主: {isYun ? item.primary : item.primary.replace(/[厥少太阳明]+/, '').substring(0, 3)}
                </div>
                {/* Guest */}
                <div className="flex-1 rounded px-1.5 py-0.5 text-[10px] text-center" style={{ backgroundColor: guestColor + '20', color: guestColor, border: `1px solid ${guestColor}40` }}>
                  客: {isYun ? `${item.guest}${item.guestExcess !== undefined ? (item.guestExcess ? '↑' : '↓') : ''}` : (item.guest?.replace(/[厥少太阳明]+/, '').substring(0, 3) || '')}
                </div>
              </div>
              <div className="w-20 text-[9px] text-[var(--color-text-dim)] shrink-0 text-right">{item.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== 专题按钮 =====
const DETAIL_SECTIONS = [
  { key: 'spring', label: '春季养生' },
  { key: 'summer', label: '夏季养生' },
  { key: 'autumn', label: '秋季养生' },
  { key: 'winter', label: '冬季养生' },
  { key: 'diet', label: '全年食疗' },
  { key: 'disease', label: '易发疾病' },
];

// ===== 主组件 =====
export default function WuyunModule({
  aiConfig, setShowSettings, upsertHistory,
  activeHistoryId, setActiveHistoryId,
  pendingHistoryLoad, clearPendingHistoryLoad,
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [result, setResult] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // --- AI ---
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [detailSeen, setDetailSeen] = useState({});
  const chatEndRef = useRef(null);
  const historyIdRef = useRef(activeHistoryId || crypto.randomUUID());

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  // Load from history
  useEffect(() => {
    if (pendingHistoryLoad?.module === 'wuyun') {
      const d = pendingHistoryLoad;
      if (d.result) {
        setResult(d.result);
        setYear(d.result.year || currentYear);
        setHasCalculated(true);
      }
      if (d.chatMessages) setChatMessages(d.chatMessages);
      historyIdRef.current = activeHistoryId || crypto.randomUUID();
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const res = analyzeYear(year);
    setResult(res);
    setHasCalculated(true);
    setChatMessages([]);
    setStreamingText('');
    setDetailSeen({});
    historyIdRef.current = crypto.randomUUID();
    setActiveHistoryId(null);
  }, [year, setActiveHistoryId]);

  // AI interpretation
  const handleAI = useCallback(async () => {
    if (!result) return;
    const key = getActiveApiKey(aiConfig);
    if (!key) { setShowSettings(true); return; }

    const userText = formatForAI(result);
    const msgs = [{ role: 'user', content: userText }];
    setIsStreaming(true);
    setStreamingText('');

    try {
      let full = '';
      await aiInterpret(aiConfig, WUYUN_SYSTEM_PROMPT, msgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [{ role: 'user', content: userText }, { role: 'assistant', content: full }];
      setChatMessages(finalMsgs);
      setStreamingText('');

      upsertHistory(historyIdRef.current, `${result.ganZhi.ganzi}年运气`, { module: 'wuyun', result }, finalMsgs);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [result, aiConfig, setShowSettings, upsertHistory]);

  // Follow-up
  const handleFollowUp = useCallback(async (text) => {
    const key = getActiveApiKey(aiConfig);
    if (!key || !text.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMsgs);
    setFollowUpInput('');
    setIsStreaming(true);
    setStreamingText('');

    try {
      let full = '';
      await aiInterpret(aiConfig, WUYUN_SYSTEM_PROMPT, newMsgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      setChatMessages([...newMsgs, { role: 'assistant', content: full }]);
      setStreamingText('');
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [aiConfig, chatMessages]);

  const handleDetail = useCallback((section) => {
    setDetailSeen(prev => ({ ...prev, [section.key]: true }));
    handleFollowUp(`请详细分析${result?.ganZhi?.ganzi || ''}年的${section.label}建议。`);
  }, [result, handleFollowUp]);

  // Year options
  const yearOptions = useMemo(() => Array.from({ length: 30 }, (_, i) => 2020 + i), []);

  return (
    <div className="space-y-4 font-body">
      <ModuleIntro
        moduleId="wuyun"
        origin="源于《黄帝内经·素问》运气七篇大论，是中医天人合一思想的核心理论。以天干地支纪年推算每年的气候变化和疾病流行趋势。"
        strengths="年度气候趋势预测 · 易发疾病提前预防 · 四季饮食调养指导 · 个人健康风险评估"
      />

      {/* 输入区 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-3">
        <div className="text-sm font-title text-[var(--color-gold)]">选择年份</div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] font-body focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}年 ({getYearGanZhi(y).ganzi})</option>)}
            </select>
          </div>
          <button
            onClick={handleCalculate}
            className="px-4 py-2 bg-[var(--color-gold)] text-white rounded-lg text-sm font-title hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            推算运气
          </button>
        </div>

        {/* 速查提示 */}
        {RECENT_YUNQI.find(r => r.year === year) && (
          <div className="text-xs text-[var(--color-text-dim)] bg-[var(--color-surface-dim)] rounded-lg p-2">
            {RECENT_YUNQI.find(r => r.year === year).feature}
          </div>
        )}
      </div>

      {/* 结果 */}
      {hasCalculated && result && (
        <>
          {/* 总览卡 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-2xl font-title text-[var(--color-gold)]">{result.ganZhi.ganzi}年</div>
              <div className="text-sm text-[var(--color-text-dim)]">{result.year}年</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* 大运 */}
              <div className="bg-[var(--color-surface-dim)] rounded-lg p-2">
                <div className="text-[10px] text-[var(--color-text-dim)]">大运</div>
                <div className="text-sm font-title" style={{ color: WUXING_COLORS[result.wuYun?.element] || '#888' }}>
                  {result.wuYun?.label || '—'}
                </div>
              </div>
              {/* 司天 */}
              <div className="bg-[var(--color-surface-dim)] rounded-lg p-2">
                <div className="text-[10px] text-[var(--color-text-dim)]">司天</div>
                <div className="text-xs font-title" style={{ color: result.liuQi?.sitianInfo?.color || '#888' }}>
                  {result.liuQi?.sitian || '—'}
                </div>
              </div>
              {/* 在泉 */}
              <div className="bg-[var(--color-surface-dim)] rounded-lg p-2">
                <div className="text-[10px] text-[var(--color-text-dim)]">在泉</div>
                <div className="text-xs font-title" style={{ color: result.liuQi?.zaiquanInfo?.color || '#888' }}>
                  {result.liuQi?.zaiquan || '—'}
                </div>
              </div>
            </div>

            {/* 重点脏腑 */}
            <div className="mt-3 text-center">
              <span className="text-xs text-[var(--color-text-dim)]">重点关注: </span>
              {result.affectedOrgans.map((o, i) => (
                <span key={i} className="text-xs text-[var(--color-cinnabar)] bg-[var(--color-cinnabar)]/10 px-1.5 py-0.5 rounded-full mx-0.5">{o}</span>
              ))}
            </div>
          </div>

          {/* 五运时间轴 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            <Timeline items={result.yunTimeline} type="yun" />
          </div>

          {/* 六气时间轴 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            <Timeline items={result.qiTimeline} type="qi" />
          </div>

          {/* AI 解读 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            {chatMessages.length === 0 && !isStreaming && (
              <button
                onClick={handleAI}
                className="w-full py-2.5 bg-[var(--color-gold)] text-white rounded-lg text-sm font-title hover:opacity-90 transition-opacity"
              >
                AI 运气解读
              </button>
            )}

            {(chatMessages.length > 0 || isStreaming) && (
              <>
                <div className="text-xs text-[var(--color-gold-muted)] mb-2 font-title">AI 运气分析</div>
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

                {/* 专题 */}
                {chatMessages.length >= 2 && !isStreaming && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[var(--color-surface-border)]">
                    {DETAIL_SECTIONS.map(s => (
                      <button key={s.key} onClick={() => handleDetail(s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${detailSeen[s.key] ? 'bg-[var(--color-gold-bg)] border-[var(--color-gold-border)] text-[var(--color-gold-muted)]' : 'border-[var(--color-gold-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold-bg)]'}`}
                      >{detailSeen[s.key] ? '✓ ' : ''}{s.label}</button>
                    ))}
                  </div>
                )}

                {/* 追问 */}
                {chatMessages.length >= 2 && !isStreaming && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--color-surface-border)]">
                    <input type="text" value={followUpInput}
                      onChange={e => setFollowUpInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFollowUp(followUpInput)}
                      placeholder="继续提问..."
                      className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] font-body"
                    />
                    <button onClick={() => handleFollowUp(followUpInput)}
                      className="px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity font-body"
                    >发送</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
