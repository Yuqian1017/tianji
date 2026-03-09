import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { paiZiwei, formatForAI, solarToLunar } from './engine.js';
import { SHICHEN, WUXING_COLORS, STAR_INFO } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { ZIWEI_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';

// Star wuxing → CSS color mapping using theme variables
const starWuxingColor = (wuxing) => {
  const map = {
    '金': 'var(--color-wx-metal)',
    '木': 'var(--color-wx-wood)',
    '水': 'var(--color-wx-water)',
    '火': 'var(--color-wx-fire)',
    '土': 'var(--color-wx-earth)',
  };
  return map[wuxing] || 'var(--color-text)';
};

// Sihua badge colors
const sihuaBadgeClass = (transform) => {
  switch (transform) {
    case '禄': return 'bg-[var(--color-wx-wood)] text-white';
    case '权': return 'bg-[var(--color-wx-fire)] text-white';
    case '科': return 'bg-[var(--color-wx-water)] text-white';
    case '忌': return 'bg-[var(--color-wx-earth)] text-white';
    default: return 'bg-[var(--color-surface-border)] text-[var(--color-text)]';
  }
};

// Detailed analysis sections
const DETAIL_SECTIONS = [
  { id: 'shiye', label: '事业', prompt: '请详细分析此命盘的事业运：官禄宫星曜特点、适合的行业方向、职业发展路径、事业高峰期。' },
  { id: 'caiyun', label: '财运', prompt: '请详细分析此命盘的财运：财帛宫星曜特点、求财方式、正财偏财、财运高低时期。' },
  { id: 'ganqing', label: '感情', prompt: '请详细分析此命盘的感情婚姻：夫妻宫星曜特点、配偶特征、婚姻走势、注意事项。' },
  { id: 'jiankang', label: '健康', prompt: '请详细分析此命盘的健康运：疾厄宫特点、需注意的身体问题、养生方向。' },
  { id: 'fude', label: '福德', prompt: '请详细分析此命盘的福德宫：精神生活、内心世界、人生享受、修行方向。' },
  { id: 'qianyi', label: '迁移', prompt: '请详细分析此命盘的迁移宫：出外运、异地发展、人际关系、贵人方位。' },
];

// Palace grid position mapping: branch → { row, col }
// Traditional 4×4 layout with center 2×2 for summary
const GRID_POSITIONS = {
  '巳': { row: 0, col: 0 },
  '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 },
  '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 },
  '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 },
  '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 },
  '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 },
  '亥': { row: 3, col: 3 },
};

// ===== Calculating animation =====
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

// ===== Single palace cell =====
function PalaceCell({ palace, onClick }) {
  if (!palace) return <div className="border border-[var(--color-surface-border)] rounded-lg" />;

  const { branch, palaceName, palaceStem, isMingGong, isShenGong, mainStars, auxStars } = palace;

  return (
    <div
      onClick={() => onClick?.(palace)}
      className={`border rounded-lg p-1.5 sm:p-2 cursor-pointer transition-colors
        min-h-[90px] sm:min-h-[110px] flex flex-col
        ${isMingGong
          ? 'border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
          : isShenGong
            ? 'border-dashed border-[var(--color-gold-border)] bg-[var(--color-bg-card)]'
            : 'border-[var(--color-surface-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-gold-border)]'
        }`}
    >
      {/* Palace header */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] sm:text-[10px] text-[var(--color-text-dim)] font-body leading-none">
          {palaceName}
          {isMingGong && <span className="text-[var(--color-gold)]"> ★</span>}
          {isShenGong && <span className="text-[var(--color-gold-muted)]"> ☆</span>}
        </span>
        <span className="text-[9px] sm:text-[10px] text-[var(--color-text-dim)] font-body leading-none">
          {palaceStem}{branch}
        </span>
      </div>

      {/* Main stars */}
      <div className="flex-1 flex flex-col justify-center gap-0.5 min-h-0">
        {mainStars.map((star) => {
          const info = STAR_INFO[star.name];
          const color = info ? starWuxingColor(info.wuxing) : 'var(--color-text)';
          return (
            <div key={star.name} className="flex items-center gap-0.5 leading-tight">
              <span className="text-xs sm:text-sm font-title font-medium" style={{ color }}>
                {star.name}
              </span>
              {star.sihua && (
                <span className={`text-[8px] sm:text-[9px] px-1 rounded leading-tight ${sihuaBadgeClass(star.sihua)}`}>
                  {star.sihua}
                </span>
              )}
            </div>
          );
        })}
        {mainStars.length === 0 && (
          <span className="text-[10px] text-[var(--color-text-dim)] font-body opacity-50">空宫</span>
        )}
      </div>

      {/* Auxiliary stars */}
      {auxStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1 mt-0.5 border-t border-[var(--color-surface-border)] pt-0.5">
          {auxStars.map((star) => (
            <span key={star.name} className="text-[8px] sm:text-[9px] text-[var(--color-text-dim)] font-body leading-tight">
              {star.name}
              {star.sihua && <span className="text-[7px]">({star.sihua})</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 12-palace grid display =====
function PalaceGrid({ result, onPalaceClick }) {
  if (!result) return null;

  const { palaces, mingGong, shenGong, juName, mingGongStars, lunar, hourBranch, gender } = result;

  // Build palace lookup by branch
  const palaceByBranch = {};
  for (const p of palaces) {
    palaceByBranch[p.branch] = p;
  }

  // Grid order: row by row
  const gridBranches = [
    ['巳', '午', '未', '申'],
    ['辰', null, null, '酉'],
    ['卯', null, null, '戌'],
    ['寅', '丑', '子', '亥'],
  ];

  return (
    <div className="space-y-4 animate-meihua-reveal">
      {/* Palace grid */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-2 sm:p-3 overflow-x-auto">
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 min-w-[340px]"
          style={{ gridTemplateRows: 'auto auto auto auto' }}>
          {gridBranches.flat().map((branch, idx) => {
            const row = Math.floor(idx / 4);
            const col = idx % 4;

            // Center 2×2 area: show summary in first cell, skip others
            if (row >= 1 && row <= 2 && col >= 1 && col <= 2) {
              if (row === 1 && col === 1) {
                // Summary cell spanning 2×2
                return (
                  <div key="center" className="col-span-2 row-span-2 border border-[var(--color-gold-border)] rounded-lg p-3 bg-[var(--color-bg-card)] card-blur flex flex-col items-center justify-center gap-1.5"
                    style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}>
                    <div className="text-[var(--color-gold)] font-title text-sm sm:text-base font-medium">
                      紫微斗数命盘
                    </div>
                    <div className="text-[var(--color-text)] text-xs font-body text-center">
                      {lunar.lunarYearDisplay}{lunar.lunarMonthDisplay}{lunar.lunarDayDisplay}
                    </div>
                    <div className="text-[var(--color-text)] text-xs font-body">
                      {hourBranch}时 · {gender === 'male' ? '男' : '女'}命
                    </div>
                    <div className="text-[var(--color-gold-muted)] text-xs font-body">
                      {juName} · 命宫{mingGong.branch}
                    </div>
                    <div className="text-xs text-[var(--color-text-dim)] font-body">
                      命宫主星：{mingGongStars.length > 0 ? mingGongStars.join(' ') : '空宫'}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-dim)] font-body">
                      身宫在{shenGong.palaceName}（{shenGong.branch}）
                    </div>
                  </div>
                );
              }
              // Skip other center cells
              return null;
            }

            const palace = palaceByBranch[branch];
            return (
              <PalaceCell
                key={branch}
                palace={palace}
                onClick={onPalaceClick}
              />
            );
          }).filter(Boolean)}
        </div>
      </div>

      {/* Four Transformations summary */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <h4 className="text-[var(--color-gold)] text-sm font-title mb-2">本命四化（{result.lunar.yearStem}干）</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(result.sihua).map(([starName, transform]) => {
            const starBranch = result.allStarPositions[starName];
            const palaceName = starBranch ? result.branchToPalace[starBranch] : '?';
            return (
              <div key={starName} className="text-center">
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mb-1 ${sihuaBadgeClass(transform)}`}>
                  化{transform}
                </span>
                <div className="text-xs font-title text-[var(--color-text)]">{starName}</div>
                <div className="text-[10px] text-[var(--color-text-dim)] font-body">{palaceName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dayun timeline */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <h4 className="text-[var(--color-gold)] text-sm font-title mb-3">
          大运（{result.dayunForward ? '顺行' : '逆行'}）
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {result.dayun.map((d, i) => {
            const currentYear = new Date().getFullYear();
            const birthYear = result.solar.year;
            const currentAge = currentYear - birthYear;
            const isActive = currentAge >= d.startAge && currentAge <= d.endAge;
            return (
              <div key={i} className={`flex-shrink-0 text-center rounded-lg p-2 min-w-[70px] border
                ${isActive
                  ? 'border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
                  : 'border-[var(--color-surface-border)]'
                }`}>
                <div className="text-[10px] text-[var(--color-text-dim)] font-body mb-1">
                  {d.startAge}-{d.endAge}岁
                </div>
                <div className="text-lg font-title text-[var(--color-text)]">
                  {d.stem}{d.branch}
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

// ===== Palace detail modal =====
function PalaceDetailModal({ palace, result, onClose }) {
  if (!palace) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--color-gold)] font-title text-base">
            {palace.palaceName}（{palace.palaceStem}{palace.branch}）
            {palace.isMingGong && <span className="ml-1">★命宫</span>}
            {palace.isShenGong && <span className="ml-1 text-[var(--color-gold-muted)]">☆身宫</span>}
          </h3>
          <button onClick={onClose} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] text-lg">✕</button>
        </div>

        {/* Main stars */}
        {palace.mainStars.length > 0 ? (
          <div className="mb-4">
            <div className="text-xs text-[var(--color-text-dim)] font-body mb-2">主星</div>
            {palace.mainStars.map(star => {
              const info = STAR_INFO[star.name];
              return (
                <div key={star.name} className="flex items-center gap-2 mb-1.5">
                  <span className="text-base font-title" style={{ color: starWuxingColor(info?.wuxing) }}>
                    {star.name}
                  </span>
                  <span className="text-xs text-[var(--color-text-dim)] font-body">
                    {info?.wuxing}{info?.category ? ` · ${info.category}` : ''}
                  </span>
                  {star.sihua && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${sihuaBadgeClass(star.sihua)}`}>
                      化{star.sihua}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-4 text-sm text-[var(--color-text-dim)] font-body">
            空宫（无主星入宫，看对宫借星）
          </div>
        )}

        {/* Auxiliary stars */}
        {palace.auxStars.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-[var(--color-text-dim)] font-body mb-2">辅星</div>
            <div className="flex flex-wrap gap-2">
              {palace.auxStars.map(star => {
                const info = STAR_INFO[star.name];
                const categoryColor = info?.category === '六吉'
                  ? 'text-[var(--color-wx-wood)]'
                  : info?.category === '六煞'
                    ? 'text-[var(--color-cinnabar)]'
                    : 'text-[var(--color-text)]';
                return (
                  <span key={star.name} className={`text-sm font-body ${categoryColor}`}>
                    {star.name}
                    {star.sihua && <span className="text-[10px]">(化{star.sihua})</span>}
                    {info?.category && <span className="text-[10px] text-[var(--color-text-dim)]"> {info.category}</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function ZiweiModule({
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
  const [birthMonth, setBirthMonth] = useState(6);
  const [birthDay, setBirthDay] = useState(15);
  const [birthHour, setBirthHour] = useState('辰');
  const [gender, setGender] = useState('male');
  const [question, setQuestion] = useState('');

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);
  const [sectionResponses, setSectionResponses] = useState({});

  // Result state
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // AI chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [error, setError] = useState('');

  // Palace detail modal
  const [selectedPalace, setSelectedPalace] = useState(null);

  const chatEndRef = useRef(null);

  // Live lunar date preview
  const lunarPreview = useMemo(() => {
    try {
      return solarToLunar(birthYear, birthMonth, birthDay);
    } catch {
      return null;
    }
  }, [birthYear, birthMonth, birthDay]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, streamingText]);

  // Load history
  useEffect(() => {
    if (pendingHistoryLoad && pendingHistoryLoad.module === 'ziwei') {
      const item = pendingHistoryLoad;
      setQuestion(item.question || '');
      setResult(item.result || null);
      setChatMessages(item.chatMessages || []);
      if (item.input) {
        setBirthYear(item.input.year || 1990);
        setBirthMonth(item.input.month || 6);
        setBirthDay(item.input.day || 15);
        setBirthHour(item.input.hourBranch || '辰');
        setGender(item.input.gender || 'male');
      }
      setError('');
      setStreamingText('');
      setFollowUpInput('');
      setSectionResponses({});
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  // Build AI config
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
    setSelectedPalace(null);
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Calculate paipan
  const handlePaiBan = useCallback(() => {
    setError('');
    setCalculating(true);
    setChatMessages([]);
    setStreamingText('');
    setSectionResponses({});
    setSelectedPalace(null);
    setActiveHistoryId(null);

    setTimeout(() => {
      try {
        const r = paiZiwei(birthYear, birthMonth, birthDay, birthHour, gender);
        setResult(r);
      } catch (e) {
        setError(`排盘失败: ${e.message}`);
        console.error('紫微排盘失败:', e);
      } finally {
        setCalculating(false);
      }
    }, 800);
  }, [birthYear, birthMonth, birthDay, birthHour, gender, setActiveHistoryId]);

  // Save history
  const saveToHistory = useCallback((msgs) => {
    const historyId = activeHistoryId || Date.now().toString();
    setActiveHistoryId(historyId);
    upsertHistory(historyId, question, {
      module: 'ziwei',
      input: { year: birthYear, month: birthMonth, day: birthDay, hourBranch: birthHour, gender },
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
      const fullText = await aiInterpret(makeAiConfig(), ZIWEI_SYSTEM_PROMPT, messages, (text) => {
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

  // Follow-up
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
      const fullText = await aiInterpret(makeAiConfig(), ZIWEI_SYSTEM_PROMPT, updatedMessages, (text) => {
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

  // Section request
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
      const fullText = await aiInterpret(makeAiConfig(), ZIWEI_SYSTEM_PROMPT, updatedMessages, (text) => {
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

  // Dynamic day count
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();

  // Year range
  const yearOptions = [];
  for (let y = 2027; y >= 1920; y--) yearOptions.push(y);

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="ziwei"
        origin="相传为五代陈抟（陈希夷）所创，明清广泛流传。以紫微星为主，十四主星落十二宫，号称「天下第一神数」。"
        strengths={['命运格局全景分析（比八字更细致）', '十二宫逐项解读（事业/财运/感情/健康等）', '大运十年周期分析', '四化飞星看人生主题']}
      />

      {/* Input panel */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-3 font-title">出生信息（阳历）</label>

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

        {/* Lunar date preview */}
        {lunarPreview && (
          <div className="mb-3 text-xs text-[var(--color-gold-muted)] font-body bg-[var(--color-surface-dim)] rounded-lg px-3 py-1.5">
            农历：{lunarPreview.lunarYearDisplay}{lunarPreview.isLeapMonth ? '闰' : ''}{lunarPreview.lunarMonthDisplay}{lunarPreview.lunarDayDisplay}
          </div>
        )}

        {/* Hour + Gender row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">时辰</label>
            <select
              value={birthHour}
              onChange={e => setBirthHour(e.target.value)}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-2 py-2.5
                text-[var(--color-text)] input-focus-ring transition-colors font-body text-sm"
            >
              {SHICHEN.map(sc => (
                <option key={sc.branch} value={sc.branch}>{sc.label}</option>
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
            placeholder="如：事业方向、感情运势、财运..."
            className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
              text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
          />
        </div>

        {/* Advanced settings */}
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--color-text)] font-body">详细分析模式</div>
                  <div className="text-xs text-[var(--color-text-dim)] font-body">
                    先综合分析，再可分项查看事业、财运、感情等
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

        {/* Submit */}
        <button
          onClick={handlePaiBan}
          disabled={calculating}
          className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
            hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
        >
          排盘
        </button>

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

      {/* Calculating animation */}
      {calculating && <CalculatingAnimation />}

      {/* Palace grid */}
      {result && !calculating && (
        <PalaceGrid result={result} onPalaceClick={setSelectedPalace} />
      )}

      {/* AI interpretation */}
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
                placeholder="继续追问，如：命宫主星特质？大运走势？"
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

      {/* Leap month warning */}
      {result?.isLeapMonth && (
        <div className="bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] rounded-xl p-3 text-[var(--color-gold-muted)] text-xs font-body">
          ⚠️ 该日期对应农历闰月，不同门派对闰月的处理方式有所不同。本系统按上月计算。
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-xl p-4 text-[var(--color-cinnabar)] text-sm font-body">
          {error}
        </div>
      )}

      {/* Palace detail modal */}
      {selectedPalace && (
        <PalaceDetailModal
          palace={selectedPalace}
          result={result}
          onClose={() => setSelectedPalace(null)}
        />
      )}
    </div>
  );
}
