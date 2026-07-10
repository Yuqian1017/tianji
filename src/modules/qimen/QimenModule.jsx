import { useState, useEffect, useCallback, useRef } from 'react';
import { paiQimen, formatForAI } from './engine.js';
import { JIUGONG, JIUXING, BAMEN, WUXING_COLORS, WUXING_CN, SANQI, SHICHEN } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { QIMEN_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import BirthCityPicker from '../../components/BirthCityPicker.jsx';
import { calcCitySolarTimeOffset, adjustBirthTime } from '../../lib/cities.js';

// ===== 排盘动画 =====
function CalculatingAnimation() {
  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-taiji-spin" style={{ transformOrigin: 'center' }}>☯</div>
        <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">排盘中...</div>
      </div>
    </div>
  );
}

// ===== 单个宫位组件 =====
function GongCell({ gong, isCenter, isDayGan, onClickGong }) {
  if (!gong) return null;

  const gongInfo = JIUGONG.find(g => g.num === gong.num);

  const isSanqi = SANQI[gong.tianGan];

  if (isCenter) {
    return (
      <div className="border border-[var(--color-gold-border)] rounded-lg p-2 bg-[var(--color-bg-card)] card-blur flex flex-col items-center justify-center gap-0.5">
        <div className="text-[var(--color-gold)] text-xs font-title">中五宫</div>
        <div className="text-[var(--color-text-dim)] text-xs font-body">
          天{gong.tianGan} 地{gong.diGan}
        </div>
        {gong.star && <div className="text-[var(--color-text-dim)] text-xs font-body">{gong.star}</div>}
        <div className="text-[var(--color-text-dim)] text-[10px] font-body opacity-60">寄坤二宫</div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onClickGong(gong)}
      className={`text-left p-1.5 sm:p-2 rounded-lg border transition-colors hover:border-[var(--color-gold-border)]
        ${isDayGan
          ? 'border-2 border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
          : 'border-[var(--color-surface-border)] bg-[var(--color-bg-card)]'
        }`}
    >
      {/* 宫名 + 方位 */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[var(--color-gold-muted)] text-[10px] font-title">
          {gongInfo?.name}{gong.num}
        </span>
        <span className="text-[var(--color-text-dim)] text-[10px] font-body opacity-50">
          {gongInfo?.dir}
        </span>
      </div>

      {/* 天盘干 + 地盘干 */}
      <div className="flex items-baseline gap-1 mb-0.5">
        <span className={`text-sm font-bold font-body ${isSanqi ? 'text-[var(--color-wx-fire)]' : 'text-[var(--color-text)]'}`}>
          {gong.tianGan}
        </span>
        <span className="text-[var(--color-text-dim)] text-[10px] font-body">/{gong.diGan}</span>
        {isDayGan && <span className="text-[var(--color-gold)] text-[10px] font-body">★我</span>}
      </div>

      {/* 九星 */}
      {gong.star && (
        <div className="text-xs font-body text-[var(--color-text-dim)]">
          {gong.star}{gong.lodgedStar ? `·${gong.lodgedStar}` : ''}
        </div>
      )}

      {/* 八门 */}
      {gong.gate && (
        <div className="text-xs font-body text-[var(--color-text-dim)]">
          {gong.gate}
        </div>
      )}

      {/* 八神 */}
      {gong.shen && (
        <div className="text-[var(--color-text-dim)] text-[10px] font-body opacity-70">
          {gong.shen}
        </div>
      )}
    </button>
  );
}

// ===== 九宫格盘面 =====
function QimenGrid({ result, onClickGong }) {
  if (!result) return null;
  const { gongs, dayGanGong } = result;

  // 九宫格显示顺序 (3×3: 巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6)
  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-2 sm:p-3 overflow-x-auto">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 min-w-[280px]">
        {gridOrder.map(num => (
          <GongCell
            key={num}
            gong={gongs[num]}
            isCenter={num === 5}
            isDayGan={num === dayGanGong}
            onClickGong={onClickGong}
          />
        ))}
      </div>
    </div>
  );
}

// ===== 宫位详情弹窗 =====
function GongDetailModal({ gong, onClose }) {
  if (!gong) return null;

  const starInfo = JIUXING.find(s => s.name === gong.star);
  const gateInfo = BAMEN.find(g => g.name === gong.gate);
  const gongInfo = JIUGONG.find(g => g.num === gong.num);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-gold-border)] rounded-xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--color-gold)] font-title text-lg">
            {gongInfo?.name}{gong.num}宫 · {gongInfo?.dir}
          </h3>
          <button onClick={onClose} className="text-[var(--color-text-dim)] text-xl">×</button>
        </div>

        <div className="space-y-3 font-body text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[var(--color-text-dim)] text-xs">天盘干</span>
              <div className="text-[var(--color-text)] font-bold text-lg">{gong.tianGan}</div>
              {SANQI[gong.tianGan] && <span className="text-[var(--color-wx-fire)] text-xs">{SANQI[gong.tianGan]}</span>}
            </div>
            <div>
              <span className="text-[var(--color-text-dim)] text-xs">地盘干</span>
              <div className="text-[var(--color-text)] font-bold text-lg">{gong.diGan}</div>
              {SANQI[gong.diGan] && <span className="text-[var(--color-wx-fire)] text-xs">{SANQI[gong.diGan]}</span>}
            </div>
          </div>

          <div className="border-t border-[var(--color-surface-border)] pt-2 space-y-1.5">
            {starInfo && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-dim)]">九星</span>
                <span>
                  <span className="text-[var(--color-text)]">
                    {starInfo.name}{gong.lodgedStar ? `·${gong.lodgedStar}` : ''}
                  </span>
                  <span className="text-[var(--color-text-dim)] text-xs ml-1">
                    ({WUXING_CN[starInfo.wuxing]})
                  </span>
                </span>
              </div>
            )}
            {gateInfo && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-dim)]">八门</span>
                <span>
                  <span className="text-[var(--color-text)]">{gateInfo.name}</span>
                  <span className="text-[var(--color-text-dim)] text-xs ml-1">
                    ({WUXING_CN[gateInfo.wuxing]})
                  </span>
                </span>
              </div>
            )}
            {gong.shen && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-dim)]">八神</span>
                <span className="text-[var(--color-text)]">{gong.shen}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--color-text-dim)]">宫位五行</span>
              <span style={{ color: WUXING_COLORS[gongInfo?.wuxing] }}>
                {WUXING_CN[gongInfo?.wuxing] || ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 盘面摘要 =====
function PanSummary({ result }) {
  if (!result) return null;
  const { meta, zhifu, zhishi, gongs, dayGanGong, geju } = result;

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-body">
        <span className="text-[var(--color-gold)]">{meta.dunTypeCn}{meta.juNum}局</span>
        <span className="text-[var(--color-text-dim)]">{meta.jieqi} · {meta.yuan}</span>
        <span className="text-[var(--color-text-dim)]">{meta.dayGZ}日 {meta.hourGZ}时</span>
      </div>
      <div className="text-[10px] text-[var(--color-text-dim)] font-body">
        排盘核心：已按声明流派验证 · 传统格局与 AI 解释：尚未验证
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-body">
        <span className="text-[var(--color-text)]">值符: <span className="text-[var(--color-gold)]">{zhifu}</span></span>
        <span className="text-[var(--color-text)]">值使: <span className="text-[var(--color-gold)]">{zhishi}</span></span>
        {dayGanGong && (
          <span className="text-[var(--color-text)]">
            日干{meta.dayStem}: {gongs[dayGanGong]?.name}{dayGanGong}宫
          </span>
        )}
      </div>
      {geju.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {geju.map((ge, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded font-body bg-[var(--color-surface)] text-[var(--color-text-dim)] border border-[var(--color-surface-border)]">
              {ge.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 分析方向 =====
const DETAIL_SECTIONS = [
  { id: 'structure', label: '盘面结构', prompt: '请按已声明的拆补转盘口径，逐项说明本盘阴阳遁、局数、值符值使与四盘位置。只说明可由盘面直接读取的结构。' },
  { id: 'symbols', label: '传统取象', prompt: '请说明本盘九星、八门、八神在传统文献中的象征含义，明确标注这是文化性解释，不作现实预测。' },
  { id: 'patterns', label: '格局标签', prompt: '请列出程序标记的传统格局及其组合条件，并说明解释层尚未验证，不给出吉凶决策。' },
  { id: 'method', label: '流派口径', prompt: '请解释拆补转盘、中五寄坤二、天禽随天芮这些口径如何影响本盘结果，并指出其他流派可能不同。' },
];

// ===== 主组件 =====
export default function QimenModule({ aiConfig, setShowSettings, upsertHistory, setActiveHistoryId, pendingHistoryLoad, clearPendingHistoryLoad }) {
  // Input state
  const now = new Date();
  const [inputYear, setInputYear] = useState(now.getFullYear());
  const [inputMonth, setInputMonth] = useState(now.getMonth() + 1);
  const [inputDay, setInputDay] = useState(now.getDate());
  const [inputHour, setInputHour] = useState(now.getHours());
  const [inputMinute, setInputMinute] = useState(now.getMinutes());
  const [question, setQuestion] = useState('');
  const [trueSolarEnabled, setTrueSolarEnabled] = useState(false);
  const [birthCity, setBirthCity] = useState(null);

  // Result & AI
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [detailMode, setDetailMode] = useState(false);
  const [sectionResponses, setSectionResponses] = useState({});
  const [selectedGong, setSelectedGong] = useState(null);

  const chatEndRef = useRef(null);
  const historyIdRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  // History load
  useEffect(() => {
    if (!pendingHistoryLoad || pendingHistoryLoad.module !== 'qimen') return;
    const item = pendingHistoryLoad;
    clearPendingHistoryLoad();

    if (item.input) {
      setInputYear(item.input.year || new Date().getFullYear());
      setInputMonth(item.input.month || 1);
      setInputDay(item.input.day || 1);
      setInputHour(item.input.hour ?? 0);
      setInputMinute(item.input.minute ?? 0);
    }
    setQuestion(item.question || '');
    setResult(item.result || null);
    setChatMessages(item.chatMessages || []);
    historyIdRef.current = item.id;
    setError('');
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  // Make AI config
  const makeAiConfig = useCallback(() => ({
    apiKey: getActiveApiKey(aiConfig),
    provider: aiConfig.provider,
    model: aiConfig.model,
  }), [aiConfig]);

  // Save to history
  const saveToHistory = useCallback((msgs) => {
    if (!result) return;
    const id = historyIdRef.current || `qimen-${Date.now()}`;
    historyIdRef.current = id;
    setActiveHistoryId(id);
    upsertHistory(id, question, {
      module: 'qimen',
      result,
      input: result.sourceInput || result.input,
    }, msgs);
  }, [result, question, upsertHistory, setActiveHistoryId]);

  // Paipan
  const handlePaipan = useCallback(() => {
    setCalculating(true);
    setError('');
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setSectionResponses({});
    historyIdRef.current = null;

    setTimeout(() => {
      try {
        let adjYear = inputYear;
        let adjMonth = inputMonth;
        let adjDay = inputDay;
        let adjHour = inputHour;
        let adjMinute = inputMinute;
        let solarOffset = null;
        let solarCorrection = null;
        if (trueSolarEnabled && birthCity) {
          solarCorrection = calcCitySolarTimeOffset(
            birthCity,
            { year: inputYear, month: inputMonth, day: inputDay, hour: inputHour, minute: inputMinute },
          );
          solarOffset = solarCorrection.offsetMinutes;
          ({ year: adjYear, month: adjMonth, day: adjDay, hour: adjHour, minute: adjMinute } = adjustBirthTime(
            inputYear,
            inputMonth,
            inputDay,
            inputHour,
            inputMinute,
            solarOffset,
          ));
        }
        const r = paiQimen(adjYear, adjMonth, adjDay, adjHour, adjMinute);
        r.sourceInput = {
          year: inputYear,
          month: inputMonth,
          day: inputDay,
          hour: inputHour,
          minute: inputMinute,
        };
        if (solarOffset !== null) {
          r._trueSolar = {
            city: birthCity.name,
            offset: solarOffset,
            timeZone: solarCorrection.timeZone,
            utcOffsetMinutes: solarCorrection.utcOffsetMinutes,
            original: r.sourceInput,
            adjusted: r.input,
          };
        }
        setResult(r);

        // Prepare initial message for AI
        const text = formatForAI(r, question);
        const initialMsg = { role: 'user', content: `${question ? `希望了解: ${question}\n\n` : ''}以下是奇门遁甲排盘结果，请按文化学习材料说明其结构与传统取象：\n\n${text}` };
        setChatMessages([initialMsg]);

        // Save to history
        const id = `qimen-${Date.now()}`;
        historyIdRef.current = id;
        setActiveHistoryId(id);
        upsertHistory(id, question || '盘面学习', {
          module: 'qimen',
          result: r,
          input: r.sourceInput,
        }, [initialMsg]);
      } catch (e) {
        setError(`排盘出错: ${e.message}`);
        console.error('Qimen paipan error:', e);
      } finally {
        setCalculating(false);
      }
    }, 600);
  }, [inputYear, inputMonth, inputDay, inputHour, inputMinute, question, trueSolarEnabled, birthCity, upsertHistory, setActiveHistoryId]);

  // Ask AI
  const askAI = useCallback(async () => {
    if (aiLoading || !chatMessages.length) return;
    const apiKey = getActiveApiKey(aiConfig);
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setError('');
    try {
      const fullText = await aiInterpret(makeAiConfig(), QIMEN_SYSTEM_PROMPT, chatMessages, (text) => {
        setStreamingText(text);
      });
      const finalMsgs = [...chatMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMsgs);
      setStreamingText('');
      saveToHistory(finalMsgs);
    } catch (e) {
      setError(`AI解读失败: ${e.message}`);
      console.error('AI interpret error:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiConfig, chatMessages, makeAiConfig, saveToHistory, setShowSettings]);

  // Follow-up
  const askFollowUp = useCallback(async () => {
    if (aiLoading || !followUpInput.trim()) return;
    const apiKey = getActiveApiKey(aiConfig);
    if (!apiKey) { setShowSettings(true); return; }

    setAiLoading(true);
    setError('');
    const userMsg = { role: 'user', content: followUpInput.trim() };
    setFollowUpInput('');
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);

    try {
      const fullText = await aiInterpret(makeAiConfig(), QIMEN_SYSTEM_PROMPT, updated, (text) => {
        setStreamingText(text);
      });
      const finalMsgs = [...updated, { role: 'assistant', content: fullText }];
      setChatMessages(finalMsgs);
      setStreamingText('');
      saveToHistory(finalMsgs);
    } catch (e) {
      setError(`AI回复失败: ${e.message}`);
      console.error('AI follow-up error:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiConfig, followUpInput, chatMessages, makeAiConfig, saveToHistory, setShowSettings]);

  // Section analysis
  const askSection = useCallback(async (section) => {
    if (aiLoading) return;
    const apiKey = getActiveApiKey(aiConfig);
    if (!apiKey) { setShowSettings(true); return; }

    setAiLoading(true);
    setError('');
    const userMsg = { role: 'user', content: section.prompt };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);

    try {
      const fullText = await aiInterpret(makeAiConfig(), QIMEN_SYSTEM_PROMPT, updated, (text) => {
        setStreamingText(text);
      });
      const finalMsgs = [...updated, { role: 'assistant', content: fullText }];
      setChatMessages(finalMsgs);
      setStreamingText('');
      setSectionResponses(prev => ({ ...prev, [section.id]: true }));
      saveToHistory(finalMsgs);
    } catch (e) {
      setError(`AI分析失败: ${e.message}`);
      console.error('AI section error:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiConfig, chatMessages, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askFollowUp(); }
  }, [askFollowUp]);

  const reset = useCallback(() => {
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setError('');
    setSectionResponses({});
    historyIdRef.current = null;
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Use current time button
  const useNow = useCallback(() => {
    const n = new Date();
    setInputYear(n.getFullYear());
    setInputMonth(n.getMonth() + 1);
    setInputDay(n.getDate());
    setInputHour(n.getHours());
    setInputMinute(n.getMinutes());
  }, []);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const isInitialAskVisible = result && !hasAIResponse && !aiLoading && !streamingText;

  const daysInMonth = new Date(inputYear, inputMonth, 0).getDate();
  const yearOptions = [];
  for (let y = 2027; y >= 1920; y--) yearOptions.push(y);

  // Hour → shichen label
  const hourBranchIdx = inputHour === 23 ? 0 : Math.floor((inputHour + 1) / 2) % 12;
  const shichenLabel = SHICHEN[hourBranchIdx]?.branch || '';

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="qimen"
        origin="相传黄帝战蚩尤时九天玄女所授，经姜太公、张良、诸葛亮传承，明代刘伯温集大成。以天地人神四盘叠加九宫，号称「帝王之术」。"
        strengths={['拆补法起局', '天地人神四盘', '值符值使定位', '九星八门八神学习']}
      />

      {/* 输入面板 */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[var(--color-gold)] text-sm font-medium font-title">起课时间</label>
          <button
            onClick={useNow}
            className="text-[var(--color-gold-muted)] text-xs border border-[var(--color-surface-border)] rounded px-2 py-1 hover:border-[var(--color-gold-border)] transition-colors font-body"
          >
            用当前时间
          </button>
        </div>

        {/* 日期行 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">年</label>
            <select value={inputYear} onChange={e => setInputYear(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5 text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">月</label>
            <select value={inputMonth} onChange={e => setInputMonth(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5 text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm">
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">日</label>
            <select value={Math.min(inputDay, daysInMonth)} onChange={e => setInputDay(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5 text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm">
              {Array.from({ length: daysInMonth }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}日</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">时 ({shichenLabel}时)</label>
            <select value={inputHour} onChange={e => setInputHour(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5 text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm">
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}时</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">分</label>
            <select value={inputMinute} onChange={e => setInputMinute(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5 text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm">
              {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}分</option>)}
            </select>
          </div>
        </div>

        {/* 问题输入 */}
        <div className="mb-3">
          <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">求测事项（可选）</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="如：这个盘的值符值使怎样定位？"
            className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-4 py-3 text-[var(--color-text)]
              placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body"
          />
        </div>

        {/* 高级设置 */}
        <div className="mb-3">
          <button
            onClick={() => setDetailMode(!detailMode)}
            className="text-[var(--color-text-dim)] text-xs font-body flex items-center gap-1 hover:text-[var(--color-gold-muted)] transition-colors"
          >
            <span className={`transition-transform ${detailMode ? 'rotate-90' : ''}`}>▸</span>
            高级设置
          </button>
          {detailMode && (
            <div className="mt-2 p-3 bg-[var(--color-surface-dim)] rounded-lg border border-[var(--color-surface-border)] space-y-3">
              {/* True Solar Time (optional for Qimen) */}
              <BirthCityPicker
                enabled={trueSolarEnabled}
                onToggle={setTrueSolarEnabled}
                city={birthCity}
                onCityChange={setBirthCity}
                dateParts={{ year: inputYear, month: inputMonth, day: inputDay, hour: inputHour, minute: inputMinute }}
              />
              <div className="text-[10px] text-[var(--color-text-dim)] font-body">
                部分派别使用真太阳时起课，可根据需要开启
              </div>
            </div>
          )}
        </div>

        {/* 排盘按钮 */}
        <button
          onClick={handlePaipan}
          disabled={calculating}
          className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
            hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
        >
          起局排盘
        </button>

        {result && (
          <button onClick={reset}
            className="mt-2 w-full px-6 py-2 border border-[var(--color-surface-border-med)] text-[var(--color-text-dim)] rounded-lg
              hover:bg-[var(--color-surface-dim)] transition-colors text-sm font-body">
            重新起局
          </button>
        )}
      </section>

      {/* 排盘动画 */}
      {calculating && <CalculatingAnimation />}

      {/* 盘面摘要 */}
      {result && !calculating && <PanSummary result={result} />}

      {/* 九宫格 */}
      {result && !calculating && <QimenGrid result={result} onClickGong={setSelectedGong} />}

      {/* AI 解读 */}
      {result && !calculating && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">AI 解读</h3>
            {isInitialAskVisible && (
              <button onClick={askAI}
                className="bg-[var(--color-gold-bg)] text-[var(--color-gold)] px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body">
                请求 AI 解读
              </button>
            )}
          </div>

          <div className="space-y-4">
            {chatMessages.map((msg, i) => {
              if (i === 0 && msg.role === 'user') return null;
              if (msg.role === 'user') {
                return (
                  <div key={i} className="border-l-2 border-[var(--color-gold)] pl-3 py-1">
                    <div className="text-[var(--color-gold)] text-xs mb-1 font-body">追问</div>
                    <div className="text-[var(--color-text)] text-sm font-body">{msg.content}</div>
                  </div>
                );
              }
              return (
                <div key={i} className="text-[var(--color-text)] text-sm leading-relaxed whitespace-pre-wrap font-body">
                  {msg.content}
                </div>
              );
            })}

            {streamingText && (
              <div className="text-[var(--color-text)] text-sm leading-relaxed whitespace-pre-wrap font-body">
                {streamingText}
              </div>
            )}

            {aiLoading && !streamingText && (
              <span className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">解读中...</span>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 分项分析按钮 */}
          {detailMode && hasAIResponse && !aiLoading && (
            <div className="mt-4 pt-4 border-t border-[var(--color-gold-border-light)]">
              <div className="text-xs text-[var(--color-text-dim)] mb-2 font-body">点击查看各方面详细分析：</div>
              <div className="flex flex-wrap gap-2">
                {DETAIL_SECTIONS.map(section => {
                  const done = !!sectionResponses[section.id];
                  return (
                    <button key={section.id} onClick={() => askSection(section)} disabled={aiLoading}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-body
                        ${done
                          ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-bg-faint)]'
                          : 'border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)]'
                        }`}>
                      {section.label}{done && ' ✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 追问输入 */}
          {hasAIResponse && !aiLoading && (
            <div className={`${detailMode ? 'mt-3' : 'mt-4'} pt-4 border-t border-[var(--color-gold-border-light)] flex gap-2`}>
              <input type="text" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown} placeholder="继续追问，如：庚在哪个方位？"
                className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
                  placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-gold-border-med)] focus:outline-none transition-colors font-body" />
              <button onClick={askFollowUp} disabled={!followUpInput.trim()}
                className="px-4 py-2 bg-[var(--color-gold-bg)] text-[var(--color-gold)] rounded-lg text-sm
                  hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-30 transition-colors whitespace-nowrap font-body">
                发送
              </button>
            </div>
          )}

          {hasAIResponse && aiLoading && (
            <div className="mt-4 pt-4 border-t border-[var(--color-gold-border-light)]">
              <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">回答中...</div>
            </div>
          )}

          {!getActiveApiKey(aiConfig) && !hasAIResponse && (
            <div className="text-[var(--color-text-dim)] text-xs font-body">
              请先在设置中输入 API Key 以使用 AI 解读功能。
            </div>
          )}
        </section>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-xl p-4 text-[var(--color-cinnabar)] text-sm font-body">
          {error}
        </div>
      )}

      {/* 宫位详情弹窗 */}
      {selectedGong && <GongDetailModal gong={selectedGong} onClose={() => setSelectedGong(null)} />}
    </div>
  );
}
