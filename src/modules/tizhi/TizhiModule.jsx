import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { assessConstitution, formatForAI } from './engine.js';
import { TIZHI_QUESTIONS, TIZHI_TYPES, TIZHI_PLANS } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { TIZHI_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';

// ===== 分析动画 =====
function AnalyzingAnimation() {
  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-taiji-spin" style={{ transformOrigin: 'center' }}>☯</div>
        <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">辨识体质中...</div>
      </div>
    </div>
  );
}

// ===== 雷达图 (SVG) =====
function RadarChart({ scores }) {
  const types = TIZHI_TYPES;
  const cx = 150, cy = 150, r = 110;
  const n = types.length;

  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  // Grid rings
  const rings = [25, 50, 75, 100];
  const gridPaths = rings.map(v => {
    const pts = types.map((_, i) => getPoint(i, v));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  });

  // Data polygon
  const dataPoints = types.map((t, i) => getPoint(i, scores[t.id] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  // Labels
  const labelPoints = types.map((t, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = r + 25;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), name: t.name.replace('质', '') };
  });

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto">
      {/* Grid */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--color-gold-border)" strokeWidth="0.5" opacity={0.4} />
      ))}
      {/* Axes */}
      {types.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--color-gold-border)" strokeWidth="0.5" opacity={0.3} />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="var(--color-gold)" fillOpacity={0.15} stroke="var(--color-gold)" strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-gold)" />
      ))}
      {/* Labels */}
      {labelPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          className="text-[10px] font-body" fill="var(--color-text-dim)">{p.name}</text>
      ))}
    </svg>
  );
}

// ===== 调养方案卡片 =====
function PlanCard({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--color-gold-border)] rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left bg-[var(--color-surface-dim)] hover:bg-[var(--color-gold-bg)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{icon}</span>
        <span className="flex-1 text-sm font-title text-[var(--color-gold)]">{title}</span>
        <span className="text-[var(--color-text-dim)] text-xs">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div className="px-3 py-2 text-sm text-[var(--color-text)] font-body space-y-1">{children}</div>}
    </div>
  );
}

// ===== 体质结果展示 =====
function ConstitutionResult({ result }) {
  const { primary, secondary, scores, isBalanced, primaryPlan } = result;

  return (
    <div className="space-y-4">
      {/* 主体质卡片 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
        <div className="text-center mb-3">
          <div className="text-2xl font-title text-[var(--color-gold)]">{primary.name}</div>
          {isBalanced && <span className="text-xs text-[var(--color-wx-wood)] bg-[var(--color-wx-wood)]/10 px-2 py-0.5 rounded-full">体质均衡</span>}
          <div className="text-sm text-[var(--color-text-dim)] mt-1">{primary.brief}</div>
        </div>
        {secondary && (
          <div className="text-center text-sm text-[var(--color-text-dim)]">
            兼夹: <span className="text-[var(--color-gold)]">{secondary.name}</span>
            <span className="text-xs ml-1">({scores[secondary.id]}分)</span>
          </div>
        )}
      </div>

      {/* 雷达图 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
        <div className="text-xs text-[var(--color-gold-muted)] text-center mb-1 font-title">体质倾向分布</div>
        <RadarChart scores={scores} />
      </div>

      {/* 特征 */}
      <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
        <div className="text-xs text-[var(--color-gold-muted)] mb-2 font-title">主要表现</div>
        <div className="flex flex-wrap gap-1.5">
          {primary.characteristics.map((c, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-[var(--color-gold-bg)] border border-[var(--color-gold-border)] rounded-full text-[var(--color-text)]">{c}</span>
          ))}
        </div>
        <div className="text-xs text-[var(--color-text-dim)] mt-2">
          <span className="text-[var(--color-cinnabar)]">易患:</span> {primary.susceptible}
        </div>
        <div className="text-xs text-[var(--color-text-dim)]">
          <span className="text-[var(--color-wx-wood)]">调理:</span> {primary.regulation}
        </div>
      </div>

      {/* 调养方案 */}
      {primaryPlan && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--color-gold-muted)] font-title">调养方案</div>
          <PlanCard title="饮食调理" icon="🍵">
            <div><strong>五谷:</strong> {primaryPlan.food.grains.join('、')}</div>
            <div><strong>荤食:</strong> {primaryPlan.food.meats.join('、')}</div>
            <div><strong>果蔬:</strong> {primaryPlan.food.veg.join('、')}</div>
            <div><strong>药食:</strong> {primaryPlan.food.medicinal.join('、')}</div>
            <div className="mt-1 text-[var(--color-gold)]"><strong>推荐茶饮:</strong> {primaryPlan.tea}</div>
          </PlanCard>
          <PlanCard title="穴位保健" icon="📍">
            <div><strong>穴位:</strong> {primaryPlan.acupoints.join('、')}</div>
            <div><strong>手法:</strong> {primaryPlan.acuMethod}</div>
          </PlanCard>
          <PlanCard title="运动起居" icon="🏃">
            <div><strong>运动:</strong> {primaryPlan.exercise.join('、')}</div>
            <div><strong>作息:</strong> {primaryPlan.sleep}</div>
          </PlanCard>
          <PlanCard title="忌口注意" icon="⚠">
            {primaryPlan.avoid.map((a, i) => <div key={i} className="text-[var(--color-cinnabar)]">· {a}</div>)}
          </PlanCard>
        </div>
      )}
    </div>
  );
}

// ===== 专题分析按钮 =====
const DETAIL_SECTIONS = [
  { key: 'diet', label: '饮食细节' },
  { key: 'season', label: '四季调养' },
  { key: 'emotion', label: '情志调理' },
  { key: 'exercise', label: '运动方案' },
];

// ===== 主组件 =====
export default function TizhiModule({
  aiConfig, setShowSettings, upsertHistory,
  activeHistoryId, setActiveHistoryId,
  pendingHistoryLoad, clearPendingHistoryLoad,
}) {
  // --- 问卷状态 ---
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(TIZHI_QUESTIONS.length).fill(0));
  const [phase, setPhase] = useState('questionnaire'); // questionnaire | analyzing | result

  // --- 结果 ---
  const [result, setResult] = useState(null);

  // --- AI ---
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [detailSeen, setDetailSeen] = useState({});
  const chatEndRef = useRef(null);
  const abortRef = useRef(null);

  // --- 历史 ---
  const historyIdRef = useRef(activeHistoryId || crypto.randomUUID());

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingText]);

  // Load from history
  useEffect(() => {
    if (pendingHistoryLoad?.module === 'tizhi') {
      const d = pendingHistoryLoad;
      if (d.result) {
        setResult(d.result);
        setAnswers(d.input?.answers || []);
        setPhase('result');
      }
      if (d.chatMessages) setChatMessages(d.chatMessages);
      historyIdRef.current = activeHistoryId || crypto.randomUUID();
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad]);

  // Answer a question
  const handleAnswer = useCallback((score) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);

    if (currentQ < TIZHI_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All done — assess
      setPhase('analyzing');
      setTimeout(() => {
        const res = assessConstitution(newAnswers);
        setResult(res);
        setPhase('result');
        // Auto AI interpret
        startAI(res, newAnswers);
      }, 1200);
    }
  }, [answers, currentQ]);

  // Go to previous question
  const handlePrev = useCallback(() => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  }, [currentQ]);

  // Start AI interpretation
  const startAI = useCallback(async (res, ans) => {
    const key = getActiveApiKey(aiConfig);
    if (!key) { setShowSettings(true); return; }

    const userText = formatForAI(res, ans);
    const msgs = [{ role: 'user', content: userText }];
    setIsStreaming(true);
    setStreamingText('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;
      let full = '';
      await aiInterpret(aiConfig, TIZHI_SYSTEM_PROMPT, msgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [
        { role: 'user', content: userText },
        { role: 'assistant', content: full },
      ];
      setChatMessages(finalMsgs);
      setStreamingText('');

      // Save history
      upsertHistory(historyIdRef.current, '体质辨识',
        { module: 'tizhi', result: res, input: { answers: ans } }, finalMsgs);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [aiConfig, setShowSettings, upsertHistory]);

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
      await aiInterpret(aiConfig, TIZHI_SYSTEM_PROMPT, newMsgs, (chunk) => {
        full += chunk;
        setStreamingText(full);
      });
      const finalMsgs = [...newMsgs, { role: 'assistant', content: full }];
      setChatMessages(finalMsgs);
      setStreamingText('');

      upsertHistory(historyIdRef.current, '体质辨识',
        { module: 'tizhi', result, input: { answers } }, finalMsgs);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `错误: ${e.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [aiConfig, chatMessages, result, answers, setShowSettings, upsertHistory]);

  // Detail section handler
  const handleDetail = useCallback((section) => {
    setDetailSeen(prev => ({ ...prev, [section.key]: true }));
    handleFollowUp(`请详细分析我的${section.label}建议，结合我的${result?.primary?.name || '体质'}特点。`);
  }, [result, handleFollowUp]);

  // Reset
  const handleReset = useCallback(() => {
    setCurrentQ(0);
    setAnswers(Array(TIZHI_QUESTIONS.length).fill(0));
    setPhase('questionnaire');
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setDetailSeen({});
    historyIdRef.current = crypto.randomUUID();
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Progress
  const progress = useMemo(() =>
    Math.round((answers.filter(a => a > 0).length / TIZHI_QUESTIONS.length) * 100),
  [answers]);

  const SCORE_OPTIONS = [
    { score: 1, label: '从不' },
    { score: 2, label: '很少' },
    { score: 3, label: '有时' },
    { score: 4, label: '经常' },
    { score: 5, label: '总是' },
  ];

  return (
    <div className="space-y-4 font-body">
      <ModuleIntro
        moduleId="tizhi"
        origin="源于《黄帝内经》体质理论，现代由王琦教授系统化为九种体质分类法。通过问卷评估个人体质偏向，是中医「治未病」的核心工具。"
        strengths="判断个人体质类型 · 制定针对性食疗方案 · 指导四季养生 · 预防潜在健康风险"
      />

      {/* 问卷阶段 */}
      {phase === 'questionnaire' && (
        <div className="space-y-3">
          {/* 进度条 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            <div className="flex justify-between text-xs text-[var(--color-text-dim)] mb-1">
              <span>问题 {currentQ + 1} / {TIZHI_QUESTIONS.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* 当前问题 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
            <div className="text-sm text-[var(--color-text)] mb-4 font-title leading-relaxed">
              {TIZHI_QUESTIONS[currentQ].q}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {SCORE_OPTIONS.map(opt => (
                <button
                  key={opt.score}
                  onClick={() => handleAnswer(opt.score)}
                  className={`py-2 px-1 rounded-lg text-xs font-body transition-all border
                    ${answers[currentQ] === opt.score
                      ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
                      : 'bg-[var(--color-surface-dim)] text-[var(--color-text)] border-[var(--color-gold-border)] hover:bg-[var(--color-gold-bg)]'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-3">
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-gold)] disabled:opacity-30 transition-colors"
              >
                ← 上一题
              </button>
              {answers[currentQ] > 0 && currentQ < TIZHI_QUESTIONS.length - 1 && (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="text-xs text-[var(--color-gold)] hover:underline"
                >
                  下一题 →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 分析中 */}
      {phase === 'analyzing' && <AnalyzingAnimation />}

      {/* 结果阶段 */}
      {phase === 'result' && result && (
        <>
          <ConstitutionResult result={result} />

          {/* AI对话区 */}
          <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-3">
            <div className="text-xs text-[var(--color-gold-muted)] mb-2 font-title">AI 调养解读</div>

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

            {/* 专题分析 */}
            {chatMessages.length >= 2 && !isStreaming && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[var(--color-surface-border)]">
                {DETAIL_SECTIONS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => handleDetail(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      detailSeen[s.key]
                        ? 'bg-[var(--color-gold-bg)] border-[var(--color-gold-border)] text-[var(--color-gold-muted)]'
                        : 'border-[var(--color-gold-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold-bg)]'
                    }`}
                  >
                    {detailSeen[s.key] ? '✓ ' : ''}{s.label}
                  </button>
                ))}
              </div>
            )}

            {/* 追问输入 */}
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
          </div>

          {/* 重新测评 */}
          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-gold)] transition-colors"
            >
              重新测评
            </button>
          </div>
        </>
      )}
    </div>
  );
}
