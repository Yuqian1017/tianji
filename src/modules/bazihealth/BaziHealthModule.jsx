import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { runHealthAnalysis, formatForAI } from './engine.js';
import { WUXING_HEALTH } from './data.js';
import { WUXING_CN, WUXING_ORDER, SHICHEN } from '../bazi/data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { BAZIHEALTH_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import BirthCityPicker from '../../components/BirthCityPicker.jsx';
import { calcTrueSolarTimeOffset, adjustBirthTime, formatTrueSolarTime } from '../../lib/cities.js';

const WUXING_COLORS = {
  wood: '#4CAF50', fire: '#E53935', earth: '#C6893F', metal: '#FFD54F', water: '#1E88E5',
};

// ===== Five Element Health Bar Chart =====
function ElementChart({ elementStatus }) {
  const maxCount = Math.max(...WUXING_ORDER.map(el => elementStatus[el]?.count || 0), 1);
  return (
    <div className="space-y-2">
      <div className="text-xs text-[var(--color-gold-muted)] font-title">五行分布</div>
      {WUXING_ORDER.map(el => {
        const s = elementStatus[el];
        const barWidth = Math.max((s.count / maxCount) * 100, 8);
        const statusLabel = s.status === 'weak' ? '偏弱' : s.status === 'excess' ? '偏旺' : '适中';
        const statusColor = s.status === 'weak' ? 'text-[var(--color-cinnabar)]' : s.status === 'excess' ? 'text-[var(--color-jade)]' : 'text-[var(--color-text-dim)]';
        return (
          <div key={el} className="flex items-center gap-2">
            <div className="w-8 text-xs text-right" style={{ color: WUXING_COLORS[el] }}>{WUXING_CN[el]}</div>
            <div className="flex-1 h-5 bg-[var(--color-surface-dim)] rounded overflow-hidden">
              <div
                className="h-full rounded flex items-center justify-end pr-1.5 text-[10px] text-white font-bold transition-all duration-500"
                style={{ width: `${barWidth}%`, backgroundColor: WUXING_COLORS[el] + 'CC' }}
              >
                {s.count}
              </div>
            </div>
            <div className={`w-8 text-[10px] ${statusColor}`}>{statusLabel}</div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Organ Risk Card =====
function OrganRiskCard({ risk }) {
  const [expanded, setExpanded] = useState(false);
  const color = WUXING_COLORS[risk.element];
  const typeLabel = risk.type === 'weak' ? '偏弱 ↓' : '偏旺 ↑';
  return (
    <div
      className="bg-[var(--color-surface-dim)] rounded-lg p-3 cursor-pointer transition-all"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-title" style={{ color }}>{WUXING_CN[risk.element]}</span>
          <span className="text-xs text-[var(--color-text-dim)]">{typeLabel}</span>
          <span className="text-xs text-[var(--color-cinnabar)]">{risk.organs.join(' · ')}</span>
        </div>
        <span className="text-[10px] text-[var(--color-text-dim)]">{expanded ? '收起' : '展开'}</span>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1.5 text-xs text-[var(--color-text)]">
          <div><span className="text-[var(--color-text-dim)]">表现: </span>{risk.description}</div>
          <div><span className="text-[var(--color-text-dim)]">风险: </span>{risk.risks}</div>
          <div><span className="text-[var(--color-text-dim)]">常见症状: </span>{risk.symptoms.join('、')}</div>
          <div className="pt-1 border-t border-[var(--color-surface-border)]">
            <span className="text-[var(--color-jade)]">食疗: </span>{risk.nurture.foods.join('、')}
          </div>
          <div>
            <span className="text-[var(--color-cinnabar)]">忌: </span>{risk.nurture.avoid.join('、')}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Life Stage Timeline =====
function LifeStageTimeline({ stages }) {
  if (!stages?.length) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs text-[var(--color-gold-muted)] font-title">大运健康走势</div>
      <div className="space-y-1">
        {stages.map((s, i) => {
          const color = WUXING_COLORS[s.yunElement] || '#888';
          return (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${s.isCurrent ? 'ring-1 ring-[var(--color-gold)]' : ''}`}
              style={{ backgroundColor: s.isCurrent ? `${color}15` : 'var(--color-surface-dim)' }}
            >
              <div className="w-16 shrink-0 font-title" style={{ color }}>
                {s.stem}{s.branch}
                {s.isCurrent && <span className="ml-1 text-[var(--color-gold)]">◀</span>}
              </div>
              <div className="w-16 shrink-0 text-[var(--color-text-dim)]">{s.startAge}-{s.endAge}岁</div>
              <div className="flex-1 text-[var(--color-text)]">关注: {s.healthFocus || '—'}</div>
              {s.healthTip && (
                <div className="text-[10px] text-[var(--color-jade)] shrink-0">宜: {s.healthTip}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Diet Plan Section =====
function DietPlanSection({ dietPlan }) {
  if (!dietPlan?.length) return null;
  return (
    <div className="space-y-2">
      <div className="text-xs text-[var(--color-gold-muted)] font-title">食疗调养</div>
      {dietPlan.map((plan, i) => (
        <div key={i} className="bg-[var(--color-surface-dim)] rounded-lg p-3" style={{ borderLeft: `3px solid ${WUXING_COLORS[plan.element]}` }}>
          <div className="text-xs font-title mb-1" style={{ color: WUXING_COLORS[plan.element] }}>
            补{plan.elementCn} — {plan.organs.join('·')}
          </div>
          <div className="text-xs text-[var(--color-text)]">
            <span className="text-[var(--color-jade)]">推荐: </span>{plan.foods.join('、')}
          </div>
          <div className="text-xs text-[var(--color-text)] mt-0.5">
            <span className="text-[var(--color-cinnabar)]">忌: </span>{plan.avoid.join('、')}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Detail Sections =====
const DETAIL_SECTIONS = [
  { key: 'food', label: '详细食疗' },
  { key: 'acupoints', label: '穴位保健' },
  { key: 'seasons', label: '四季养生' },
  { key: 'exercise', label: '运动起居' },
];

// ===== Main Module =====
export default function BaziHealthModule({
  aiConfig, setShowSettings, upsertHistory,
  activeHistoryId, setActiveHistoryId,
  pendingHistoryLoad, clearPendingHistoryLoad,
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(12);
  const [gender, setGender] = useState('male');
  const [trueSolarEnabled, setTrueSolarEnabled] = useState(false);
  const [birthCity, setBirthCity] = useState(null);
  const [result, setResult] = useState(null); // { baziResult, healthResult, lifeStages, dietPlan }
  const [hasCalculated, setHasCalculated] = useState(false);

  // AI state
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
    if (pendingHistoryLoad?.module === 'bazihealth') {
      const d = pendingHistoryLoad;
      if (d.result) {
        setResult(d.result);
        if (d.input) {
          setYear(d.input.year || 1990);
          setMonth(d.input.month || 6);
          setDay(d.input.day || 15);
          setHour(d.input.hour || 12);
          setGender(d.input.gender || 'male');
        }
        setHasCalculated(true);
      }
      if (d.chatMessages) setChatMessages(d.chatMessages);
      historyIdRef.current = activeHistoryId || crypto.randomUUID();
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad]);

  // Calculate
  const handleCalculate = useCallback(() => {
    let adjYear = year, adjMonth = month, adjDay = day, adjHour = hour, adjMinute = 0;
    if (trueSolarEnabled && birthCity) {
      const offset = calcTrueSolarTimeOffset(birthCity.lng, birthCity.stdMeridian ?? 120);
      ({ year: adjYear, month: adjMonth, day: adjDay, hour: adjHour, minute: adjMinute } = adjustBirthTime(year, month, day, hour, 0, offset));
    }
    const res = runHealthAnalysis(adjYear, adjMonth, adjDay, adjHour, adjMinute, gender);
    if (trueSolarEnabled && birthCity) {
      res._trueSolar = {
        city: birthCity.name,
        offset: calcTrueSolarTimeOffset(birthCity.lng, birthCity.stdMeridian ?? 120),
        adjusted: { year: adjYear, month: adjMonth, day: adjDay, hour: adjHour, minute: adjMinute },
      };
    }
    setResult(res);
    setHasCalculated(true);
    setChatMessages([]);
    setStreamingText('');
    setDetailSeen({});
    historyIdRef.current = crypto.randomUUID();
    setActiveHistoryId(null);
  }, [year, month, day, hour, gender, setActiveHistoryId]);

  // AI interpretation
  const handleAI = useCallback(async () => {
    if (!result) return;
    const key = getActiveApiKey(aiConfig);
    if (!key) { setShowSettings(true); return; }

    const userText = formatForAI(result.baziResult, result.healthResult, result.lifeStages, result.dietPlan);
    const msgs = [{ role: 'user', content: userText }];
    setIsStreaming(true);
    setStreamingText('');

    try {
      let full = '';
      await aiInterpret(aiConfig, BAZIHEALTH_SYSTEM_PROMPT, msgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [{ role: 'user', content: userText }, { role: 'assistant', content: full }];
      setChatMessages(finalMsgs);
      setStreamingText('');

      const p = result.baziResult.pillars;
      const summary = `${p.year.stem}${p.year.branch} ${p.month.stem}${p.month.branch} ${p.day.stem}${p.day.branch} ${p.hour.stem}${p.hour.branch}`;
      upsertHistory(historyIdRef.current, summary, {
        module: 'bazihealth',
        result: result,
        input: { year, month, day, hour, gender },
      }, finalMsgs);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [result, aiConfig, setShowSettings, upsertHistory, year, month, day, hour, gender]);

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
      await aiInterpret(aiConfig, BAZIHEALTH_SYSTEM_PROMPT, newMsgs, (chunk) => {
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
    const weak = result?.healthResult?.weakElements?.map(e => WUXING_CN[e]).join('') || '';
    handleFollowUp(`请针对五行${weak}偏弱的体质，详细讲解${section.label}方面的建议。`);
  }, [result, handleFollowUp]);

  // Year options
  const yearOptions = useMemo(() => Array.from({ length: currentYear - 1940 + 1 }, (_, i) => 1940 + i), [currentYear]);
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const dayOptions = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  const r = result?.healthResult;
  const bazi = result?.baziResult;

  return (
    <div className="space-y-4 font-body">
      <ModuleIntro
        moduleId="bazihealth"
        origin="源于中医五行学说与八字命理的交叉应用。通过分析出生八字的五行偏枯，推断先天体质弱点和易患疾病，制定针对性的养生方案。"
        strengths="先天体质分析 · 脏腑风险预警 · 大运健康走势 · 个性化食疗方案"
      />

      {/* Input */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4 space-y-3">
        <div className="text-sm font-title text-[var(--color-gold)]">出生信息</div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] block mb-0.5">年</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] font-body focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] block mb-0.5">月</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] font-body focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]">
              {monthOptions.map(m => <option key={m} value={m}>{m}月</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] block mb-0.5">日</label>
            <select value={day} onChange={e => setDay(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] font-body focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]">
              {dayOptions.map(d => <option key={d} value={d}>{d}日</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-dim)] block mb-0.5">时辰</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))}
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text)] font-body focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]">
              {SHICHEN.map(s => <option key={s.branch} value={s.hours[0]}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm">
            <button onClick={() => setGender('male')}
              className={`px-3 py-1 rounded-lg border transition-colors ${gender === 'male' ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]' : 'border-[var(--color-gold-border)] text-[var(--color-text-dim)]'}`}>
              男
            </button>
            <button onClick={() => setGender('female')}
              className={`px-3 py-1 rounded-lg border transition-colors ${gender === 'female' ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]' : 'border-[var(--color-gold-border)] text-[var(--color-text-dim)]'}`}>
              女
            </button>
          </div>
        </div>

        {/* True Solar Time */}
        <div className="mt-3 p-3 bg-[var(--color-surface-dim)] rounded-lg border border-[var(--color-surface-border)]">
          <BirthCityPicker
            enabled={trueSolarEnabled}
            onToggle={setTrueSolarEnabled}
            city={birthCity}
            onCityChange={setBirthCity}
          />
        </div>

        <button onClick={handleCalculate}
          className="mt-3 w-full py-2 bg-[var(--color-gold)] text-white rounded-lg text-sm font-title hover:opacity-90 transition-opacity">
          健康分析
        </button>
      </div>

      {/* Results */}
      {hasCalculated && r && bazi && (
        <>
          {/* Overview */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-lg font-title text-[var(--color-gold)]">
                {bazi.pillars.year.stem}{bazi.pillars.year.branch} {bazi.pillars.month.stem}{bazi.pillars.month.branch} {bazi.pillars.day.stem}{bazi.pillars.day.branch} {bazi.pillars.hour.stem}{bazi.pillars.hour.branch}
              </div>
              <div className="text-xs text-[var(--color-text-dim)] mt-1">
                日主 {bazi.dayStem}({WUXING_CN[r.dayMasterWuxing]}) · {r.strength.label}({r.strength.score}分)
              </div>
            </div>

            {/* Element chart */}
            <ElementChart elementStatus={r.elementStatus} />

            {/* Affected organs summary */}
            {r.organRisks.length > 0 && (
              <div className="mt-3 text-center">
                <span className="text-xs text-[var(--color-text-dim)]">需关注脏腑: </span>
                {r.organRisks.flatMap(risk => risk.organs).filter((v, i, a) => a.indexOf(v) === i).map((o, i) => (
                  <span key={i} className="text-xs text-[var(--color-cinnabar)] bg-[var(--color-cinnabar)]/10 px-1.5 py-0.5 rounded-full mx-0.5">{o}</span>
                ))}
              </div>
            )}
          </div>

          {/* Organ Risk Cards */}
          {r.organRisks.length > 0 && (
            <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3 space-y-2">
              <div className="text-xs text-[var(--color-gold-muted)] font-title">脏腑健康风险</div>
              {r.organRisks.map((risk, i) => (
                <OrganRiskCard key={i} risk={risk} />
              ))}
            </div>
          )}

          {/* Birth hour note */}
          {r.shichenNote && (
            <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
              <div className="text-xs text-[var(--color-gold-muted)] font-title mb-1">出生时辰健康提示</div>
              <div className="text-sm text-[var(--color-text)]">{r.shichenNote}</div>
            </div>
          )}

          {/* Life Stage Timeline */}
          {result.lifeStages?.length > 0 && (
            <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
              <LifeStageTimeline stages={result.lifeStages} />
            </div>
          )}

          {/* Diet Plan */}
          {result.dietPlan?.length > 0 && (
            <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
              <DietPlanSection dietPlan={result.dietPlan} />
            </div>
          )}

          {/* AI Section */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            {chatMessages.length === 0 && !isStreaming && (
              <button onClick={handleAI}
                className="w-full py-2.5 bg-[var(--color-gold)] text-white rounded-lg text-sm font-title hover:opacity-90 transition-opacity">
                AI 健康解读
              </button>
            )}

            {(chatMessages.length > 0 || isStreaming) && (
              <>
                <div className="text-xs text-[var(--color-gold-muted)] mb-2 font-title">AI 健康分析</div>
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

                {/* Detail sections */}
                {chatMessages.length >= 2 && !isStreaming && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[var(--color-surface-border)]">
                    {DETAIL_SECTIONS.map(s => (
                      <button key={s.key} onClick={() => handleDetail(s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${detailSeen[s.key] ? 'bg-[var(--color-gold-bg)] border-[var(--color-gold-border)] text-[var(--color-gold-muted)]' : 'border-[var(--color-gold-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold-bg)]'}`}
                      >{detailSeen[s.key] ? '✓ ' : ''}{s.label}</button>
                    ))}
                  </div>
                )}

                {/* Follow-up */}
                {chatMessages.length >= 2 && !isStreaming && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--color-surface-border)]">
                    <input type="text" value={followUpInput}
                      onChange={e => setFollowUpInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleFollowUp(followUpInput)}
                      placeholder="继续提问..."
                      className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-gold-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] font-body"
                    />
                    <button onClick={() => handleFollowUp(followUpInput)}
                      className="px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity font-body">发送</button>
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
