import { useState, useEffect, useCallback, useRef } from 'react';
import { buildPalmTextMessage, buildFollowUpMessage, buildPalmVisionMessage } from './engine.js';
import { PALM_SYSTEM_PROMPT } from './prompt.js';
import { HAND_WUXING_TYPES } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { detectHand, analyzeHandFeatures } from '../../lib/mediapipe.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import PalmLineQuestionnaire from '../../components/PalmLineQuestionnaire.jsx';

// ===== ML Processing Animation =====
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

// ===== Hand Feature Summary =====
function HandFeatureSummary({ features }) {
  const handType = HAND_WUXING_TYPES[features.handType] || HAND_WUXING_TYPES.earth;
  return (
    <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
      <div className="text-xs text-[var(--color-gold)] font-medium mb-2 font-body">✅ 手部特征已提取</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-dim)] font-body">
        <div>手型：<span className="text-[var(--color-text)]">{handType.name}</span></div>
        <div>惯用手：<span className="text-[var(--color-text)]">{features.handedness === 'Left' ? '左手' : '右手'}</span></div>
        <div>掌指比：<span className="text-[var(--color-text)]">{features.palmRatio}</span></div>
        <div>2D:4D：<span className="text-[var(--color-text)]">{features.indexRingRatio}</span></div>
      </div>
    </div>
  );
}

// ===== Main Module =====
export default function PalmModule({
  aiConfig,
  setShowSettings,
  upsertHistory,
  activeHistoryId,
  setActiveHistoryId,
  pendingHistoryLoad,
  clearPendingHistoryLoad,
}) {
  // Multi-step flow: 'input' | 'analyzing' | 'questionnaire' | 'result'
  const [step, setStep] = useState('input');

  // Input state
  const [userNote, setUserNote] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // ML state
  const [mlStatus, setMlStatus] = useState('');
  const [extractedFeatures, setExtractedFeatures] = useState(null);
  const [capturedBase64, setCapturedBase64] = useState(null); // stored for optional Vision analysis

  // Questionnaire answers
  const [lineAnswers, setLineAnswers] = useState({});

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
        setLineAnswers(item.input.lineAnswers || {});
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

  // Build AI config
  const makeAiConfig = useCallback(() => ({
    apiKey: getActiveApiKey(aiConfig),
    provider: aiConfig.provider,
    model: aiConfig.model,
  }), [aiConfig]);

  // Reset
  const reset = useCallback(() => {
    setStep('input');
    setExtractedFeatures(null);
    setCapturedBase64(null);
    setLineAnswers({});
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
    const handType = HAND_WUXING_TYPES[features?.handType] || HAND_WUXING_TYPES.earth;
    upsertHistory(id, `手相分析 · ${handType.name}${userNote ? ' · ' + userNote.slice(0, 15) : ''}`, {
      module: 'palm',
      input: { note: userNote, lineAnswers: answers },
      result: features,
    }, msgs);
    if (!activeHistoryId) setActiveHistoryId(id);
  }, [activeHistoryId, userNote, upsertHistory, setActiveHistoryId]);

  // Handle photo captured — run MediaPipe → extract features → go to questionnaire
  const handlePhotoCapture = useCallback(async (base64) => {
    setShowCamera(false);
    setError('');
    setStep('analyzing');
    setCapturedBase64(base64);

    try {
      // 1. Create image element from base64
      setMlStatus('正在加载手部识别模型...');
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 2. Detect hand landmarks
      setMlStatus('正在检测手部特征...');
      const result = await detectHand(img);
      if (!result) {
        setError('未检测到手部，请确保：手掌正面朝向摄像头 · 手指自然张开 · 光线充足');
        setStep('input');
        return;
      }

      // 3. Analyze features
      setMlStatus('正在分析手部比例...');
      const features = analyzeHandFeatures(result.landmarks, result.handedness);
      setExtractedFeatures(features);

      // 4. Go to questionnaire step
      setStep('questionnaire');
    } catch (e) {
      setError(`手部分析失败: ${e.message}`);
      console.error('Palm analysis failed:', e);
      setStep('input');
    }
  }, []);

  // Handle questionnaire submit — send to LLM
  const handleQuestionnaireSubmit = useCallback(async (answers) => {
    setLineAnswers(answers);
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
      const handType = HAND_WUXING_TYPES[extractedFeatures?.handType] || HAND_WUXING_TYPES.earth;
      const displayMsg = { role: 'user', content: `[手相照片 · ${handType.name}]${userNote ? '\n' + userNote : ''}` };
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
      setError(`分析失败: ${e.message}`);
      console.error('Palm LLM failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiConfig, extractedFeatures, userNote, makeAiConfig, saveToHistory, setShowSettings]);

  // Vision deep analysis (optional — uses image)
  const handleVisionAnalysis = useCallback(async () => {
    if (!capturedBase64 || aiLoading) return;
    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    const visionMsg = buildPalmVisionMessage(capturedBase64);
    const displayMsg = { role: 'user', content: '[AI视觉深度分析 · 照片已发送]' };
    const updatedMessages = [...chatMessages, displayMsg];
    setChatMessages(updatedMessages);

    try {
      const fullText = await aiInterpret(makeAiConfig(), PALM_SYSTEM_PROMPT, [...updatedMessages.slice(0, -1), visionMsg], (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      if (activeHistoryId) {
        saveToHistory(finalMessages, extractedFeatures, lineAnswers);
      }
    } catch (e) {
      setError(`视觉分析失败: ${e.message}`);
      console.error('Palm vision analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [capturedBase64, aiLoading, aiConfig, chatMessages, activeHistoryId, extractedFeatures, lineAnswers, makeAiConfig, saveToHistory, setShowSettings]);

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
        saveToHistory(finalMessages, extractedFeatures, lineAnswers);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('Palm follow-up failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, extractedFeatures, lineAnswers, makeAiConfig, saveToHistory, setShowSettings]);

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
        origin="手相学融合中国相术与西方 palmistry，通过观察手掌骨骼结构、手指比例和掌纹来推断性格与运势。本模块使用浏览器端AI提取手部21个关键点，计算五行手型、手指比例、掌丘隆起等结构化数据，结合掌纹自测问卷，由AI进行手相解读。"
        strengths="五行手型分类 · 手指比例分析 · 2D:4D比 · 掌纹综合判读 · 可选AI视觉深度分析"
      />

      {/* Step 1: Input */}
      {step === 'input' && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {/* Privacy notice */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">🔒 隐私保护</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              您的照片仅在本地浏览器中处理，不会上传至任何服务器。仅提取的手部特征数据（文字）会发送给AI进行解读。
              如选择"AI视觉深度分析"，照片会发送给AI（需额外确认）。
            </div>
          </div>

          {/* Capture guidance */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">📸 拍摄指导</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              手掌正面朝向摄像头 · 手指自然张开 · 光线充足 · 尽量占满画面
            </div>
          </div>

          {/* Extracted features (on retry) */}
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}

          {/* User note */}
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">补充说明（可选）</label>
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="如：想了解感情运势、事业方向..."
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
                text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
            />
          </div>

          {/* Camera / upload */}
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

      {/* Step 2: ML Analyzing */}
      {step === 'analyzing' && <MLProcessingStatus status={mlStatus} />}

      {/* Step 3: Questionnaire */}
      {step === 'questionnaire' && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}
          <PalmLineQuestionnaire
            onSubmit={handleQuestionnaireSubmit}
            onCancel={() => setStep('input')}
          />
        </section>
      )}

      {/* Step 4: Result / Chat */}
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

          {/* Feature summary */}
          {extractedFeatures && <HandFeatureSummary features={extractedFeatures} />}

          {/* AI loading (before streaming) */}
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

          {/* Action buttons after AI response */}
          {hasAIResponse && !aiLoading && (
            <div className="mt-4 space-y-3">
              {/* Vision deep analysis button (only if we have the image) */}
              {capturedBase64 && !chatMessages.some(m => m.content?.includes('AI视觉深度分析')) && (
                <button
                  onClick={handleVisionAnalysis}
                  className="w-full text-sm text-[var(--color-gold)] py-2.5 rounded-lg border border-[var(--color-gold-border)]
                    hover:bg-[var(--color-gold-bg)] transition-colors font-body"
                >
                  🔍 AI视觉深度分析（发送照片给AI，获取更详细的掌纹解读）
                </button>
              )}

              {/* Follow-up input */}
              <div className="flex gap-2">
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
            </div>
          )}

          {aiLoading && streamingText === '' && hasAIResponse && (
            <div className="mt-3 text-[var(--color-gold-muted)] text-sm animate-pulse font-body">思考中...</div>
          )}
        </section>
      )}

      {/* Error outside chat (input/analyzing phases) */}
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
