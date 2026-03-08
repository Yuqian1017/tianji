import { useState, useEffect, useCallback, useRef } from 'react';
import { castByNumber, castByTime, castByText, formatForAI } from './engine.js';
import { WUXING_CN, XIANTIAN } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { MEIHUA_SYSTEM_PROMPT } from './prompt.js';

// Five-element color mapping (reuse theme CSS variables)
const wuxingColor = {
  metal: 'text-[var(--color-wx-metal)]',
  wood: 'text-[var(--color-wx-wood)]',
  water: 'text-[var(--color-wx-water)]',
  fire: 'text-[var(--color-wx-fire)]',
  earth: 'text-[var(--color-wx-earth)]',
};

const wuxingBgColor = {
  metal: 'bg-[rgba(200,192,176,0.15)]',
  wood: 'bg-[rgba(109,184,112,0.15)]',
  water: 'bg-[rgba(91,142,201,0.15)]',
  fire: 'bg-[rgba(212,87,74,0.15)]',
  earth: 'bg-[rgba(212,168,67,0.15)]',
};

// ===== 排盘结果显示组件 =====
function MeihuaDisplay({ result }) {
  if (!result) return null;

  const { upper, lower, dong, tiGua, yongGua, benGua, huGua, bianGua, tiYong } = result;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[rgba(200,149,108,0.2)] rounded-xl p-5 space-y-4">
      {/* 本卦名 */}
      <div className="text-center pb-3 border-b border-[rgba(200,149,108,0.1)]">
        <div className="text-[var(--color-gold)] text-xl font-bold mb-1">{benGua.name}</div>
        <div className="text-[var(--color-text-dim)] text-xs">本卦</div>
      </div>

      {/* 上下卦 + 体用 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 上卦 */}
        <div className={`rounded-lg p-3 border ${tiGua.position === 'upper'
          ? 'border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.08)]'
          : 'border-[rgba(122,184,168,0.4)] bg-[rgba(122,184,168,0.08)]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--color-text-dim)] text-xs">上卦</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${tiGua.position === 'upper'
              ? 'bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)]'
              : 'bg-[rgba(122,184,168,0.2)] text-[var(--color-jade)]'}`}>
              {tiGua.position === 'upper' ? '体' : '用'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">{upper.symbol}</div>
            <div className="text-[var(--color-text)] font-bold">{upper.name}</div>
            <div className={`text-xs mt-0.5 ${wuxingColor[upper.wuxing]}`}>
              {upper.nature} · {WUXING_CN[upper.wuxing]}
            </div>
          </div>
        </div>

        {/* 下卦 */}
        <div className={`rounded-lg p-3 border ${tiGua.position === 'lower'
          ? 'border-[rgba(200,149,108,0.4)] bg-[rgba(200,149,108,0.08)]'
          : 'border-[rgba(122,184,168,0.4)] bg-[rgba(122,184,168,0.08)]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--color-text-dim)] text-xs">下卦</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${tiGua.position === 'lower'
              ? 'bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)]'
              : 'bg-[rgba(122,184,168,0.2)] text-[var(--color-jade)]'}`}>
              {tiGua.position === 'lower' ? '体' : '用'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">{lower.symbol}</div>
            <div className="text-[var(--color-text)] font-bold">{lower.name}</div>
            <div className={`text-xs mt-0.5 ${wuxingColor[lower.wuxing]}`}>
              {lower.nature} · {WUXING_CN[lower.wuxing]}
            </div>
          </div>
        </div>
      </div>

      {/* 动爻 */}
      <div className="text-center text-sm text-[var(--color-text-dim)]">
        动爻：第 <span className="text-[var(--color-gold)] font-bold">{dong}</span> 爻
        （{dong <= 3 ? '下卦动' : '上卦动'}）
      </div>

      {/* 体用关系 */}
      <div className={`rounded-lg p-4 text-center ${wuxingBgColor[tiGua.wuxing]} border border-[rgba(255,255,255,0.05)]`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-sm">
            <span className="text-[var(--color-gold)]">体</span>
            <span className={`ml-1 ${wuxingColor[tiGua.wuxing]}`}>{tiGua.name}({WUXING_CN[tiGua.wuxing]})</span>
          </div>
          <span className="text-[var(--color-text-dim)]">←→</span>
          <div className="text-sm">
            <span className="text-[var(--color-jade)]">用</span>
            <span className={`ml-1 ${wuxingColor[yongGua.wuxing]}`}>{yongGua.name}({WUXING_CN[yongGua.wuxing]})</span>
          </div>
        </div>
        <div className="text-lg font-bold">
          <span className="mr-2">{tiYong.icon}</span>
          <span className="text-[var(--color-text)]">{tiYong.desc}</span>
          <span className="text-[var(--color-text-dim)] ml-2">— {tiYong.verdict}</span>
        </div>
      </div>

      {/* 互卦 + 变卦 */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(255,255,255,0.05)]">
          <div className="text-[var(--color-text-dim)] text-xs mb-1">互卦（过程）</div>
          <div className="text-[var(--color-text)] font-medium">{huGua.name}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
            <span className={wuxingColor[huGua.upper.wuxing]}>{huGua.upper.name}</span>
            <span className="mx-1">/</span>
            <span className={wuxingColor[huGua.lower.wuxing]}>{huGua.lower.name}</span>
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(255,255,255,0.05)]">
          <div className="text-[var(--color-text-dim)] text-xs mb-1">变卦（结果）</div>
          <div className="text-[var(--color-jade)] font-medium">{bianGua.name}</div>
          <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
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
export default function MeihuaModule({ apiKey, setShowSettings, upsertHistory, activeHistoryId, setActiveHistoryId, pendingHistoryLoad, clearPendingHistoryLoad }) {
  const [question, setQuestion] = useState('');
  const [castMethod, setCastMethod] = useState('number'); // 'number' | 'time' | 'text'
  const [inputNum1, setInputNum1] = useState('');
  const [inputNum2, setInputNum2] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
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

  // 报数起卦
  const handleCastByNumber = useCallback(() => {
    const n1 = parseInt(inputNum1, 10);
    const n2 = parseInt(inputNum2, 10);
    if (!n1 || !n2 || n1 < 1 || n2 < 1) {
      setError('请输入两个正整数');
      return;
    }
    setError('');
    try {
      const r = castByNumber(n1, n2);
      setResult(r);
      setChatMessages([]);
      setStreamingText('');
      setActiveHistoryId(null);
    } catch (e) {
      setError(`起卦错误: ${e.message}`);
      console.error('起卦错误:', e);
    }
  }, [inputNum1, inputNum2, setActiveHistoryId]);

  // 时间起卦
  const handleCastByTime = useCallback(() => {
    setError('');
    try {
      const r = castByTime();
      setResult(r);
      setChatMessages([]);
      setStreamingText('');
      setActiveHistoryId(null);
    } catch (e) {
      setError(`起卦错误: ${e.message}`);
      console.error('起卦错误:', e);
    }
  }, [setActiveHistoryId]);

  // 文字起卦
  const handleCastByText = useCallback(() => {
    if (!inputText.trim()) {
      setError('请输入至少一个汉字');
      return;
    }
    setError('');
    try {
      const r = castByText(inputText.trim());
      setResult(r);
      setChatMessages([]);
      setStreamingText('');
      setActiveHistoryId(null);
    } catch (e) {
      setError(`起卦错误: ${e.message}`);
      console.error('起卦错误:', e);
    }
  }, [inputText, setActiveHistoryId]);

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
    if (!apiKey) {
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
      const fullText = await aiInterpret(apiKey, MEIHUA_SYSTEM_PROMPT, messages, (text) => {
        setStreamingText(text);
      });
      const newChatMessages = [userMsg, { role: 'assistant', content: fullText }];
      setChatMessages(newChatMessages);
      setStreamingText('');

      // Auto-save to history
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
  }, [result, apiKey, question, activeHistoryId, setActiveHistoryId, upsertHistory, setShowSettings]);

  // 追问
  const askFollowUp = useCallback(async () => {
    const trimmed = followUpInput.trim();
    if (!trimmed || aiLoading) return;
    if (!apiKey) {
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
      const fullText = await aiInterpret(apiKey, MEIHUA_SYSTEM_PROMPT, updatedMessages, (text) => {
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
  }, [followUpInput, aiLoading, apiKey, chatMessages, activeHistoryId, question, result, upsertHistory, setShowSettings]);

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
      <section className="bg-[var(--color-bg-card)] border border-[rgba(200,149,108,0.2)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-2">占问事项</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="请输入你想占问的事项，如：这件事能成吗？"
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[var(--color-text)]
            placeholder:text-[rgba(232,224,212,0.3)] focus:border-[rgba(200,149,108,0.5)] focus:outline-none transition-colors"
        />
      </section>

      {/* 起卦方式 */}
      <section className="bg-[var(--color-bg-card)] border border-[rgba(200,149,108,0.2)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-3">起卦方式</label>

        {/* Method tabs */}
        <div className="flex gap-1 mb-4 bg-[rgba(255,255,255,0.03)] rounded-lg p-1">
          {CAST_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setCastMethod(m.id)}
              className={`flex-1 py-2 text-sm rounded-md transition-colors
                ${castMethod === m.id
                  ? 'bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Number input */}
        {castMethod === 'number' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2">
              心中默想所问之事，随意报出两个正整数
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={inputNum1}
                onChange={e => setInputNum1(e.target.value)}
                placeholder="第一个数"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-3 text-[var(--color-text)] text-center text-lg
                  placeholder:text-[rgba(232,224,212,0.3)] focus:border-[rgba(200,149,108,0.5)] focus:outline-none"
              />
              <input
                type="number"
                min="1"
                value={inputNum2}
                onChange={e => setInputNum2(e.target.value)}
                placeholder="第二个数"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-3 text-[var(--color-text)] text-center text-lg
                  placeholder:text-[rgba(232,224,212,0.3)] focus:border-[rgba(200,149,108,0.5)] focus:outline-none"
              />
            </div>
            <button
              onClick={handleCastByNumber}
              className="w-full bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[rgba(200,149,108,0.3)] transition-colors"
            >
              起卦
            </button>
          </div>
        )}

        {/* Time input */}
        {castMethod === 'time' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2">
              以当前时间自动计算卦象（传统用农历，此处使用公历近似）
            </div>
            <div className="text-center py-4 bg-[rgba(255,255,255,0.03)] rounded-lg">
              <div className="text-[var(--color-text)] text-lg">{timeDisplay}</div>
            </div>
            <button
              onClick={handleCastByTime}
              className="w-full bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[rgba(200,149,108,0.3)] transition-colors"
            >
              以此时起卦
            </button>
          </div>
        )}

        {/* Text input */}
        {castMethod === 'text' && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--color-text-dim)] mb-2">
              输入汉字，按笔画数起卦（一字取同卦，二字分上下，三字以上前半后半分）
            </div>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="输入汉字，如：平安"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-[var(--color-text)] text-center text-lg
                placeholder:text-[rgba(232,224,212,0.3)] focus:border-[rgba(200,149,108,0.5)] focus:outline-none"
            />
            <button
              onClick={handleCastByText}
              className="w-full bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[rgba(200,149,108,0.3)] transition-colors"
            >
              起卦
            </button>
          </div>
        )}

        {/* Reset button (shown when we have a result) */}
        {result && (
          <button
            onClick={reset}
            className="mt-3 w-full px-6 py-2 border border-[rgba(255,255,255,0.2)] text-[var(--color-text-dim)] rounded-lg
              hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm"
          >
            重新起卦
          </button>
        )}
      </section>

      {/* 排盘结果 */}
      {result && <MeihuaDisplay result={result} />}

      {/* AI断卦 + 多轮对话 */}
      {result && (
        <section className="bg-[var(--color-bg-card)] border border-[rgba(200,149,108,0.2)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium">AI 解读</h3>
            {isInitialAskVisible && (
              <button
                onClick={askAI}
                className="bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] px-4 py-2 rounded-lg text-sm
                  hover:bg-[rgba(200,149,108,0.3)] transition-colors"
              >
                请求 AI 断卦
              </button>
            )}
          </div>

          <div className="space-y-4">
            {chatMessages.map((msg, i) => {
              // Skip the first user message (raw gua data)
              if (i === 0 && msg.role === 'user') return null;

              if (msg.role === 'user') {
                return (
                  <div key={i} className="border-l-2 border-[var(--color-gold)] pl-3 py-1">
                    <div className="text-[var(--color-gold)] text-xs mb-1">追问</div>
                    <div className="text-[var(--color-text)] text-sm">{msg.content}</div>
                  </div>
                );
              }

              return (
                <div key={i} className="text-[var(--color-text)] text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              );
            })}

            {streamingText && (
              <div className="text-[var(--color-text)] text-sm leading-relaxed whitespace-pre-wrap">
                {streamingText}
              </div>
            )}

            {aiLoading && !streamingText && (
              <span className="text-[rgba(200,149,108,0.6)] text-sm animate-pulse">解读中...</span>
            )}

            <div ref={chatEndRef} />
          </div>

          {hasAIResponse && !aiLoading && (
            <div className="mt-4 pt-4 border-t border-[rgba(200,149,108,0.1)] flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="继续追问，如：能详细分析一下变卦吗？"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-[var(--color-text)] text-sm
                  placeholder:text-[rgba(232,224,212,0.3)] focus:border-[rgba(200,149,108,0.5)] focus:outline-none transition-colors"
              />
              <button
                onClick={askFollowUp}
                disabled={!followUpInput.trim()}
                className="px-4 py-2 bg-[rgba(200,149,108,0.2)] text-[var(--color-gold)] rounded-lg text-sm
                  hover:bg-[rgba(200,149,108,0.3)] disabled:opacity-30 transition-colors whitespace-nowrap"
              >
                发送
              </button>
            </div>
          )}

          {hasAIResponse && aiLoading && (
            <div className="mt-4 pt-4 border-t border-[rgba(200,149,108,0.1)]">
              <div className="text-[rgba(200,149,108,0.6)] text-sm animate-pulse">回答中...</div>
            </div>
          )}

          {!apiKey && !hasAIResponse && (
            <div className="text-[var(--color-text-dim)] text-xs">
              请先在设置中输入 Claude API Key 以使用 AI 解读功能。
            </div>
          )}
        </section>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-[rgba(201,64,67,0.1)] border border-[rgba(201,64,67,0.3)] rounded-xl p-4 text-[var(--color-cinnabar)] text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
