// Game module entry — save management + player mount (M1-4/M1-6).
import { useState } from 'react';
import Player from './Player.jsx';
import { CHAPTER_1 } from './chapters/chapter1.js';
import { loadSave, newSave, persistSave, clearSave } from './state.js';

export default function GameModule() {
  const [save, setSave] = useState(() => loadSave());
  const [playing, setPlaying] = useState(false);

  const startNew = () => {
    const fresh = persistSave({ ...newSave(), currentNodeId: CHAPTER_1.entryNode });
    setSave(fresh);
    setPlaying(true);
  };

  const continueSave = () => setPlaying(true);

  const resetConfirm = () => {
    // in-app modal discipline: no window.confirm — lightweight two-step button
    setSave((s) => ({ ...s, _confirmReset: !s._confirmReset }));
  };

  const doReset = () => {
    clearSave();
    setSave(null);
    setPlaying(false);
  };

  if (playing && save?.currentNodeId) {
    return <Player save={save} setSave={setSave} onExit={() => setPlaying(false)} />;
  }

  const hasProgress = save?.currentNodeId;
  const finished = save?.completedChapters?.includes(CHAPTER_1.id);

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-10">
      <div className="space-y-2">
        <div className="text-xs tracking-[0.5em] text-[var(--color-text-dim)] font-body">修仙 · 恋爱 · 学卦</div>
        <h2 className="text-3xl font-bold font-display text-[var(--color-text)]">天机 · 第一章</h2>
        <div className="text-lg font-display text-[var(--color-gold)]">《第一卦》</div>
        <p className="text-sm text-[var(--color-text-dim)] font-body leading-relaxed px-6 pt-2">
          入太卜宗，遇引路人，摇你人生第一卦。<br />玩完这一章，你会真的用三枚硬币起一卦。
        </p>
      </div>

      <div className="space-y-3 px-8">
        {hasProgress && !finished && (
          <button onClick={continueSave} className="w-full py-3 rounded-lg bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] text-[var(--color-gold)] font-medium font-body">
            继续修行（{save.settings.playerName || '无名'} · 灵力 {save.lingli}）
          </button>
        )}
        {finished && (
          <div className="text-sm text-[var(--color-gold)] font-body">✦ 本章已通关 · 灵力 {save.lingli} · 好感 {save.favor}</div>
        )}
        <button onClick={startNew} className="w-full py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-body hover:border-[var(--color-gold-border)] transition-colors">
          {hasProgress ? '重新入门（新开档）' : '入山门'}
        </button>
        {hasProgress && (
          save?._confirmReset ? (
            <button onClick={doReset} className="w-full py-2 rounded-lg border border-red-400 text-red-500 text-sm font-body">
              确认清除存档？此操作不可恢复——再点一次确认
            </button>
          ) : (
            <button onClick={resetConfirm} className="text-xs text-[var(--color-text-dim)] font-body hover:text-[var(--color-text)]">
              清除存档
            </button>
          )
        )}
      </div>
    </div>
  );
}
