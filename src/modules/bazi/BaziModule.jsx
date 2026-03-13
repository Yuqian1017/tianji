import { useState, useEffect, useCallback, useRef } from 'react';
import { paiBazi, formatForAI, getShiShen } from './engine.js';
import { STEM_WUXING, BRANCH_WUXING, WUXING_CN, WUXING_ORDER, SHICHEN, SHISHEN_ABBR } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { BAZI_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import BirthCityPicker from '../../components/BirthCityPicker.jsx';
import { calcTrueSolarTimeOffset, adjustBirthTime, formatTrueSolarTime } from '../../lib/cities.js';

// Five-element color mapping (theme CSS variables)
const wuxingColor = {
  metal: 'text-[var(--color-wx-metal)]',
  wood: 'text-[var(--color-wx-wood)]',
  water: 'text-[var(--color-wx-water)]',
  fire: 'text-[var(--color-wx-fire)]',
  earth: 'text-[var(--color-wx-earth)]',
};

const wuxingBgColor = {
  metal: 'bg-[var(--color-wx-metal-bg)]',
  wood: 'bg-[var(--color-wx-wood-bg)]',
  water: 'bg-[var(--color-wx-water-bg)]',
  fire: 'bg-[var(--color-wx-fire-bg)]',
  earth: 'bg-[var(--color-wx-earth-bg)]',
};

// Detailed analysis sections for advanced mode
const DETAIL_SECTIONS = [
  { id: 'caiyun', label: '财运', prompt: '请详细分析此命盘的财运：正财偏财特点、求财方式、财运高低时期、适合的理财方向。' },
  { id: 'shiye', label: '事业', prompt: '请详细分析此命盘的事业运：适合的行业、职业发展路径、贵人方向、创业还是打工更适合。' },
  { id: 'ganqing', label: '感情', prompt: '请详细分析此命盘的感情婚姻：婚姻宫特点、配偶特征、感情稳定性、注意事项。' },
  { id: 'zinv', label: '子女', prompt: '请详细分析此命盘的子女缘：子女星特点、子女数量倾向、与子女关系、教育方向。' },
  { id: 'fumu', label: '父母', prompt: '请详细分析此命盘与父母的关系：印星特点、父母缘分、是否得到父母助力。' },
  { id: 'jiankang', label: '健康', prompt: '请详细分析此命盘的健康：五行偏枯可能影响的身体部位、需要注意的健康问题、养生方向。' },
];

// ===== 排盘中动画 =====
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

// ===== 四柱排盘显示 =====
function BaziDisplay({ result }) {
  if (!result) return null;

  const { pillars, shiShen, hiddenStems, nayin, changsheng, strength, dayun, wuxingCount, interactions, stemCombines, kongWang, shensha } = result;

  const PILLAR_KEYS = ['year', 'month', 'day', 'hour'];
  const PILLAR_LABELS = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };

  // Calculate current age for dayun highlight
  const currentYear = new Date().getFullYear();
  const birthYear = result.birthInfo.year;
  const currentAge = currentYear - birthYear;

  return (
    <div className="space-y-4 animate-meihua-reveal">
      {/* 四柱网格 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 overflow-x-auto">
        <div className="grid grid-cols-4 gap-1 min-w-[300px]">
          {PILLAR_KEYS.map(key => {
            const p = pillars[key];
            const isDay = key === 'day';
            const stemWx = STEM_WUXING[p.stem];
            const branchWx = BRANCH_WUXING[p.branch];
            const hs = hiddenStems[key];

            return (
              <div key={key} className={`text-center rounded-lg p-2 ${isDay
                ? 'border-2 border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
                : 'border border-[var(--color-surface-border)]'
              }`}>
                {/* 柱名 */}
                <div className="text-[var(--color-text-dim)] text-xs mb-1 font-body">
                  {PILLAR_LABELS[key]}
                </div>

                {/* 十神 */}
                <div className={`text-xs mb-1 font-body ${isDay ? 'text-[var(--color-gold)] font-medium' : 'text-[var(--color-text-dim)]'}`}>
                  {shiShen[key]}
                </div>

                {/* 天干 */}
                <div className={`text-2xl font-title mb-0.5 ${wuxingColor[stemWx]}`}>
                  {p.stem}
                </div>

                {/* 地支 */}
                <div className={`text-2xl font-title mb-1 ${wuxingColor[branchWx]}`}>
                  {p.branch}
                </div>

                {/* 藏干 */}
                <div className="text-xs space-y-0.5 border-t border-[var(--color-surface-border)] pt-1 mt-1">
                  {hs.map((h, i) => (
                    <div key={i} className="flex items-center justify-center gap-1">
                      <span className={`${wuxingColor[STEM_WUXING[h.stem]]}`}>{h.stem}</span>
                      <span className="text-[var(--color-text-dim)] text-[10px]">{SHISHEN_ABBR[h.shiShen] || h.shiShen}</span>
                    </div>
                  ))}
                </div>

                {/* 纳音 */}
                <div className="text-[10px] text-[var(--color-text-dim)] mt-1 font-body">
                  {nayin[key]}
                </div>

                {/* 长生 */}
                <div className="text-[10px] text-[var(--color-gold-muted)] font-body">
                  {changsheng[key]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 日主强弱 + 用神 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[var(--color-gold)] font-title">
            日主 {result.dayStem}{WUXING_CN[result.dayMasterWuxing]}
          </span>
          <span className={`text-sm px-2 py-0.5 rounded-full font-body
            ${strength.label === '身旺'
              ? 'bg-[var(--color-wx-fire-bg)] text-[var(--color-wx-fire)]'
              : strength.label === '身弱'
                ? 'bg-[var(--color-wx-water-bg)] text-[var(--color-wx-water)]'
                : 'bg-[var(--color-gold-bg)] text-[var(--color-gold)]'
            }`}>
            {strength.label}
          </span>
          <span className="text-xs text-[var(--color-text-dim)] font-body">
            ({strength.score}/100)
          </span>
        </div>
        <div className="text-sm text-[var(--color-text)] font-body mb-2">
          {strength.yongShenDirection}
        </div>
        <div className="text-xs text-[var(--color-text-dim)] space-y-0.5 font-body">
          {strength.factors.map((f, i) => (
            <div key={i}>• {f}</div>
          ))}
        </div>
      </div>

      {/* 五行统计 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <h4 className="text-[var(--color-gold)] text-sm font-title mb-3">五行分布</h4>
        <div className="space-y-2">
          {WUXING_ORDER.map(wx => {
            const val = wuxingCount[wx];
            const maxVal = Math.max(...Object.values(wuxingCount), 1);
            const pct = (val / maxVal) * 100;
            return (
              <div key={wx} className="flex items-center gap-2">
                <span className={`w-6 text-center text-sm font-body ${wuxingColor[wx]}`}>
                  {WUXING_CN[wx]}
                </span>
                <div className="flex-1 h-4 bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${wuxingBgColor[wx]} ${wuxingColor[wx]}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: `var(--color-wx-${wx})`,
                      opacity: 0.4,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-[var(--color-text-dim)] font-body">
                  {val % 1 === 0 ? val : val.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
        {kongWang.length > 0 && (
          <div className="text-xs text-[var(--color-text-dim)] mt-2 font-body">
            空亡：{kongWang.join('、')}
          </div>
        )}
      </div>

      {/* 地支关系 + 天干合 + 神煞 */}
      {(interactions.length > 0 || stemCombines.length > 0 || shensha.length > 0) && (
        <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
          <h4 className="text-[var(--color-gold)] text-sm font-title mb-2">命局关系</h4>
          <div className="space-y-1 text-sm font-body">
            {interactions.map((rel, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  rel.type === '六合' || rel.type === '三合' || rel.type === '三会'
                    ? 'bg-[var(--color-jade-bg-faint)] text-[var(--color-jade)]'
                    : 'bg-[var(--color-error-bg)] text-[var(--color-cinnabar)]'
                }`}>
                  {rel.type}
                </span>
                <span className="text-[var(--color-text)]">{rel.label}</span>
              </div>
            ))}
            {stemCombines.map((label, i) => (
              <div key={`sc${i}`} className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-jade-bg-faint)] text-[var(--color-jade)]">
                  天干合
                </span>
                <span className="text-[var(--color-text)]">{label}</span>
              </div>
            ))}
            {shensha.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-gold-bg)] text-[var(--color-gold)]">
                  神煞
                </span>
                <span className="text-[var(--color-text)]">{shensha.join('、')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 大运时间线 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <h4 className="text-[var(--color-gold)] text-sm font-title mb-3">大运</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dayun.map((d, i) => {
            const isActive = currentAge >= d.startAge && currentAge <= d.endAge;
            const stemWx = STEM_WUXING[d.stem];
            return (
              <div key={i} className={`flex-shrink-0 text-center rounded-lg p-2 min-w-[70px] border
                ${isActive
                  ? 'border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
                  : 'border-[var(--color-surface-border)]'
                }`}>
                <div className="text-[10px] text-[var(--color-text-dim)] font-body mb-1">
                  {d.startAge}-{d.endAge}岁
                </div>
                <div className={`text-lg font-title ${wuxingColor[stemWx]}`}>
                  {d.stem}{d.branch}
                </div>
                <div className="text-xs text-[var(--color-text-dim)] font-body">
                  {d.shiShen}
                </div>
                <div className="text-[10px] text-[var(--color-text-dim)] font-body mt-0.5">
                  {d.nayin}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== 主组件 =====
export default function BaziModule({
  aiConfig,
  setShowSettings,
  upsertHistory,
  activeHistoryId,
  setActiveHistoryId,
  pendingHistoryLoad,
  clearPendingHistoryLoad,
}) {
  // Input state
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthHour, setBirthHour] = useState(12);
  const [gender, setGender] = useState('male');
  const [question, setQuestion] = useState('');

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);
  const [sectionResponses, setSectionResponses] = useState({});
  const [trueSolarEnabled, setTrueSolarEnabled] = useState(false);
  const [birthCity, setBirthCity] = useState(null);

  // Result state
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // AI chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, streamingText]);

  // Load history
  useEffect(() => {
    if (pendingHistoryLoad && pendingHistoryLoad.module === 'bazi') {
      const item = pendingHistoryLoad;
      setQuestion(item.question || '');
      setResult(item.result || null);
      setChatMessages(item.chatMessages || []);
      if (item.input) {
        setBirthYear(item.input.year || 1990);
        setBirthMonth(item.input.month || 1);
        setBirthDay(item.input.day || 1);
        setBirthHour(item.input.hour || 12);
        setGender(item.input.gender || 'male');
      }
      setError('');
      setStreamingText('');
      setFollowUpInput('');
      setSectionResponses({});
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  // Build AI config object for aiInterpret calls
  const makeAiConfig = useCallback(() => ({
    apiKey: getActiveApiKey(aiConfig),
    provider: aiConfig.provider,
    model: aiConfig.model,
  }), [aiConfig]);

  // Reset
  const reset = useCallback(() => {
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setAiLoading(false);
    setFollowUpInput('');
    setError('');
    setSectionResponses({});
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Calculate paipan
  const handlePaiBan = useCallback(() => {
    setError('');
    setCalculating(true);
    setChatMessages([]);
    setStreamingText('');
    setSectionResponses({});
    setActiveHistoryId(null);

    // Brief animation delay for UX
    setTimeout(() => {
      try {
        let adjYear = birthYear, adjMonth = birthMonth, adjDay = birthDay, adjHour = birthHour, adjMinute = 0;
        if (trueSolarEnabled && birthCity) {
          const offset = calcTrueSolarTimeOffset(birthCity.lng);
          ({ year: adjYear, month: adjMonth, day: adjDay, hour: adjHour, minute: adjMinute } = adjustBirthTime(birthYear, birthMonth, birthDay, birthHour, 0, offset));
        }
        const r = paiBazi(adjYear, adjMonth, adjDay, adjHour, adjMinute, gender);
        // Attach true solar time info to result for display
        if (trueSolarEnabled && birthCity) {
          r._trueSolar = {
            city: birthCity.name,
            offset: calcTrueSolarTimeOffset(birthCity.lng),
            adjusted: { year: adjYear, month: adjMonth, day: adjDay, hour: adjHour, minute: adjMinute },
          };
        }
        setResult(r);
      } catch (e) {
        setError(`排盘失败: ${e.message}`);
        console.error('排盘失败:', e);
      } finally {
        setCalculating(false);
      }
    }, 800);
  }, [birthYear, birthMonth, birthDay, birthHour, gender, trueSolarEnabled, birthCity, setActiveHistoryId]);

  // Helper to save history
  const saveToHistory = useCallback((msgs) => {
    const historyId = activeHistoryId || Date.now().toString();
    setActiveHistoryId(historyId);
    upsertHistory(historyId, question, {
      module: 'bazi',
      input: { year: birthYear, month: birthMonth, day: birthDay, hour: birthHour, minute: 0, gender },
      result,
    }, msgs);
    return historyId;
  }, [activeHistoryId, setActiveHistoryId, upsertHistory, question, birthYear, birthMonth, birthDay, birthHour, gender, result]);

  // AI interpretation
  const askAI = useCallback(async () => {
    if (!result) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }
    setAiLoading(true);
    setStreamingText('');
    setError('');

    const guaText = formatForAI(result, question || '综合运势');
    const userMsg = { role: 'user', content: guaText };
    const messages = [userMsg];

    try {
      const fullText = await aiInterpret(makeAiConfig(), BAZI_SYSTEM_PROMPT, messages, (text) => {
        setStreamingText(text);
      });
      const newChatMessages = [userMsg, { role: 'assistant', content: fullText }];
      setChatMessages(newChatMessages);
      setStreamingText('');
      saveToHistory(newChatMessages);
    } catch (e) {
      setError(`AI解读失败: ${e.message}`);
      console.error('AI解读失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [result, aiConfig, question, makeAiConfig, saveToHistory, setShowSettings]);

  // Follow-up (free text)
  const askFollowUp = useCallback(async () => {
    const trimmed = followUpInput.trim();
    if (!trimmed || aiLoading) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setFollowUpInput('');
    setError('');

    const userMsg = { role: 'user', content: trimmed };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    try {
      const fullText = await aiInterpret(makeAiConfig(), BAZI_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      if (activeHistoryId) {
        saveToHistory(finalMessages);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('AI回答失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, makeAiConfig, saveToHistory, setShowSettings]);

  // Detailed section request
  const askSection = useCallback(async (section) => {
    if (aiLoading) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    const userMsg = { role: 'user', content: section.prompt };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    try {
      const fullText = await aiInterpret(makeAiConfig(), BAZI_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      setSectionResponses(prev => ({ ...prev, [section.id]: true }));
      if (activeHistoryId) {
        saveToHistory(finalMessages);
      }
    } catch (e) {
      setError(`AI分析失败: ${e.message}`);
      console.error('AI section analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiConfig, chatMessages, activeHistoryId, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const isInitialAskVisible = result && !hasAIResponse && !aiLoading && !streamingText;

  // Dynamic day count for month
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();

  // Year range
  const yearOptions = [];
  for (let y = 2027; y >= 1920; y--) yearOptions.push(y);

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="bazi"
        origin="唐代李虚中首创，宋代徐子平完善，又称「子平术」。以出生年月日时的天干地支（八个字）推算一生命运格局。"
        strengths={['一生运势全局（性格、事业、财运、婚姻）', '大运流年走向', '五行喜忌与职业方向', '人生关键节点预判']}
      />

      {/* 出生信息输入 */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-3 font-title">出生信息</label>

        {/* Date row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">年</label>
            <select
              value={birthYear}
              onChange={e => setBirthYear(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5
                text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">月</label>
            <select
              value={birthMonth}
              onChange={e => setBirthMonth(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5
                text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">日</label>
            <select
              value={Math.min(birthDay, daysInMonth)}
              onChange={e => setBirthDay(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5
                text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm"
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}日</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time + Gender row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">时辰</label>
            <select
              value={birthHour}
              onChange={e => setBirthHour(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5
                text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm"
            >
              {SHICHEN.map(sc => (
                <option key={sc.branch} value={sc.hours[0]}>{sc.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">性别</label>
            <div className="flex gap-1 bg-[var(--color-surface-subtle)] rounded-lg p-1 h-[42px]">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 text-sm rounded-md transition-colors font-body
                  ${gender === 'male'
                    ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
              >
                男
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 text-sm rounded-md transition-colors font-body
                  ${gender === 'female'
                    ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
              >
                女
              </button>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-3">
          <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">想了解的方面（可选）</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="如：事业方向、感情运势、财运、健康..."
            className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
              text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
          />
        </div>

        {/* Advanced Settings (collapsible) */}
        <div className="mb-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[var(--color-text-dim)] text-xs hover:text-[var(--color-text)] transition-colors font-body flex items-center gap-1"
          >
            <span className={`transform transition-transform text-[10px] ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            高级设置
          </button>
          {showAdvanced && (
            <div className="mt-2 p-3 bg-[var(--color-surface-dim)] rounded-lg border border-[var(--color-surface-border)] space-y-3">
              {/* True Solar Time */}
              <BirthCityPicker
                enabled={trueSolarEnabled}
                onToggle={setTrueSolarEnabled}
                city={birthCity}
                onCityChange={setBirthCity}
              />

              {/* Detailed mode toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--color-text)] font-body">详细分析模式</div>
                  <div className="text-xs text-[var(--color-text-dim)] font-body">
                    先综合分析，再可分项查看财运、事业、感情等
                  </div>
                </div>
                <button
                  onClick={() => setDetailedMode(!detailedMode)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    detailedMode ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-surface-border-med)]'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    detailedMode ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handlePaiBan}
          disabled={calculating}
          className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
            hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
        >
          排盘
        </button>

        {/* Reset button */}
        {result && (
          <button
            onClick={reset}
            className="mt-2 w-full px-6 py-2 border border-[var(--color-surface-border-med)] text-[var(--color-text-dim)] rounded-lg
              hover:bg-[var(--color-surface-dim)] transition-colors text-sm font-body"
          >
            重新排盘
          </button>
        )}
      </section>

      {/* 排盘动画 */}
      {calculating && <CalculatingAnimation />}

      {/* 真太阳时提示 */}
      {result && !calculating && result._trueSolar && (
        <div className="bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-4 py-2 text-sm font-body">
          <span className="text-[var(--color-gold)]">☀ {formatTrueSolarTime(result._trueSolar.adjusted, result._trueSolar.offset)}</span>
          <span className="text-[var(--color-text-dim)] ml-2">({result._trueSolar.city})</span>
        </div>
      )}

      {/* 排盘结果 */}
      {result && !calculating && <BaziDisplay result={result} />}

      {/* AI解读 + 多轮对话 */}
      {result && !calculating && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">AI 解读</h3>
            {isInitialAskVisible && (
              <button
                onClick={askAI}
                className="bg-[var(--color-gold-bg)] text-[var(--color-gold)] px-4 py-2 rounded-lg text-sm
                  hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
              >
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

          {/* Detailed section tabs */}
          {detailedMode && hasAIResponse && !aiLoading && (
            <div className="mt-4 pt-4 border-t border-[var(--color-gold-border-light)]">
              <div className="text-xs text-[var(--color-text-dim)] mb-2 font-body">点击查看各方面详细分析：</div>
              <div className="flex flex-wrap gap-2">
                {DETAIL_SECTIONS.map(section => {
                  const done = !!sectionResponses[section.id];
                  return (
                    <button
                      key={section.id}
                      onClick={() => askSection(section)}
                      disabled={aiLoading}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-body
                        ${done
                          ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-bg-faint)]'
                          : 'border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)]'
                        }`}
                    >
                      {section.label}
                      {done && ' ✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Follow-up input */}
          {hasAIResponse && !aiLoading && (
            <div className={`${detailedMode ? 'mt-3' : 'mt-4'} pt-4 border-t border-[var(--color-gold-border-light)] flex gap-2`}>
              <input
                type="text"
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="继续追问，如：大运走势如何？"
                className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
                  placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-gold-border-med)] focus:outline-none transition-colors font-body"
              />
              <button
                onClick={askFollowUp}
                disabled={!followUpInput.trim()}
                className="px-4 py-2 bg-[var(--color-gold-bg)] text-[var(--color-gold)] rounded-lg text-sm
                  hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-30 transition-colors whitespace-nowrap font-body"
              >
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

      {/* 节气近似警告 */}
      {result?.isApprox && (
        <div className="bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] rounded-xl p-3 text-[var(--color-gold-muted)] text-xs font-body">
          ⚠️ 该出生年份的节气时间为近似计算（±1天误差），月柱可能有偏差。如需精确排盘，请核对专业万年历。
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-xl p-4 text-[var(--color-cinnabar)] text-sm font-body">
          {error}
        </div>
      )}
    </div>
  );
}
