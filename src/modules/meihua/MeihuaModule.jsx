import { useState, useEffect, useCallback, useRef } from 'react';
import { castByNumber, castByTime, castByText, formatForAI } from './engine.js';
import { WUXING_CN, XIANTIAN } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { MEIHUA_SYSTEM_PROMPT } from './prompt.js';

// Five-element color mapping (uses theme CSS variables)
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

// ===== 起卦中动画组件 =====
function CastingAnimation() {
  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-taiji-spin" style={{ transformOrigin: 'center' }}>☯</div>
        <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">起卦中...</div>
      </div>
    </div>
  );
}

// ===== 排盘结果显示组件 =====
function MeihuaDisplay({ result }) {
  if (!result) return null;

  const { upper, lower, dong, tiGua, yongGua, benGua, huGua, bianGua, tiYong } = result;

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4 animate-meihua-reveal">
      {/* 本卦名 */}
      <div className="text-center pb-3 border-b border-[var(--color-gold-border-light)]">
        <div className="text-[var(--color-gold)] text-xl font-title mb-1">{benGua.name}</div>
        <div className="text-[var(--color-text-dim)] text-xs font-body">本卦</div>
      </div>

      {/* 上下卦 + 体用 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 上卦 */}
        <div className={`rounded-lg p-3 border ${tiGua.position === 'upper'
          ? 'border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
          : 'border-[var(--color-jade-border)] bg-[var(--color-jade-bg-faint)]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--color-text-dim)] text-xs font-body">上卦</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body ${tiGua.position === 'upper'
              ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)]'
              : 'bg-[var(--color-jade-bg)] text-[var(--color-jade)]'}`}>
              {tiGua.position === 'upper' ? '体' : '用'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1 animate-trigram-grow">{upper.symbol}</div>
            <div className="text-[var(--color-text)] font-title">{upper.name}</div>
            <div className={`text-xs mt-0.5 font-body ${wuxingColor[upper.wuxing]}`}>
              {upper.nature} · {WUXING_CN[upper.wuxing]}
            </div>
          </div>
        </div>

        {/* 下卦 */}
        <div className={`rounded-lg p-3 border ${tiGua.position === 'lower'
          ? 'border-[var(--color-gold-border-strong)] bg-[var(--color-gold-bg-faint)]'
          : 'border-[var(--color-jade-border)] bg-[var(--color-jade-bg-faint)]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--color-text-dim)] text-xs font-body">下卦</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-body ${tiGua.position === 'lower'
              ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)]'
              : 'bg-[var(--color-jade-bg)] text-[var(--color-jade)]'}`}>
              {tiGua.position === 'lower' ? '体' : '用'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1 animate-trigram-grow" style={{ animationDelay: '150ms' }}>{lower.symbol}</div>
            <div className="text-[var(--color-text)] font-title">{lower.name}</div>
            <div className={`text-xs mt-0.5 font-body ${wuxingColor[lower.wuxing]}`}>
              {lower.nature} · {WUXING_CN[lower.wuxing]}
            </div>
          </div>
        </div>
      </div>

      {/* 动爻 */}
      <div className="text-center text-sm text-[var(--color-text-dim)] font-body">
        动爻：第 <span className="text-[var(--color-gold)] font-bold">{dong}</span> 爻
        （{dong <= 3 ? '下卦动' : '上卦动'}）
      </div>

      {/* 体用关系 */}
      <div className={`rounded-lg p-4 text-center ${wuxingBgColor[tiGua.wuxing]} border border-[var(--color-surface-border)] animate-meihua-reveal`} style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-sm font-body">
            <span className="text-[var(--color-gold)]">体</span>
            <span className={`ml-1 ${wuxingColor[tiGua.wuxing]}`}>{tiGua.name}({WUXING_CN[tiGua.wuxing]})</span>
          </div>
          <span className="text-[var(--color-text-dim)]">←→</span>
          <div className="text-sm font-body">
            <span className="text-[var(--color-jade)]">用</span>
            <span className={`ml-1 ${wuxingColor[yongGua.wuxing]}`}>{yongGua.name}({WUXING_CN[yongGua.wuxing]})</span>
          </div>
        </div>
        <div className="text-lg font-title">
          <span className="mr-2">{tiYong.icon}</span>
          <span className="text-[var(--color-text)]">{tiYong.desc}</span>
          <span className="text-[var(--color-text-dim)] ml-2">— {tiYong.verdict}</span>
        </div>
      </div>

      {/* 互卦 + 变卦 */}
      <div className="grid grid-cols-2 gap-3 text-center animate-meihua-reveal" style={{ animationDelay: '350ms' }}>
        <div className="bg-[var(--color-surface-subtle)] rounded-lg p-3 border border-[var(--color-surface-border)]">
          <div className="text-[var(--color-text-dim)] text-xs mb-1 font-body">互卦（过程）</div>
          <div className="text-[var(--color-text)] font-title">{huGua.name}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5 font-body">
            <span className={wuxingColor[huGua.upper.wuxing]}>{huGua.upper.name}</span>
            <span className="mx-1">/</span>
            <span className={wuxingColor[huGua.lower.wuxing]}>{huGua.lower.name}</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-subtle)] rounded-lg p-3 border border-[var(--color-surface-border)]">
          <div className="text-[var(--color-text-dim)] text-xs mb-1 font-body">变卦（结果）</div>
          <div className="text-[var(--color-jade)] font-title">{bianGua.name}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5 font-body">
            <span className={wuxingColor[bianGua.upper.wuxing]}>{bianGua.upper.name}</span>
            <span className="mx-1">/</span>
            <span className={wuxingColor[bianGua.lower.wuxing]}>{bianGua.lower.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 梅花易数主模块 =====
export default function MeihuaModule({ aiConfig, setShowSettings, upsertHistory, activeHistoryId, setActiveHistoryId, pendingHistoryLoad, clearPendingHistoryLoad }) {
  const [question, setQuestion] = useState('');
  const [castMethod, setCastMethod] = useState('number');
  const [inputNum1, setInputNum1] = useState('');
  const [inputNum2, setInputNum2] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [casting, setCasting] = useState(false); // true while showing taiji spin animation
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  // Handle history loading from parent
  useEffect(() => {
    if (pendingHistoryLoad && (pendingHistoryLoad.module) === 'meihua') {
      const item = pendingHistoryLoad;
      setQuestion(item.question || '');
      setResult(item.result || null);
      setChatMessages(item.chatMessages || []);
      setCastMethod(item.method || 'number');
      if (item.input) {
        if (item.input.num1 !== undefined) {
          setInputNum1(String(item.input.num1));
          setInputNum2(String(item.input.num2));
        }
        if (item.input.text) {
          setInputText(item.input.text);
        }
      }
      setStreamingText('');
      setFollowUpInput('');
      setError('');
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, streamingText]);

  // Helper: show casting animation then reveal result
  const showCastResult = useCallback((castFn) => {
    setError('');
    setResult(null);
    setCasting(true);
    setChatMessages([]);
    setStreamingText('');
    setActiveHistoryId(null);

    // Delay for animation effect
    setTimeout(() => {
      try {
        const r = castFn();
        setCasting(false);
        setResult(r);
      } catch (e) {
        setCasting(false);
        setError(`起卦错误: ${e.message}`);
        console.error('起卦错误:', e);
      }
    }, 1200);
  }, [setActiveHistoryId]);

  // 报数起卦
  const handleCastByNumber = useCallback(() => {
    const n1 = parseInt(inputNum1, 10);
    const n2 = parseInt(inputNum2, 10);
    if (!n1 || !n2 || n1 < 1 || n2 < 1) {
      setError('请输入两个正整数');
      return;
    }
    showCastResult(() => castByNumber(n1, n2));
  }, [inputNum1, inputNum2, showCastResult]);

  // 时间起卦
  const handleCastByTime = useCallback(() => {
    showCastResult(() => castByTime());
  }, [showCastResult]);

  // 文字起卦
  const handleCastByText = useCallback(() => {
    if (!inputText.trim()) {
      setError('请输入至少一个汉字');
      return;
    }
    showCastResult(() => castByText(inputText.trim()));
  }, [inputText, showCastResult]);

  // 重新起卦
  const reset = useCallback(() => {
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setFollowUpInput('');
    setError('');
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // AI断卦
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
      const fullText = await aiInterpret({ apiKey: getActiveApiKey(aiConfig), provider: aiConfig.provider, model: aiConfig.model }, MEIHUA_SYSTEM_PROMPT, messages, (text) => {
        setStreamingText(text);
      });
      const newChatMessages = [userMsg, { role: 'assistant', content: fullText }];
      setChatMessages(newChatMessages);
      setStreamingText('');

      const historyId = activeHistoryId || Date.now().toString();
      setActiveHistoryId(historyId);
      upsertHistory(historyId, question, {
        module: 'meihua',
        method: result.method,
        input: result.input,
        result,
      }, newChatMessages);
    } catch (e) {
      setError(`AI解读失败: ${e.message}`);
      console.error('AI解读失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [result, aiConfig, question, activeHistoryId, setActiveHistoryId, upsertHistory, setShowSettings]);

  // 追问
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
      const fullText = await aiInterpret({ apiKey: getActiveApiKey(aiConfig), provider: aiConfig.provider, model: aiConfig.model }, MEIHUA_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');

      if (activeHistoryId) {
        upsertHistory(activeHistoryId, question, {
          module: 'meihua',
          method: result.method,
          input: result.input,
          result,
        }, finalMessages);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('AI回答失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, question, result, upsertHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const isInitialAskVisible = result && !hasAIResponse && !aiLoading && !streamingText;

  // Current time display for time-based casting
  const now = new Date();
  const timeDisplay = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}时${String(now.getMinutes()).padStart(2, '0')}分`;

  const CAST_METHODS = [
    { id: 'number', label: '报数' },
    { id: 'time', label: '时间' },
    { id: 'text', label: '文字' },
  ];

  return (
    <div className="space-y-6">
      {/* 占问事项 */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-2 font-title">占问事项</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="请输入你想占问的事项，如：这件事能成吗？"
          className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-4 py-3 text-[var(--color-text)]
            placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body"
        />
      </section>

      {/* 起卦方式 */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-3 font-title">起卦方式</label>

        {/* Method tabs */}
        <div className="flex gap-1 mb-4 bg-[var(--color-surface-subtle)] rounded-lg p-1">
          {CAST_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setCastMethod(m.id)}
              className={`flex-1 py-2 text-sm rounded-md transition-colors font-body
                ${castMethod === m.id
                  ? 'bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Number input */}
        {castMethod === 'number' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2 font-body">
              心中默想所问之事，随意报出两个正整数
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={inputNum1}
                onChange={e => setInputNum1(e.target.value)}
                placeholder="第一个数"
                className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-3 text-[var(--color-text)] text-center text-lg
                  placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
              />
              <input
                type="number"
                min="1"
                value={inputNum2}
                onChange={e => setInputNum2(e.target.value)}
                placeholder="第二个数"
                className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-3 text-[var(--color-text)] text-center text-lg
                  placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
              />
            </div>
            <button
              onClick={handleCastByNumber}
              disabled={casting}
              className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
            >
              起卦
            </button>
          </div>
        )}

        {/* Time input */}
        {castMethod === 'time' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2 font-body">
              以当前时间自动计算卦象（传统用农历，此处使用公历近似）
            </div>
            <div className="text-center py-4 bg-[var(--color-surface-subtle)] rounded-lg">
              <div className="text-[var(--color-text)] text-lg font-title">{timeDisplay}</div>
            </div>
            <button
              onClick={handleCastByTime}
              disabled={casting}
              className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
            >
              以此时起卦
            </button>
          </div>
        )}

        {/* Text input */}
        {castMethod === 'text' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2 font-body">
              输入汉字，按笔画数起卦（一字取同卦，二字分上下，三字以上前半后半分）
            </div>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="输入汉字，如：平安"
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-4 py-3 text-[var(--color-text)] text-center text-lg
                placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-gold-border-med)] focus:outline-none font-body"
            />
            <button
              onClick={handleCastByText}
              disabled={casting}
              className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
            >
              起卦
            </button>
          </div>
        )}

        {/* Reset button */}
        {result && (
          <button
            onClick={reset}
            className="mt-3 w-full px-6 py-2 border border-[var(--color-surface-border-med)] text-[var(--color-text-dim)] rounded-lg
              hover:bg-[var(--color-surface-dim)] transition-colors text-sm font-body"
          >
            重新起卦
          </button>
        )}
      </section>

      {/* 起卦动画 */}
      {casting && <CastingAnimation />}

      {/* 排盘结果 */}
      {result && <MeihuaDisplay result={result} />}

      {/* AI断卦 + 多轮对话 */}
      {result && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">AI 解读</h3>
            {isInitialAskVisible && (
              <button
                onClick={askAI}
                className="bg-[var(--color-gold-bg)] text-[var(--color-gold)] px-4 py-2 rounded-lg text-sm
                  hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
              >
                请求 AI 断卦
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

          {hasAIResponse && !aiLoading && (
            <div className="mt-4 pt-4 border-t border-[var(--color-gold-border-light)] flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="继续追问，如：能详细分析一下变卦吗？"
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
              请先在设置中输入 Claude API Key 以使用 AI 解读功能。
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
    </div>
  );
}
