import { useState, useEffect, useCallback, useRef } from 'react';
import { buildFaceTextMessage, buildFollowUpMessage } from './engine.js';
import { FACE_SYSTEM_PROMPT } from './prompt.js';
import { WUXING_FACE_TYPES } from './data.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { detectFace, analyzeFaceFeatures } from '../../lib/mediapipe.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';

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

// ===== 特征摘要（ML提取后显示） =====
function FeatureSummary({ features }) {
  const wuxing = WUXING_FACE_TYPES[features.faceShape] || WUXING_FACE_TYPES.wood;
  const { threeStops, symmetry } = features;
  return (
    <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
      <div className="text-xs text-[var(--color-gold)] font-medium mb-2 font-body">✅ 面部特征已提取</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-dim)] font-body">
        <div>面型：<span className="text-[var(--color-text)]">{wuxing.name}</span></div>
        <div>对称性：<span className="text-[var(--color-text)]">{symmetry}%</span></div>
        <div>上停：<span className="text-[var(--color-text)]">{threeStops.upper}%</span></div>
        <div>中停：<span className="text-[var(--color-text)]">{threeStops.middle}%</span></div>
        <div>下停：<span className="text-[var(--color-text)]">{threeStops.lower}%</span></div>
        <div>宽高比：<span className="text-[var(--color-text)]">{features.widthHeightRatio}</span></div>
      </div>
    </div>
  );
}

// ===== 主模块 =====
export default function FaceModule({
  aiConfig,
  setShowSettings,
  upsertHistory,
  activeHistoryId,
  setActiveHistoryId,
  pendingHistoryLoad,
  clearPendingHistoryLoad,
}) {
  // Input state
  const [userNote, setUserNote] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // ML state
  const [mlStatus, setMlStatus] = useState('');
  const [mlProcessing, setMlProcessing] = useState(false);
  const [extractedFeatures, setExtractedFeatures] = useState(null);

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
    if (pendingHistoryLoad && pendingHistoryLoad.module === 'face') {
      const item = pendingHistoryLoad;
      setChatMessages(item.chatMessages || []);
      if (item.input) {
        setUserNote(item.input.note || '');
      }
      if (item.result) {
        setExtractedFeatures(item.result);
      }
      setShowCamera(false);
      setError('');
      setStreamingText('');
      setFollowUpInput('');
      setMlProcessing(false);
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
    setExtractedFeatures(null);
    setChatMessages([]);
    setStreamingText('');
    setAiLoading(false);
    setFollowUpInput('');
    setError('');
    setShowCamera(false);
    setMlProcessing(false);
    setMlStatus('');
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Save to history
  const saveToHistory = useCallback((msgs, features) => {
    const id = activeHistoryId || `face-${Date.now()}`;
    const wuxing = WUXING_FACE_TYPES[features?.faceShape] || WUXING_FACE_TYPES.wood;
    upsertHistory(id, `面相分析 · ${wuxing.name}${userNote ? ' · ' + userNote.slice(0, 15) : ''}`, {
      module: 'face',
      input: { note: userNote },
      result: features,
    }, msgs);
    if (!activeHistoryId) setActiveHistoryId(id);
  }, [activeHistoryId, userNote, upsertHistory, setActiveHistoryId]);

  // Handle photo captured — run MediaPipe → extract features → send to LLM
  const handlePhotoCapture = useCallback(async (base64) => {
    setShowCamera(false);
    setError('');
    setMlProcessing(true);

    try {
      // 1. Create image element from base64
      setMlStatus('正在加载面部识别模型...');
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 2. Detect face landmarks
      setMlStatus('正在检测面部特征...');
      const landmarks = await detectFace(img);
      if (!landmarks) {
        setError('未检测到面部，请确保：正面朝向摄像头 · 光线充足 · 面部无遮挡');
        setMlProcessing(false);
        return;
      }

      // 3. Analyze features
      setMlStatus('正在分析面部比例...');
      const features = analyzeFaceFeatures(landmarks);
      setExtractedFeatures(features);
      setMlProcessing(false);

      // 4. Check API key
      if (!getActiveApiKey(aiConfig)) {
        setShowSettings(true);
        return;
      }

      // 5. Send text to LLM
      setAiLoading(true);
      setStreamingText('');

      const textMsg = buildFaceTextMessage(features, userNote);
      const displayMsg = { role: 'user', content: `[面相照片 · ${WUXING_FACE_TYPES[features.faceShape]?.name || '面型分析'}]${userNote ? '\n' + userNote : ''}` };
      setChatMessages([displayMsg]);

      const fullText = await aiInterpret(makeAiConfig(), FACE_SYSTEM_PROMPT, [textMsg], (text) => {
        setStreamingText(text);
      });
      const assistantMsg = { role: 'assistant', content: fullText };
      const finalMessages = [displayMsg, assistantMsg];
      setChatMessages(finalMessages);
      setStreamingText('');
      saveToHistory(finalMessages, features);
    } catch (e) {
      setError(`分析失败: ${e.message}`);
      console.error('Face analysis failed:', e);
      setMlProcessing(false);
    } finally {
      setAiLoading(false);
    }
  }, [aiConfig, userNote, makeAiConfig, saveToHistory, setShowSettings]);

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
      const fullText = await aiInterpret(makeAiConfig(), FACE_SYSTEM_PROMPT, updatedMessages, (text) => {
        setStreamingText(text);
      });
      const finalMessages = [...updatedMessages, { role: 'assistant', content: fullText }];
      setChatMessages(finalMessages);
      setStreamingText('');
      if (activeHistoryId) {
        saveToHistory(finalMessages, extractedFeatures);
      }
    } catch (e) {
      setError(`AI回答失败: ${e.message}`);
      console.error('Face follow-up failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, extractedFeatures, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const showInputPhase = !hasAIResponse && !aiLoading && !streamingText && !mlProcessing;

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="face"
        origin="面相学源于《麻衣神相》《柳庄相法》等经典，观察面部骨骼结构、五官比例来推断性格与运势。本模块使用浏览器端AI提取面部468个关键点，计算五行面型、三停比例、五官特征等结构化数据，再由AI进行面相解读。"
        strengths="五行面型分类 · 三停比例分析 · 五官逐一解读 · 面相十二宫 · 对称性评估"
      />

      {/* 输入阶段 */}
      {showInputPhase && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {/* 隐私提示 */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">🔒 隐私保护</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              您的照片仅在本地浏览器中处理，不会上传至任何服务器。仅提取的面部特征数据（文字）会发送给AI进行解读。
            </div>
          </div>

          {/* 拍摄指导 */}
          <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
            <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">📸 拍摄指导</div>
            <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
              正面朝向摄像头 · 光线充足均匀 · 面部无遮挡 · 表情自然放松
            </div>
          </div>

          {/* 已提取的特征摘要（重试时显示） */}
          {extractedFeatures && <FeatureSummary features={extractedFeatures} />}

          {/* 补充说明 */}
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">补充说明（可选）</label>
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="如：想了解事业方向、最近运势如何..."
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
                text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
            />
          </div>

          {/* 拍照 / 上传 */}
          {showCamera ? (
            <CameraCapture
              facingMode="user"
              onCapture={handlePhotoCapture}
              onCancel={() => setShowCamera(false)}
            />
          ) : (
            <button
              onClick={() => setShowCamera(true)}
              className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
            >
              拍照 / 上传面部照片
            </button>
          )}
        </section>
      )}

      {/* ML处理中 */}
      {mlProcessing && <MLProcessingStatus status={mlStatus} />}

      {/* AI分析中 (no streaming yet) */}
      {aiLoading && !streamingText && !hasAIResponse && !mlProcessing && (
        <MLProcessingStatus status="AI面相解读中..." />
      )}

      {/* AI对话 */}
      {(hasAIResponse || streamingText) && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">面相分析</h3>
            <button
              onClick={reset}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors font-body"
            >
              重新分析
            </button>
          </div>

          {/* 特征摘要 */}
          {extractedFeatures && <FeatureSummary features={extractedFeatures} />}

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

          {error && (
            <div className="mt-3 text-red-400 text-sm font-body">{error}</div>
          )}

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

      {/* Error outside chat */}
      {error && !hasAIResponse && !mlProcessing && (
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
