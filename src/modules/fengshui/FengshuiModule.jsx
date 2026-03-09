import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { paiFengshui, formatForAI, getBenMingGua, findMountain } from './engine.js';
import { JIUGONG, STAR_INFO, STAR_REMEDY, ERSHISI_SHAN, BAZHAI, GUA_TO_GONG, WUXING_CN } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { FENGSHUI_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';

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

// ===== 宫位颜色 =====
function starColor(star) {
  const info = STAR_INFO[star];
  if (!info) return 'text-[var(--color-text-dim)]';
  if (info.nature === '吉') return 'text-[var(--color-wx-wood)]';
  if (info.nature === '凶' || info.nature === '大凶') return 'text-[var(--color-cinnabar)]';
  return 'text-[var(--color-text-dim)]';
}

// ===== 单个宫位 =====
function PalaceCell({ palace, isCenter, onClick }) {
  if (!palace) return null;

  const assessColor = palace.assessment === '吉' ? 'bg-[var(--color-wx-wood)]/20 border-[var(--color-wx-wood)]/40'
    : palace.assessment === '凶' ? 'bg-[var(--color-cinnabar)]/10 border-[var(--color-cinnabar)]/30'
    : 'bg-[var(--color-bg-card)] border-[var(--color-gold-border)]';

  return (
    <div
      className={`border rounded-lg p-2 cursor-pointer card-blur transition-all hover:shadow-md ${assessColor}`}
      onClick={() => onClick(palace)}
    >
      {/* Header: 宫名 + 方位 */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[var(--color-gold)] text-xs font-title">{palace.name}{palace.num}</span>
        <span className="text-[var(--color-text-dim)] text-[10px]">{palace.dir}</span>
      </div>

      {isCenter ? (
        <div className="text-center">
          <div className="text-[var(--color-gold)] text-xs font-title mb-0.5">中五宫</div>
          <div className="text-[var(--color-text-dim)] text-[10px]">
            运{palace.yunStar} 山{palace.shanStar} 向{palace.xiangStar}
          </div>
          <div className="text-[var(--color-text-dim)] text-[10px]">年{palace.yearStar}</div>
        </div>
      ) : (
        <>
          {/* Stars: 运·山·向 */}
          <div className="flex justify-between items-baseline gap-1 text-xs font-body">
            <span className="text-[var(--color-text-dim)]">运<span className={starColor(palace.yunStar)}>{palace.yunStar}</span></span>
            <span className="text-[var(--color-text-dim)]">山<span className={`font-bold ${starColor(palace.shanStar)}`}>{palace.shanStar}</span></span>
            <span className="text-[var(--color-text-dim)]">向<span className={`font-bold ${starColor(palace.xiangStar)}`}>{palace.xiangStar}</span></span>
          </div>
          {/* Year star */}
          <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
            年<span className={starColor(palace.yearStar)}>{STAR_INFO[palace.yearStar]?.short}</span>
          </div>
          {/* Combo badges */}
          {palace.combos.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {palace.combos.slice(0, 2).map((c, i) => (
                <span key={i} className={`text-[9px] px-1 rounded ${
                  c.nature === '吉' ? 'bg-[var(--color-wx-wood)]/20 text-[var(--color-wx-wood)]'
                  : 'bg-[var(--color-cinnabar)]/15 text-[var(--color-cinnabar)]'
                }`}>{c.name}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===== 九宫格 =====
function FengshuiGrid({ palaces, onClickPalace }) {
  // 洛书九宫布局: [巽4,离9,坤2 / 震3,中5,兑7 / 艮8,坎1,乾6]
  const layout = [[4,9,2],[3,5,7],[8,1,6]];
  return (
    <div className="grid grid-cols-3 gap-1.5 min-w-[280px]">
      {layout.flat().map(num => (
        <PalaceCell
          key={num}
          palace={palaces[num]}
          isCenter={num === 5}
          onClick={onClickPalace}
        />
      ))}
    </div>
  );
}

// ===== 宫位详情弹窗 =====
function PalaceDetailModal({ palace, onClose }) {
  if (!palace) return null;
  const gInfo = JIUGONG.find(g => g.num === palace.num);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[var(--color-gold)] font-title text-lg">{palace.name}{palace.num}宫 · {palace.dir}</h3>
          <button onClick={onClose} className="text-[var(--color-text-dim)] hover:text-[var(--color-gold)]">✕</button>
        </div>
        <div className="text-[var(--color-text)] text-sm font-body space-y-2">
          <div>五行: {WUXING_CN[gInfo?.wuxing] || ''}</div>
          <div className="grid grid-cols-2 gap-2">
            <div>运星: <span className={starColor(palace.yunStar)}>{STAR_INFO[palace.yunStar]?.name}</span></div>
            <div>山星: <span className={starColor(palace.shanStar)}>{STAR_INFO[palace.shanStar]?.name}</span></div>
            <div>向星: <span className={starColor(palace.xiangStar)}>{STAR_INFO[palace.xiangStar]?.name}</span></div>
            <div>年星: <span className={starColor(palace.yearStar)}>{STAR_INFO[palace.yearStar]?.name}</span></div>
          </div>
          {palace.combos.length > 0 && (
            <div className="border-t border-[var(--color-surface-border)] pt-2">
              <div className="text-[var(--color-gold-muted)] text-xs mb-1">飞星组合</div>
              {palace.combos.map((c, i) => (
                <div key={i} className={`text-xs ${c.nature === '吉' ? 'text-[var(--color-wx-wood)]' : 'text-[var(--color-cinnabar)]'}`}>
                  {c.name}({c.pairType}): {c.desc}
                </div>
              ))}
            </div>
          )}
          {palace.remedy && (
            <div className="border-t border-[var(--color-surface-border)] pt-2">
              <div className="text-[var(--color-gold-muted)] text-xs mb-1">年星 {STAR_INFO[palace.yearStar]?.short} 建议</div>
              {palace.remedy.remedy && <div className="text-xs text-[var(--color-cinnabar)]">{palace.remedy.remedy}</div>}
              {palace.remedy.avoid && <div className="text-xs text-[var(--color-cinnabar)]">{palace.remedy.avoid}</div>}
              {palace.remedy.enhance && <div className="text-xs text-[var(--color-wx-wood)]">催旺: {palace.remedy.enhance}</div>}
              {palace.remedy.note && <div className="text-xs text-[var(--color-text-dim)]">{palace.remedy.note}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== 24山快选 =====
const SHAN_GROUPS = [
  { label: '北(坎)', items: ['壬','子','癸'] },
  { label: '东北(艮)', items: ['丑','艮','寅'] },
  { label: '东(震)', items: ['甲','卯','乙'] },
  { label: '东南(巽)', items: ['辰','巽','巳'] },
  { label: '南(离)', items: ['丙','午','丁'] },
  { label: '西南(坤)', items: ['未','坤','申'] },
  { label: '西(兑)', items: ['庚','酉','辛'] },
  { label: '西北(乾)', items: ['戌','乾','亥'] },
];

function MountainSelector({ selectedMountain, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {SHAN_GROUPS.map(g => (
        <div key={g.label} className="space-y-0.5">
          <div className="text-[9px] text-[var(--color-text-dim)] text-center">{g.label}</div>
          {g.items.map(name => {
            const m = ERSHISI_SHAN.find(s => s.name === name);
            const isSelected = selectedMountain === name;
            return (
              <button
                key={name}
                onClick={() => onSelect(name, m)}
                className={`w-full text-xs py-1 rounded border transition-all ${
                  isSelected
                    ? 'bg-[var(--color-gold)]/20 border-[var(--color-gold)] text-[var(--color-gold)]'
                    : 'border-[var(--color-surface-border)] text-[var(--color-text)] hover:border-[var(--color-gold-muted)]'
                }`}
              >{name}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ===== 专题分析 =====
const DETAIL_SECTIONS = [
  { id: 'damen', label: '大门', prompt: '请详细分析向方（大门方位）的飞星组合，以及对出入、财运的影响。' },
  { id: 'woshi', label: '主卧', prompt: '请详细分析坐方（主卧方位）的飞星组合，以及对健康、人丁的影响。' },
  { id: 'caiyun', label: '财运', prompt: '请分析哪些宫位最利财运（向星旺星所在），如何催旺财位。' },
  { id: 'jiankang', label: '健康', prompt: '请分析哪些宫位需注意健康问题（二黑五黄所在），如何化解。' },
  { id: 'nianxing', label: '年星', prompt: '请分析今年年飞星叠加后哪些方位需要特别注意和化解。' },
  { id: 'huajie', label: '化解总结', prompt: '请总结各凶位的化解方法和吉位的催旺方法，给出完整布局建议。' },
];

// ===== 主组件 =====
export default function FengshuiModule({
  aiConfig, setShowSettings, upsertHistory, activeHistoryId, setActiveHistoryId,
  pendingHistoryLoad, clearPendingHistoryLoad,
}) {
  // Input state
  const [constructionYear, setConstructionYear] = useState(2024);
  const [dirMode, setDirMode] = useState('mountain'); // 'mountain' | 'degree'
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [sittingDegree, setSittingDegree] = useState(0);
  const [analysisYear, setAnalysisYear] = useState(new Date().getFullYear());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('male');

  // Result & AI
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [sectionResponses, setSectionResponses] = useState({});
  const [selectedPalace, setSelectedPalace] = useState(null);
  const [question, setQuestion] = useState('');

  const historyIdRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  // Make AI config
  const makeAiConfig = useCallback(() => {
    const apiKey = getActiveApiKey(aiConfig);
    return { ...aiConfig, apiKey };
  }, [aiConfig]);

  // Save to history
  const saveToHistory = useCallback((msgs) => {
    if (!result) return;
    const id = historyIdRef.current || `fengshui-${Date.now()}`;
    historyIdRef.current = id;
    setActiveHistoryId(id);
    upsertHistory(id, `${result.meta.sittingName}山${result.meta.facingName}向`, {
      module: 'fengshui',
      result,
      input: result.input,
    }, msgs);
  }, [result, upsertHistory, setActiveHistoryId]);

  // Load history
  useEffect(() => {
    if (!pendingHistoryLoad || pendingHistoryLoad.module !== 'fengshui') return;
    const h = pendingHistoryLoad;
    clearPendingHistoryLoad();

    if (h.result) {
      setResult(h.result);
      setConstructionYear(h.input?.constructionYear ?? 2024);
      setSittingDegree(h.input?.sittingDegree ?? 0);
      setAnalysisYear(h.input?.analysisYear ?? new Date().getFullYear());
      const m = findMountain(h.input?.sittingDegree ?? 0);
      if (m) setSelectedMountain(m.name);
    }
    if (h.chatMessages) setChatMessages(h.chatMessages);
    historyIdRef.current = activeHistoryId;
  }, [pendingHistoryLoad, clearPendingHistoryLoad, activeHistoryId]);

  // Mountain select handler
  const handleMountainSelect = useCallback((name, mountain) => {
    setSelectedMountain(name);
    if (mountain) {
      // Use center of degree range
      const center = mountain.start < mountain.end
        ? (mountain.start + mountain.end) / 2
        : ((mountain.start + mountain.end + 360) / 2) % 360;
      setSittingDegree(Math.round(center * 10) / 10);
    }
  }, []);

  // Degree input handler
  const handleDegreeChange = useCallback((val) => {
    const deg = parseFloat(val) || 0;
    setSittingDegree(deg);
    const m = findMountain(deg);
    if (m) setSelectedMountain(m.name);
    else setSelectedMountain(null);
  }, []);

  // 排盘
  const doPaipan = useCallback(() => {
    setCalculating(true);
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setError('');
    setSectionResponses({});
    historyIdRef.current = null;

    setTimeout(() => {
      try {
        const r = paiFengshui(constructionYear, sittingDegree, analysisYear);
        if (!r) { setError('排盘失败，请检查输入'); setCalculating(false); return; }
        setResult(r);

        // Build initial AI message
        let userText = formatForAI(r);
        if (question.trim()) userText += `\n\n用户提问: ${question.trim()}`;
        if (birthYear) {
          const bmg = getBenMingGua(parseInt(birthYear), gender);
          userText += `\n\n主人本命卦: ${bmg.name}卦(${bmg.group})`;
        }
        const initialMsg = { role: 'user', content: userText };
        setChatMessages([initialMsg]);

        // Save to history
        const id = `fengshui-${Date.now()}`;
        historyIdRef.current = id;
        setActiveHistoryId(id);
        upsertHistory(id, `${r.meta.sittingName}山${r.meta.facingName}向`, {
          module: 'fengshui',
          result: r,
          input: r.input,
        }, [initialMsg]);
      } catch (e) {
        setError(`排盘出错: ${e.message}`);
        console.error('Fengshui paipan error:', e);
      } finally {
        setCalculating(false);
      }
    }, 600);
  }, [constructionYear, sittingDegree, analysisYear, question, birthYear, gender, upsertHistory, setActiveHistoryId]);

  // AI interpret
  const askAI = useCallback(async () => {
    if (aiLoading || !chatMessages.length) return;
    const apiKey = getActiveApiKey(aiConfig);
    if (!apiKey) { setShowSettings(true); return; }

    setAiLoading(true);
    setError('');
    try {
      const fullText = await aiInterpret(makeAiConfig(), FENGSHUI_SYSTEM_PROMPT, chatMessages, (text) => {
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
      const fullText = await aiInterpret(makeAiConfig(), FENGSHUI_SYSTEM_PROMPT, updated, (text) => {
        setStreamingText(text);
      });
      const finalMsgs = [...updated, { role: 'assistant', content: fullText }];
      setChatMessages(finalMsgs);
      setStreamingText('');
      saveToHistory(finalMsgs);
    } catch (e) {
      setError(`AI回复失败: ${e.message}`);
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
      const fullText = await aiInterpret(makeAiConfig(), FENGSHUI_SYSTEM_PROMPT, updated, (text) => {
        setStreamingText(text);
      });
      const finalMsgs = [...updated, { role: 'assistant', content: fullText }];
      setChatMessages(finalMsgs);
      setStreamingText('');
      setSectionResponses(prev => ({ ...prev, [section.id]: true }));
      saveToHistory(finalMsgs);
    } catch (e) {
      setError(`AI分析失败: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiConfig, chatMessages, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askFollowUp(); }
  }, [askFollowUp]);

  // Current mountain label
  const currentMountainLabel = useMemo(() => {
    const m = findMountain(sittingDegree);
    return m ? `${m.name}山 (${m.gua}卦 · ${m.dir || ''})` : '';
  }, [sittingDegree]);

  // Facing label
  const facingLabel = useMemo(() => {
    const fd = (sittingDegree + 180) % 360;
    const m = findMountain(fd);
    return m ? `${m.name}向` : '';
  }, [sittingDegree]);

  const hasApiKey = !!getActiveApiKey(aiConfig);

  return (
    <div className="space-y-4">
      <ModuleIntro
        moduleId="fengshui"
        origin="源于汉代，经唐代杨筠松、宋代赖文俊发展，至明清蒋大鸿集大成为玄空飞星派。以三元九运为时间轴，洛书九宫飞星为空间框架，是理气派风水最精密的体系。"
        strengths={['住宅选址与布局评估', '各方位吉凶分析与化解', '流年方位吉凶预测', '催旺财运·健康·学业的方位建议']}
      />

      {/* 输入区 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-4">
        <h3 className="text-[var(--color-gold)] font-title text-base">建筑信息</h3>

        {/* 建造年份 + 分析年份 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[var(--color-text-dim)] text-xs">建造/入住年份</label>
            <select
              value={constructionYear}
              onChange={e => setConstructionYear(parseInt(e.target.value))}
              className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
            >
              {Array.from({ length: 200 }, (_, i) => 1864 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[var(--color-text-dim)] text-xs">分析年份</label>
            <select
              value={analysisYear}
              onChange={e => setAnalysisYear(parseInt(e.target.value))}
              className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
            >
              {Array.from({ length: 30 }, (_, i) => 2020 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 坐向选择 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[var(--color-text-dim)] text-xs">坐山方位 (大门对面)</label>
            <div className="flex gap-1">
              <button
                onClick={() => setDirMode('mountain')}
                className={`text-[10px] px-2 py-0.5 rounded border ${dirMode === 'mountain'
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-dim)]'}`}
              >选山</button>
              <button
                onClick={() => setDirMode('degree')}
                className={`text-[10px] px-2 py-0.5 rounded border ${dirMode === 'degree'
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-[var(--color-surface-border)] text-[var(--color-text-dim)]'}`}
              >度数</button>
            </div>
          </div>

          {dirMode === 'mountain' ? (
            <MountainSelector selectedMountain={selectedMountain} onSelect={handleMountainSelect} />
          ) : (
            <div className="space-y-1">
              <input
                type="number"
                min="0"
                max="360"
                step="0.1"
                value={sittingDegree}
                onChange={e => handleDegreeChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
                placeholder="坐山度数 (0-360, 0°=正北)"
              />
            </div>
          )}
          {selectedMountain && (
            <div className="mt-1 text-xs text-[var(--color-gold-muted)]">
              坐{currentMountainLabel} · {facingLabel} · {sittingDegree}°
            </div>
          )}
        </div>

        {/* 求测问题 */}
        <div>
          <label className="text-[var(--color-text-dim)] text-xs">求测事项（可选）</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="如：这个房子适合做生意吗？主卧在哪个方位好？"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm resize-none"
            rows={2}
          />
        </div>

        {/* 高级设置 (八宅) */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-gold-muted)]"
        >{showAdvanced ? '▾' : '▸'} 高级设置 (八宅法)</button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-[var(--color-surface-border)]">
            <div>
              <label className="text-[var(--color-text-dim)] text-xs">出生年份</label>
              <input
                type="number"
                min="1920"
                max="2020"
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                placeholder="如 1990"
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
              />
            </div>
            <div>
              <label className="text-[var(--color-text-dim)] text-xs">性别</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            {birthYear && (
              <div className="col-span-2 text-xs text-[var(--color-gold-muted)]">
                本命卦: {(() => {
                  const bmg = getBenMingGua(parseInt(birthYear), gender);
                  return `${bmg.name}卦 (${bmg.group})`;
                })()}
              </div>
            )}
          </div>
        )}

        {/* 排盘按钮 */}
        <button
          onClick={doPaipan}
          disabled={calculating || !selectedMountain}
          className="w-full py-3 rounded-xl bg-[var(--color-gold)]/20 hover:bg-[var(--color-gold)]/30 border border-[var(--color-gold)] text-[var(--color-gold)] font-title text-base transition-all disabled:opacity-40"
        >起局排盘</button>

        {result && (
          <button
            onClick={() => { setResult(null); setChatMessages([]); setStreamingText(''); setSectionResponses({}); }}
            className="w-full py-2 rounded-xl border border-[var(--color-surface-border)] text-[var(--color-text-dim)] text-sm hover:border-[var(--color-gold-muted)]"
          >重新起局</button>
        )}
      </div>

      {/* 排盘动画 */}
      {calculating && <CalculatingAnimation />}

      {/* 排盘结果 */}
      {result && !calculating && (
        <div className="space-y-4">
          {/* 格局摘要 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            <div className="text-[var(--color-text)] text-sm font-body mb-2">
              坐<span className="text-[var(--color-gold)] font-title">{result.meta.sittingName}</span>山
              朝<span className="text-[var(--color-gold)] font-title">{result.meta.facingName}</span>向
              · {result.meta.yuanName}{result.meta.yunName}
              · 年星中宫: {STAR_INFO[result.meta.yearCenter]?.short}
            </div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded font-title ${
              result.geju.nature === '最吉' ? 'bg-[var(--color-wx-wood)]/20 text-[var(--color-wx-wood)] border border-[var(--color-wx-wood)]/40'
              : result.geju.nature === '最凶' ? 'bg-[var(--color-cinnabar)]/15 text-[var(--color-cinnabar)] border border-[var(--color-cinnabar)]/30'
              : 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
            }`}>{result.geju.label}</span>
            <span className="text-[var(--color-text-dim)] text-xs ml-2">{result.geju.desc}</span>
          </div>

          {/* 九宫格 */}
          <FengshuiGrid palaces={result.palaces} onClickPalace={setSelectedPalace} />

          {/* 图例 */}
          <div className="flex flex-wrap gap-3 justify-center text-[10px] text-[var(--color-text-dim)]">
            <span>运=运盘 山=山星 向=向星</span>
            <span className="text-[var(--color-wx-wood)]">■ 吉星</span>
            <span className="text-[var(--color-cinnabar)]">■ 凶星</span>
            <span>点击宫位查看详情</span>
          </div>
        </div>
      )}

      {/* 宫位详情弹窗 */}
      {selectedPalace && <PalaceDetailModal palace={selectedPalace} onClose={() => setSelectedPalace(null)} />}

      {/* AI 解读 */}
      {result && !calculating && (
        <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-[var(--color-gold)] font-title text-base">AI 解读</h3>
            {chatMessages.length > 0 && !chatMessages.some(m => m.role === 'assistant') && (
              <button
                onClick={askAI}
                disabled={aiLoading || !hasApiKey}
                className="px-4 py-1.5 rounded-lg bg-[var(--color-gold)]/20 hover:bg-[var(--color-gold)]/30 border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-title disabled:opacity-40"
              >请求 AI 解读</button>
            )}
          </div>

          {!hasApiKey && (
            <p className="text-[var(--color-text-dim)] text-sm">请先在设置中输入 API Key 以使用 AI 解读功能。</p>
          )}

          {/* Chat messages */}
          {chatMessages.filter(m => m.role === 'assistant').map((msg, i) => (
            <div key={i} className="text-[var(--color-text)] text-sm font-body whitespace-pre-wrap leading-relaxed border-t border-[var(--color-surface-border)] pt-3">
              {msg.content}
            </div>
          ))}

          {/* Streaming */}
          {streamingText && (
            <div className="text-[var(--color-text)] text-sm font-body whitespace-pre-wrap leading-relaxed border-t border-[var(--color-surface-border)] pt-3 animate-pulse">
              {streamingText}
            </div>
          )}

          {/* Section buttons */}
          {chatMessages.some(m => m.role === 'assistant') && (
            <div className="flex flex-wrap gap-2 pt-2">
              {DETAIL_SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => askSection(s)}
                  disabled={aiLoading || sectionResponses[s.id]}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    sectionResponses[s.id]
                      ? 'border-[var(--color-surface-border)] text-[var(--color-text-dim)] opacity-50'
                      : 'border-[var(--color-gold-muted)] text-[var(--color-gold-muted)] hover:bg-[var(--color-gold)]/10'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          )}

          {/* Follow-up */}
          {chatMessages.some(m => m.role === 'assistant') && (
            <div className="flex gap-2 pt-2">
              <input
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="追问..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-surface-border)] text-[var(--color-text)] text-sm"
              />
              <button
                onClick={askFollowUp}
                disabled={aiLoading || !followUpInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)]/20 border border-[var(--color-gold)] text-[var(--color-gold)] text-sm disabled:opacity-40"
              >发送</button>
            </div>
          )}

          {error && <div className="text-[var(--color-cinnabar)] text-xs">{error}</div>}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
}
