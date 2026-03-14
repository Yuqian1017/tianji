import { useState, useCallback } from 'react';
import { PALM_LINE_QUESTIONS } from '../modules/palm/data.js';

/**
 * 4-question palm line questionnaire.
 * Optionally pre-filled with AI Vision suggestions.
 */
export default function PalmLineQuestionnaire({ onComplete, onBack, aiSuggestions }) {
  const [answers, setAnswers] = useState(() => aiSuggestions?.answers || {});

  const handleSelect = useCallback((questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }, []);

  const allAnswered = PALM_LINE_QUESTIONS.every(q => answers[q.id]);

  const handleSubmit = useCallback(() => {
    if (allAnswered) {
      onComplete(answers);
    }
  }, [allAnswered, answers, onComplete]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-[var(--color-gold)] text-sm font-medium font-title mb-1">掌纹自述</div>
        <div className="text-[var(--color-text-dim)] text-xs font-body leading-relaxed">
          {aiSuggestions
            ? 'AI已初步识别掌纹特征（金色标记），请确认或修改后继续。'
            : 'AI已分析手部骨骼结构。掌纹（皮肤纹路）需要您自行观察选择，帮助AI更准确解读。'}
        </div>
      </div>

      {PALM_LINE_QUESTIONS.map((q, idx) => (
        <div key={q.id} className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
          <div className="text-xs text-[var(--color-text)] font-medium mb-2 font-body">
            <span className="text-[var(--color-gold)]">{idx + 1}.</span> {q.label}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map(opt => {
              const selected = answers[q.id] === opt;
              const isAiSuggested = aiSuggestions?.answers?.[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(q.id, opt)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors font-body relative ${
                    selected
                      ? 'bg-[var(--color-gold-bg)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                      : 'bg-[var(--color-bg-card)] border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {opt}
                  {isAiSuggested && !selected && (
                    <span className="ml-1 text-[10px] text-[var(--color-gold)] opacity-70">AI</span>
                  )}
                  {isAiSuggested && selected && (
                    <span className="ml-1 text-[10px] opacity-70">AI</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
            hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed btn-glow font-body"
        >
          {allAnswered
            ? (aiSuggestions ? '确认并开始AI解读' : '开始AI解读')
            : `请完成所有问题 (${Object.keys(answers).length}/${PALM_LINE_QUESTIONS.length})`}
        </button>
        <button
          onClick={onBack}
          className="px-4 text-[var(--color-text-dim)] border border-[var(--color-surface-border)] rounded-lg
            hover:text-[var(--color-text)] transition-colors font-body text-sm"
        >
          返回
        </button>
      </div>
    </div>
  );
}
