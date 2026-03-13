import { useState, useEffect, useCallback, useRef } from 'react';
import { DIAGNOSIS_TYPES, getDiagnosisType } from './data.js';
import { buildVisionMessage, buildFollowUpMessage } from './engine.js';
import { aiInterpret } from '../../lib/ai.js';
import { getActiveApiKey } from '../../lib/aiProviders.js';
import { WANGZHEN_SYSTEM_PROMPT } from './prompt.js';
import ModuleIntro from '../../components/ModuleIntro.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';

// ===== 分析动画 =====
function AnalyzingAnimation() {
  return (
    <div className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-8">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-taiji-spin" style={{ transformOrigin: 'center' }}>☯</div>
        <div className="text-[var(--color-gold-muted)] text-sm animate-pulse font-body">望诊分析中...</div>
      </div>
    </div>
  );
}

// ===== 诊断类型选择器 =====
function DiagnosisTypePicker({ selected, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DIAGNOSIS_TYPES.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`p-3 rounded-xl border text-center transition-all font-body ${
            selected === t.id
              ? 'border-[var(--color-gold)] bg-[var(--color-gold-bg)] text-[var(--color-gold)]'
              : 'border-[var(--color-surface-border)] bg-[var(--color-surface-dim)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-muted)]'
          }`}
        >
          <div className="text-2xl mb-1">{t.icon}</div>
          <div className="text-sm font-medium">{t.name}</div>
        </button>
      ))}
    </div>
  );
}

// ===== 拍摄指导 =====
function CaptureGuidance({ typeId }) {
  const type = getDiagnosisType(typeId);
  return (
    <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
      <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">拍摄指导</div>
      <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">{type.guidance}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {type.dimensions.map(d => (
          <span key={d.name} className="text-xs bg-[var(--color-surface-subtle)] text-[var(--color-text-dim)] px-2 py-0.5 rounded-full font-body">
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===== 主模块 =====
export default function WangzhenModule({
  aiConfig,
  setShowSettings,
  upsertHistory,
  activeHistoryId,
  setActiveHistoryId,
  pendingHistoryLoad,
  clearPendingHistoryLoad,
}) {
  // Input state
  const [diagnosisType, setDiagnosisType] = useState('tongue');
  const [userNote, setUserNote] = useState('');
  const [capturedImage, setCapturedImage] = useState(null); // base64
  const [showCamera, setShowCamera] = useState(false);

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
    if (pendingHistoryLoad && pendingHistoryLoad.module === 'wangzhen') {
      const item = pendingHistoryLoad;
      setChatMessages(item.chatMessages || []);
      if (item.input) {
        setDiagnosisType(item.input.type || 'tongue');
        setUserNote(item.input.note || '');
      }
      setCapturedImage(null); // don't restore image (too large)
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
    setCapturedImage(null);
    setChatMessages([]);
    setStreamingText('');
    setAiLoading(false);
    setFollowUpInput('');
    setError('');
    setShowCamera(false);
    setActiveHistoryId(null);
  }, [setActiveHistoryId]);

  // Save to history
  const saveToHistory = useCallback((msgs) => {
    const id = activeHistoryId || `wangzhen-${Date.now()}`;
    const typeName = getDiagnosisType(diagnosisType).name;
    upsertHistory(id, `${typeName}${userNote ? ' · ' + userNote.slice(0, 20) : ''}`, {
      module: 'wangzhen',
      input: { type: diagnosisType, note: userNote },
    }, msgs);
    if (!activeHistoryId) setActiveHistoryId(id);
  }, [activeHistoryId, diagnosisType, userNote, upsertHistory, setActiveHistoryId]);

  // Handle photo captured — immediately send to AI
  const handlePhotoCapture = useCallback(async (base64) => {
    setCapturedImage(base64);
    setShowCamera(false);

    if (!getActiveApiKey(aiConfig)) {
      setShowSettings(true);
      return;
    }

    setAiLoading(true);
    setStreamingText('');
    setError('');

    const visionMsg = buildVisionMessage(base64, diagnosisType, userNote);
    const messages = [visionMsg];
    // For display, show a simplified version (no base64 in chat)
    const displayMsg = { role: 'user', content: `[${getDiagnosisType(diagnosisType).name}照片]${userNote ? '\n' + userNote : ''}` };
    setChatMessages([displayMsg]);

    try {
      const fullText = await aiInterpret(makeAiConfig(), WANGZHEN_SYSTEM_PROMPT, messages, (text) => {
        setStreamingText(text);
      });
      const assistantMsg = { role: 'assistant', content: fullText };
      const finalMessages = [displayMsg, assistantMsg];
      setChatMessages(finalMessages);
      setStreamingText('');
      saveToHistory(finalMessages);
    } catch (e) {
      setError(`AI分析失败: ${e.message}`);
      console.error('望诊 AI analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [aiConfig, diagnosisType, userNote, makeAiConfig, saveToHistory, setShowSettings]);

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
      const fullText = await aiInterpret(makeAiConfig(), WANGZHEN_SYSTEM_PROMPT, updatedMessages, (text) => {
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
      console.error('望诊 follow-up failed:', e);
    } finally {
      setAiLoading(false);
    }
  }, [followUpInput, aiLoading, aiConfig, chatMessages, activeHistoryId, makeAiConfig, saveToHistory, setShowSettings]);

  const handleFollowUpKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  }, [askFollowUp]);

  const hasAIResponse = chatMessages.some(m => m.role === 'assistant');
  const showInputPhase = !hasAIResponse && !aiLoading && !streamingText;

  return (
    <div className="space-y-6">
      <ModuleIntro
        moduleId="wangzhen"
        origin="望诊为中医四诊（望闻问切）之首，《黄帝内经》云:「望而知之谓之神」。通过观察舌象、面色、手掌等外在表现推断内在脏腑气血状态。"
        strengths="舌象分析（舌质/舌苔/润燥） · 面色五脏对应 · 手掌体质判断 · AI辅助望诊分析"
      />

      {/* 输入阶段 */}
      {showInputPhase && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5 space-y-4">
          {/* 诊断类型选择 */}
          <div>
            <label className="block text-[var(--color-gold)] text-sm font-medium mb-3 font-title">选择诊断类型</label>
            <DiagnosisTypePicker selected={diagnosisType} onChange={setDiagnosisType} />
          </div>

          {/* 拍摄指导 */}
          <CaptureGuidance typeId={diagnosisType} />

          {/* 症状描述 (optional) */}
          <div>
            <label className="block text-[var(--color-text-dim)] text-xs mb-1 font-body">症状描述（可选）</label>
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="如：最近容易疲倦、胃口不好、睡眠差..."
              className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-surface-border)] rounded-lg px-3 py-2.5
                text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] input-focus-ring transition-colors font-body text-sm"
            />
          </div>

          {/* 拍照 / 上传 */}
          {showCamera ? (
            <CameraCapture
              onCapture={handlePhotoCapture}
              onCancel={() => setShowCamera(false)}
            />
          ) : capturedImage ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-[var(--color-gold-border)]">
                <img
                  src={`data:image/jpeg;base64,${capturedImage}`}
                  alt="预览"
                  className="w-full rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePhotoCapture(capturedImage)}
                  className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                    hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
                >
                  开始分析
                </button>
                <button
                  onClick={() => { setCapturedImage(null); setShowCamera(true); }}
                  className="px-4 text-[var(--color-text-dim)] border border-[var(--color-surface-border)] rounded-lg
                    hover:text-[var(--color-text)] transition-colors font-body text-sm"
                >
                  重拍
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                  hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
              >
                拍照 / 上传照片
              </button>
            </div>
          )}
        </section>
      )}

      {/* 分析中动画 */}
      {aiLoading && !streamingText && !hasAIResponse && (
        <AnalyzingAnimation />
      )}

      {/* AI对话 */}
      {(hasAIResponse || streamingText) && (
        <section className="bg-[var(--color-bg-card)] card-blur border border-[var(--color-gold-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--color-gold)] text-sm font-medium font-title">望诊分析</h3>
            <button
              onClick={reset}
              className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors font-body"
            >
              重新诊断
            </button>
          </div>

          <div className="space-y-4">
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

            {/* Streaming text */}
            {streamingText && (
              <div className="text-[var(--color-text)] text-sm leading-relaxed font-body whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-[var(--color-gold)] ml-0.5 animate-pulse" />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 text-red-400 text-sm font-body">{error}</div>
          )}

          {/* Follow-up input */}
          {hasAIResponse && !aiLoading && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={e => setFollowUpInput(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                placeholder="追问具体调养方法..."
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

          {/* Loading indicator for follow-up */}
          {aiLoading && streamingText === '' && hasAIResponse && (
            <div className="mt-3 text-[var(--color-gold-muted)] text-sm animate-pulse font-body">思考中...</div>
          )}
        </section>
      )}
    </div>
  );
}
