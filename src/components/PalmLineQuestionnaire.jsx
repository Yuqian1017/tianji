import { useState } from 'react';
import { PALM_LINE_QUESTIONS } from '../modules/palm/data.js';

/**
 * 4-question palm line questionnaire.
 * MediaPipe can detect hand skeleton but not fine skin lines,
 * so we ask the user to self-report their palm lines.
 */
export default function PalmLineQuestionnaire({ onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const allAnswered = PALM_LINE_QUESTIONS.every(q => answers[q.id]);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-surface-dim)] rounded-lg p-3 border border-[var(--color-surface-border)]">
        <div className="text-xs text-[var(--color-gold)] font-medium mb-1 font-body">👋 掌纹自测</div>
        <div className="text-xs text-[var(--color-text-dim)] font-body leading-relaxed">
          摄像头无法准确识别掌纹细节，请观察自己的手掌，回答以下问题。不确定的可选"看不清"。
        </div>
      </div>

      {PALM_LINE_QUESTIONS.map((q) => (
        <div key={q.id} className="space-y-2">
          <div className="text-sm text-[var(--color-text)] font-body font-medium">{q.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(q.id, opt)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-body
                  ${answers[q.id] === opt
                    ? 'bg-[var(--color-gold-bg)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                    : 'bg-[var(--color-surface-dim)] border-[var(--color-surface-border)] text-[var(--color-text-dim)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-text)]'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 text-sm text-[var(--color-text-dim)] py-2.5 rounded-lg border border-[var(--color-surface-border)]
            hover:text-[var(--color-text)] hover:border-[var(--color-gold-border)] transition-colors font-body"
        >
          返回
        </button>
        <button
          onClick={() => onSubmit(answers)}
          disabled={!allAnswered}
          className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-2.5 rounded-lg
            hover:bg-[var(--color-gold-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed btn-glow font-body text-sm"
        >
          {allAnswered ? '开始分析' : `还需回答 ${PALM_LINE_QUESTIONS.length - Object.keys(answers).length} 题`}
        </button>
      </div>
    </div>
  );
}
