import { useState, useEffect, useCallback, useRef } from 'react';
import { throwCoins, randomThrows, paipan, formatForAI } from './engine.js';
import { WUXING_CN, YAO_NAMES } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { LIUYAO_SYSTEM_PROMPT } from './prompt.js';

// ===== 铜钱动画组件 =====
function CoinAnimation({ phase, coins }) {
  return (
    <div className="flex justify-center items-center gap-6 py-5">
      {[0, 1, 2].map((i) => {
        const isLanding = phase === 'landing' && coins;
        const isFront = isLanding && coins[i] === 3; // 字面 = front

        return (
          <div key={i} className="flex flex-col items-center">
            {/* Coin image */}
            <div
              className={`w-14 h-14 relative ${phase === 'spinning' ? 'animate-coin-toss' : ''} ${isLanding ? 'animate-coin-bounce' : ''}`}
              style={{
                animationDelay: phase === 'spinning' ? `${i * 100}ms` : isLanding ? `${i * 80}ms` : undefined,
                perspective: '400px',
              }}
            >
              <img
                src={isLanding ? (isFront ? '/assets/coin-front.webp' : '/assets/coin-back.webp') : '/assets/coin-front.webp'}
                alt={isLanding ? (isFront ? '字' : '花') : ''}
                className="w-full h-full object-cover rounded-full drop-shadow-md"
              />
            </div>
            {/* Shadow */}
            <div
              className={`w-10 h-2 rounded-full bg-[var(--color-text)] mt-1 ${phase === 'spinning' ? 'animate-coin-shadow' : ''}`}
              style={{
                opacity: 0.12,
                animationDelay: phase === 'spinning' ? `${i * 100}ms` : undefined,
              }}
            />
            {/* Label */}
            {isLanding && (
              <span className={`text-xs mt-1 font-bold font-body ${isFront ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-dim)]'}`}>
                {isFront ? '字' : '花'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== 铜钱结果组件 =====
function CoinThrow({ value, label }) {
  // value: 6=老阴(3花), 7=少阳(2花1字), 8=少阴(1花2字), 9=老阳(3字)
  let coinFaces; // true = 字(front), false = 花(back)
  if (value === 6) coinFaces = [false, false, false];
  else if (value === 7) coinFaces = [true, false, false];
  else if (value === 8) coinFaces = [true, true, false];
  else if (value === 9) coinFaces = [true, true, true];

  const typeMap = { 6: '老阴 ⚋×', 7: '少阳 ⚊', 8: '少阴 ⚋', 9: '老阳 ⚊○' };
  const isMoving = value === 6 || value === 9;

  return (
    <div className={`flex items-center gap-3 py-1.5 px-3 rounded-lg ${isMoving ? 'bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)]' : 'bg-[var(--color-surface-dim)]'}`}>
      <span className="text-[var(--color-text-dim)] text-sm w-10 font-body">{label}</span>
      <div className="flex gap-1.5">
        {coinFaces.map((isFront, i) => (
          <img
            key={i}
            src={isFront ? '/assets/coin-front.webp' : '/assets/coin-back.webp'}
            alt={isFront ? '字' : '花'}
            className="w-7 h-7 object-cover rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-[var(--color-text-dim)] font-body">= {value}</span>
      <span className={`text-sm font-medium font-body ${isMoving ? 'text-[var(--color-gold)]' : 'text-[var(--color-text)]'}`}>
        {typeMap[value]}
      </span>
    </div>
  );
}

// ===== 卦面显示组件 =====
function GuaDisplay({ result }) {
  if (!result) return null;

  const lines = result.lines.slice().reverse();

  const wuxingColor = {
    'metal': 'text-[var(--color-wx-metal)]',
    'wood': 'text-[var(--color-wx-wood)]',
    'water': 'text-[var(--color-wx-water)]',
    'fire': 'text-[var(--color-wx-fire)]',
    'earth': 'text-[var(--color-wx-earth)]',
  };

  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
      {/* 卦头信息 */}
      <div className="text-center mb-4 pb-3 border-b border-[var(--color-gold-border-light)]">
        <div className="text-[var(--color-text-dim)] text-sm mb-1 font-body">
          {result.date.yearStem}{result.date.yearBranch}年 {result.date.monthBranch}月 {result.date.dayStem}{result.date.dayBranch}日
        </div>
        <div className="flex justify-center items-center gap-4">
          <div>
            <div className="text-[var(--color-gold)] text-xl font-title">{result.benGua.name}</div>
            <div className="text-[var(--color-text-dim)] text-xs mt-0.5 font-body">{result.benGua.palace}·{result.benGua.palaceWuxingCn}·{result.benGua.guaType}</div>
          </div>
          {result.bianGua && (
            <>
              <span className="text-[var(--color-gold-muted)] text-lg">→</span>
              <div>
                <div className="text-[var(--color-jade)] text-xl font-title">{result.bianGua.name}</div>
                <div className="text-[var(--color-text-dim)] text-xs mt-0.5 font-body">变卦</div>
              </div>
            </>
          )}
        </div>
        <div className="text-[var(--color-text-dim)] text-xs mt-2 font-body">空亡：{result.kongWang.join('、')}</div>
      </div>

      {/* 六爻盘面 */}
      <div className="font-mono text-sm">
        <div className="grid gap-x-2 pb-2 mb-2 border-b border-[var(--color-gold-border-light)] text-[var(--color-text-dim)] text-xs"
          style={{ gridTemplateColumns: result.bianGua ? '60px 1fr 1fr' : '60px 1fr' }}>
          <span>六神</span>
          <span>本卦：{result.benGua.name}</span>
          {result.bianGua && <span>变卦：{result.bianGua.name}</span>}
        </div>

        {lines.map((line) => (
          <div
            key={line.position}
            className={`grid gap-x-2 py-1.5 border-b border-[var(--color-surface-border)]
              ${line.isMoving ? 'bg-[var(--color-gold-bg-faint)]' : ''}`}
            style={{ gridTemplateColumns: result.bianGua ? '60px 1fr 1fr' : '60px 1fr' }}
          >
            <span className="text-[var(--color-text-dim)] text-xs flex items-center">{line.spirit}</span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[var(--color-text-dim)] text-xs w-8">{line.positionName}</span>
              <span className={`text-base ${line.yinyang === 'yang' ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>
                {line.yinyang === 'yang' ? '⚊' : '⚋'}
              </span>
              <span className="text-xs">{line.liuqin}</span>
              <span className={`text-xs ${wuxingColor[line.wuxing]}`}>
                {line.stem}{line.branch}{line.wuxingCn}
              </span>
              {line.isMoving && <span className="text-[var(--color-gold)] text-xs">○</span>}
              {line.isWorld && <span className="text-[var(--color-gold)] text-xs font-bold ml-1">世</span>}
              {line.isResponse && <span className="text-[var(--color-jade)] text-xs font-bold ml-1">应</span>}
              {line.isEmpty && <span className="text-[var(--color-cinnabar)] text-xs ml-1">(空)</span>}
            </div>

            {result.bianGua && (
              <div className="flex items-center gap-1.5">
                {line.isMoving && line.bianYao ? (
                  <>
                    <span className="text-base text-[var(--color-jade)]">
                      {line.yinyang === 'yang' ? '⚋' : '⚊'}
                    </span>
                    <span className="text-xs">{line.bianYao.liuqin}</span>
                    <span className={`text-xs ${wuxingColor[line.bianYao.wuxing]}`}>
                      {line.bianYao.stem}{line.bianYao.branch}{line.bianYao.wuxingCn}
                    </span>
                  </>
                ) : (
                  <span className="text-[var(--color-surface-border)]">—</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 伏神信息 */}
      {result.fushen.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-gold-border-light)]">
          <div className="text-[var(--color-text-dim)] text-xs mb-1 font-body">伏神：</div>
          {result.fushen.map((f, i) => (
            <div key={i} className="text-xs text-[var(--color-text-dim)] font-body">
              伏{f.liuqin} {f.najia}({WUXING_CN[f.wuxing]}) → 伏于{YAO_NAMES[f.position - 1]}下
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 六爻模块主组件 =====
export default function LiuyaoModule({ apiKey, setShowSettings, upsertHistory, activeHistoryId, setActiveHistoryId, pendingHistoryLoad, clearPendingHistoryLoad }) {
  const [question, setQuestion] = useState('');
  const [throws, setThrows] = useState([]);
  const [result, setResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [error, setError] = useState('');
  const [animatingCoins, setAnimatingCoins] = useState(null);

  const chatEndRef = useRef(null);

  // Handle history loading from parent
  useEffect(() => {
    if (pendingHistoryLoad && (pendingHistoryLoad.module || 'liuyao') === 'liuyao') {
      const item = pendingHistoryLoad;
      setQuestion(item.question || '');
      setThrows(item.throws || []);
      setResult(item.result || null);
      setChatMessages(item.chatMessages || []);
      setStreamingText('');
      setFollowUpInput('');
      setError('');
      setAnimatingCoins(null);
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, streamingText]);

  // 逐爻摇卦 (with coin animation)
  const shakeOnce = useCallback(() => {
    if (throws.length >= 6 || animatingCoins) return;

    setAnimatingCoins({ phase: 'spinning' });
    setTimeout(() => {
      const { coins, total } = throwCoins();
      setAnimatingCoins({ phase: 'landing', coins, total });
      setTimeout(() => {
        setThrows(prev => [...prev, total]);
        setAnimatingCoins(null);
      }, 600);
    }, 800);
  }, [throws.length, animatingCoins]);

  // 一键起卦
  const quickThrow = useCallback(() => {
    const values = randomThrows();
    setThrows(values);
  }, []);

  // 重新起卦
  const reset = useCallback(() => {
    setThrows([]);
    setResult(null);
    setChatMessages([]);
    setStreamingText('');
    setFollowUpInput('');
    setError('');
    setAnimatingCoins(null);
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // 摇满6爻后自动排盘
  useEffect(() => {
    if (throws.length === 6 && !result) {
      try {
        const r = paipan(throws);
        setResult(r);
      } catch (e) {
        setError(`排盘错误: ${e.message}`);
        console.error('排盘错误:', e);
      }
    }
  }, [throws, result]);

  // AI断卦 (initial)
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
      const fullText = await aiInterpret(apiKey, LIUYAO_SYSTEM_PROMPT, messages, (text) => {
        setStreamingText(text);
      });
      const newChatMessages = [userMsg, { role: 'assistant', content: fullText }];
      setChatMessages(newChatMessages);
      setStreamingText('');

      // Auto-save to history
      const historyId = activeHistoryId || Date.now().toString();
      setActiveHistoryId(historyId);
      upsertHistory(historyId, question, { throws, result, module: 'liuyao' }, newChatMessages);
    } catch (e) {
      setError(`AI解读失败: ${e.message}`);
      console.error('AI解读失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [result, apiKey, question, throws, activeHistoryId, setActiveHistoryId, upsertHistory, setShowSettings]);

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
      const fullText = await aiInterpret(apiKey, LIUYAO_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');

      if (activeHistoryId) {
        upsertHistory(activeHistoryId, question, { throws, result, module: 'liuyao' }, finalMessages);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('AI回答失败:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, apiKey, chatMessages, activeHistoryId, question, throws, result, upsertHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const isInitialAskVisible = result && !hasAIResponse && !aiLoading && !streamingText;

  return (
    <div className="space-y-6">
      {/* 输入区 */}
      <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
        <label className="block text-[var(--color-gold)] text-sm font-medium mb-2 font-title">占问事项</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="请输入你想占问的事项，如：近期事业发展如何？"
          className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-4 py-3 text-[var(--color-text)]
            placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body"
        />

        <div className="flex gap-3 mt-4">
          {throws.length < 6 && (
            <>
              <button
                onClick={shakeOnce}
                disabled={!!animatingCoins}
                className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                  hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 btn-glow font-body"
              >
                {animatingCoins ? '摇卦中...' : throws.length === 0 ? '开始摇卦' : `摇第${throws.length + 1}爻`}
              </button>
              <button
                onClick={quickThrow}
                disabled={!!animatingCoins}
                className="px-6 py-3 border border-[var(--color-gold-border)] text-[var(--color-gold-strong)] rounded-lg
                  hover:bg-[var(--color-gold-bg-faint)] disabled:opacity-50 transition-colors text-sm font-body"
              >
                一键起卦
              </button>
            </>
          )}
          {throws.length === 6 && (
            <button
              onClick={reset}
              className="px-6 py-3 border border-[var(--color-surface-border-med)] text-[var(--color-text-dim)] rounded-lg
                hover:bg-[var(--color-surface-dim)] transition-colors text-sm font-body"
            >
              重新起卦
            </button>
          )}
        </div>
      </section>

      {/* 铜钱动画 */}
      {animatingCoins && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-4">
          <CoinAnimation phase={animatingCoins.phase} coins={animatingCoins.coins} />
          <div className="text-center text-[var(--color-text-dim)] text-xs mt-1 font-body">
            {animatingCoins.phase === 'spinning' ? '铜钱翻转中...' : `结果: ${animatingCoins.total}`}
          </div>
        </section>
      )}

      {/* 摇卦过程 */}
      {throws.length > 0 && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <h3 className="text-[var(--color-gold)] text-sm font-medium mb-3 font-title">摇卦结果</h3>
          <div className="space-y-1.5">
            {throws.map((v, i) => (
              <CoinThrow key={i} value={v} label={YAO_NAMES[i]} />
            ))}
          </div>
          {throws.length < 6 && (
            <div className="text-[var(--color-text-dim)] text-xs mt-3 font-body">
              已摇 {throws.length}/6 爻，继续摇卦...
            </div>
          )}
        </section>
      )}

      {/* 排盘结果 */}
      {result && <GuaDisplay result={result} />}

      {/* AI断卦 + 多轮对话 */}
      {result && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">AI 解读</h3>
            {isInitialAskVisible && (
              <button
                onClick={askAI}
                className="bg-[var(--color-gold-bg)] text-[var(--color-gold)] px-4 py-2 rounded-lg text-sm
                  hover:bg-[var(--color-gold-bg-hover)] transition-colors font-body"
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
                placeholder="继续追问，如：能详细说说财运方面吗？"
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

          {!apiKey && !hasAIResponse && (
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
