import { useState, useEffect, useCallback, useRef } from 'react';
import { buildPalmTextMessage, buildPalmVisionMessage, buildFollowUpMessage, buildPalmLineIdentificationMessage, parsePalmLineIdentification, PALM_LINE_ID_PROMPT } from './engine.js';
import { PALM_SYSTEM_PROMPT } from './prompt.js';
import { HAND_WUXING_TYPES } from './data.js';
import { aiInterpret, aiIdentifyPalmLines } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { detectHand, analyzeHandFeatures } from '../../lib/mediapipe.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import PalmLineQuestionnaire from '../../components/PalmLineQuestionnaire.jsx';

// ===== ML处理动画 =====
function MLProcessingStatus({ status }) {
  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-taiji-spin" style={{ transformOrigin: 'center' }}>☯</div>
        <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">{status}</div>
      </div>
    </div>
  );
}

// ===== 特征摘要 =====
function HandFeatureSummary({ features }) {
  const wuxing = HAND_WUXING_TYPES[features.handType] || HAND_WUXING_TYPES.earth;
  return (
    <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
      <div className="text-xs text-[var(--color-gold)] font-medium mb-2 font-body">✅ 手部特征已提取</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-dim)] font-body">
        <div>手型：<span className="text-[var(--color-text)]">{wuxing.name}</span></div>
        <div>手别：<span className="text-[var(--color-text)]">{features.handedness === 'Right' ? '右手' : '左手'}</span></div>
        <div>掌指比：<span className="text-[var(--color-text)]">{features.palmRatio}</span></div>
        <div>食/无名指比：<span className="text-[var(--color-text)]">{features.indexRingRatio}</span></div>
      </div>
    </div>
  );
}

// ===== 主模块 =====
export default function PalmModule({
  aiConfig,
  setShowSettings,
  upsertHistory,
  activeHistoryId,
  setActiveHistoryId,
  pendingHistoryLoad,
  clearPendingHistoryLoad,
}) {
  // Flow: 'input' → 'analyzing' → 'questionnaire' → 'result'
  const [step, setStep] = useState('input');
  const [userNote, setUserNote] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // ML state
  const [mlStatus, setMlStatus] = useState('');
  const [extractedFeatures, setExtractedFeatures] = useState(null);
  const [palmBase64, setPalmBase64] = useState(null); // kept for optional Vision analysis

  // Questionnaire
  const [palmLineAnswers, setPalmLineAnswers] = useState(null);
  const [aiLineSuggestions, setAiLineSuggestions] = useState(null);

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
    if (pendingHistoryLoad && pendingHistoryLoad.module === 'palm') {
      const item = pendingHistoryLoad;
      setChatMessages(item.chatMessages || []);
      if (item.input) {
        setUserNote(item.input.note || '');
        setPalmLineAnswers(item.input.palmLineAnswers || null);
      }
      if (item.result) {
        setExtractedFeatures(item.result);
      }
      setStep('result');
      setShowCamera(false);
      setError('');
      setStreamingText('');
      setFollowUpInput('');
      clearPendingHistoryLoad();
    }
  }, [pendingHistoryLoad, clearPendingHistoryLoad]);

  const makeAiConfig = useCallback(() => ({
    apiKey: getActiveApiKey(aiConfig),
    provider: aiConfig.provider,
    model: aiConfig.model,
  }), [aiConfig]);

  // Reset
  const reset = useCallback(() => {
    setStep('input');
    setExtractedFeatures(null);
    setPalmBase64(null);
    setPalmLineAnswers(null);
    setAiLineSuggestions(null);
    setChatMessages([]);
    setStreamingText('');
    setAiLoading(false);
    setFollowUpInput('');
    setError('');
    setShowCamera(false);
    setMlStatus('');
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Save to history
  const saveToHistory = useCallback((msgs, features, answers) => {
    const id = activeHistoryId || `palm-${Date.now()}`;
    const wuxing = HAND_WUXING_TYPES[features?.handType] || HAND_WUXING_TYPES.earth;
    upsertHistory(id, `手相分析 · ${wuxing.name}${userNote ? ' · ' + userNote.slice(0, 15) : ''}`, {
      module: 'palm',
      input: { note: userNote, palmLineAnswers: answers },
      result: features,
    }, msgs);
    if (!activeHistoryId) setActiveHistoryId(id);
  }, [activeHistoryId, userNote, upsertHistory, setActiveHistoryId]);

  // Step 1: Photo captured → run MediaPipe hand detection
  const handlePhotoCapture = useCallback(async (base64) => {
    setShowCamera(false);
    setError('');
    setStep('analyzing');
    setPalmBase64(base64);

    try {
      // Create image element
      setMlStatus('正在加载手部识别模型...');
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Detect hand landmarks
      setMlStatus('正在检测手部特征...');
      const result = await detectHand(img);
      if (!result) {
        setError('未检测到手部，请确保：手掌正面展开 · 光线充足 · 五指张开');
        setStep('input');
        return;
      }

      // Analyze features
      setMlStatus('正在分析手部比例...');
      const features = analyzeHandFeatures(result.landmarks, result.handedness);
      setExtractedFeatures(features);

      // Vision API: identify palm lines from photo
      const activeKey = getActiveApiKey(aiConfig);
      if (activeKey) {
        setMlStatus('正在AI识别掌纹...');
        try {
          const visionMessage = buildPalmLineIdentificationMessage(base64);
          const rawResult = await aiIdentifyPalmLines(
            { apiKey: activeKey, provider: aiConfig.provider, model: aiConfig.model },
            PALM_LINE_ID_PROMPT,
            visionMessage
          );
          if (rawResult) {
            const validated = parsePalmLineIdentification(rawResult);
            if (validated) {
              setAiLineSuggestions(validated);
            } else {
              console.warn('[PalmModule] Vision API returned data but validation failed:', rawResult);
            }
          } else {
            console.warn('[PalmModule] Vision API returned null — falling back to blank questionnaire');
          }
        } catch (e) {
          console.warn('[PalmModule] Vision palm line identification failed, using blank questionnaire:', e.message);
        }
      }

      // Move to questionnaire
      setStep('questionnaire');
    } catch (e) {
      setError(`手部分析失败: ${e.message}`);
      console.error('Hand analysis failed:', e);
      setStep('input');
    }
  }, [aiConfig]);

  // Step 2: Questionnaire completed → send to LLM
  const handleQuestionnaireComplete = useCallback(async (answers) => {
    setPalmLineAnswers(answers);
    setStep('result');

    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    try {
      const textMsg = buildPalmTextMessage(extractedFeatures, answers, userNote);
      const wuxing = HAND_WUXING_TYPES[extractedFeatures?.handType] || HAND_WUXING_TYPES.earth;
      const displayMsg = { role: 'user', content: `[手相照片 · ${wuxing.name}]${userNote ? '\n' + userNote : ''}` };
      setChatMessages([displayMsg]);

      const fullText = await aiInterpret(makeAiConfig(), PALM_SYSTEM_PROMPT, [textMsg], (text) => {
        setStreamingText(text);
      });
      const assistantMsg = { role: 'assistant', content: fullText };
      const finalMessages = [displayMsg, assistantMsg];
      setChatMessages(finalMessages);
      setStreamingText('');
      saveToHistory(finalMessages, extractedFeatures, answers);
    } catch (e) {
      setError(`AI解读失败: ${e.message}`);
      console.error('Palm AI failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiConfig, extractedFeatures, userNote, makeAiConfig, saveToHistory, setShowSettings]);

  // Vision deep analysis (optional, uses API with image)
  const handleVisionAnalysis = useCallback(async () => {
    if (!palmBase64 || !extractedFeatures || aiLoading) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    try {
      const visionMsg = buildPalmVisionMessage(palmBase64, extractedFeatures, palmLineAnswers);
      const displayMsg = { role: 'user', content: '[AI视觉深度分析 · 照片已发送给AI]' };
      const updatedMessages = [...chatMessages, displayMsg];
      setChatMessages(updatedMessages);

      const fullText = await aiInterpret(makeAiConfig(), PALM_SYSTEM_PROMPT, [...chatMessages, visionMsg], (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      saveToHistory(finalMessages, extractedFeatures, palmLineAnswers);
    } catch (e) {
      setError(`视觉分析失败: ${e.message}`);
      console.error('Vision analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [palmBase64, extractedFeatures, palmLineAnswers, aiLoading, aiConfig, chatMessages, makeAiConfig, saveToHistory, setShowSettings]);

  // Follow-up question
  const askFollowUp = useCallback(async () => {
    if (!followUpInput.trim() || aiLoading) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    const userMsg = buildFollowUpMessage(followUpInput.trim());
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setFollowUpInput('');

    try {
      const fullText = await aiInterpret(makeAiConfig(), PALM_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      if (activeHistoryId) {
        saveToHistory(finalMessages, extractedFeatures, palmLineAnswers);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('Palm follow-up failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, extractedFeatures, palmLineAnswers, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="palm"
        origin="手相学源于古印度，经丝绸之路传入中国后与本土相术融合。通过观察手掌的形状、掌纹走向、丘位饱满度来推断性格与运势。本模块使用浏览器端AI提取手部21个关键点，计算手型、掌指比例等骨骼数据，结合用户自述掌纹，由AI综合解读。"
        strengths="五行手型分类 · 掌指比例分析 · 三大主线解读 · 丘位评估 · 食指无名指比"
      />

      {/* 输入阶段 */}
      {step === 'input' && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {/* 隐私提示 */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">🔒 隐私保护</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              您的照片仅在本地浏览器中处理，不会上传至任何服务器。仅提取的手部特征数据（文字）会发送给AI进行解读。
            </div>
          </div>

          {/* 拍摄指导 */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">📸 拍摄指导</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              手掌正面展开 · 五指自然张开 · 光线充足 · 尽量平整不弯曲
            </div>
          </div>

          {/* 已提取的特征摘要（重试时显示） */}
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}

          {/* 补充说明 */}
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">补充说明（可选）</label>
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="如：想了解事业方向、财运如何..."
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
                text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
            />
          </div>

          {/* 拍照 / 上传 */}
          {showCamera ? (
            <CameraCapture
              facingMode="environment"
              onCapture={handlePhotoCapture}
              onCancel={() => setShowCamera(false)}
            />
          ) : (
            <button
              onClick={() => setShowCamera(true)}
              className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
            >
              拍照 / 上传手掌照片
            </button>
          )}
        </section>
      )}

      {/* ML处理中 */}
      {step === 'analyzing' && <MLProcessingStatus status={mlStatus} />}

      {/* 问卷阶段 */}
      {step === 'questionnaire' && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}
          <PalmLineQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onBack={() => setStep('input')}
            aiSuggestions={aiLineSuggestions}
          />
        </section>
      )}

      {/* AI对话阶段 */}
      {step === 'result' && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">手相分析</h3>
            <button
              onClick={reset}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors font-body"
            >
              重新分析
            </button>
          </div>

          {/* 特征摘要 */}
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}

          {/* Loading before any response */}
          {aiLoading && !streamingText && !hasAIResponse && (
            <div className="mt-4">
              <MLProcessingStatus status="AI手相解读中..." />
            </div>
          )}

          {/* Chat messages */}
          {(hasAIResponse || streamingText) && (
            <div className="space-y-4 mt-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                  {msg.role === 'user' ? (
                    <div className="inline-block bg-[var(--color-gold-bg)] text-[var(--color-text)] text-sm rounded-xl px-4 py-2 max-w-[85%] text-left font-body whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-[var(--color-text)] text-sm leading-relaxed font-body whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}

              {streamingText && (
                <div className="text-[var(--color-text)] text-sm leading-relaxed font-body whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-2 h-4 bg-[var(--color-gold)] ml-0.5 animate-pulse" />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          {error && (
            <div className="mt-3 text-red-400 text-sm font-body">{error}</div>
          )}

          {/* Vision deep analysis button */}
          {hasAIResponse && !aiLoading && palmBase64 && (
            <button
              onClick={handleVisionAnalysis}
              className="mt-3 w-full bg-[var(--color-surface-dim)] text-[var(--color-text-dim)] text-xs py-2.5 rounded-lg
                border border-[var(--color-surface-border)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)] transition-colors font-body"
            >
              🔍 AI视觉深度分析（将照片发送给AI，需消耗更多额度）
            </button>
          )}

          {/* Follow-up */}
          {hasAIResponse && !aiLoading && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="追问更多细节..."
                className="flex-1 bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
                  text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring font-body text-sm"
              />
              <button
                onClick={askFollowUp}
                disabled={!followUpInput.trim()}
                className="bg-[var(--color-gold-bg)] text-[var(--color-gold)] px-4 rounded-lg
                  hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-50 font-body text-sm"
              >
                发送
              </button>
            </div>
          )}

          {aiLoading && streamingText === '' && hasAIResponse && (
            <div className="mt-3 text-[var(--color-gold-muted)] text-sm animate-pulse font-body">思考中...</div>
          )}
        </section>
      )}

      {/* Error outside chat (input phase) */}
      {error && step === 'input' && (
        <div className="bg-[var(--color-bg-card)] card-blur border border-red-300/30 rounded-xl p-4">
          <div className="text-red-400 text-sm font-body">{error}</div>
          <button
            onClick={() => { setError(''); setShowCamera(true); }}
            className="mt-2 text-xs text-[var(--color-gold)] hover:underline font-body"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}
