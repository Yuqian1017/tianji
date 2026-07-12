// Game module entry — save management + player mount (M1-4/M1-6).
import { useState, useEffect } from 'react';
import Player from './Player.jsx';
import { CHAPTERS, CHAPTER_1 } from './chapters/index.js';
import { loadSave, newSave, persistSave, clearSave } from './state.js';
import { PRELOAD_IMAGES } from './presentation.js';

export default function GameModule() {
  const [save, setSave] = useState(() => loadSave());
  const [playing, setPlaying] = useState(false);

  // Preload all scene art once so bg switches are instant (3MB PNGs are slow cold).
  useEffect(() => {
    for (const src of PRELOAD_IMAGES) { const img = new Image(); img.src = src; }
  }, []);

  const startNew = () => {
    const fresh = persistSave({ ...newSave(), currentChapter: CHAPTER_1.id, currentNodeId: CHAPTER_1.entryNode });
    setSave(fresh);
    setPlaying(true);
  };

  const continueSave = () => setPlaying(true);

  const startBonus = (chapterId) => {
    const ch = CHAPTERS[chapterId];
    if (!ch) { console.error(`[game] bonus chapter not registered: ${chapterId}`); return; }
    const next = persistSave({ ...save, currentChapter: chapterId, currentNodeId: ch.entryNode });
    setSave(next);
    setPlaying(true);
  };

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
    const activeChapter = CHAPTERS[save.currentChapter || 'ch1'] || CHAPTER_1;
    return <Player save={save} setSave={setSave} chapter={activeChapter} onExit={() => setPlaying(false)} />;
  }

  const bonusQiannang = CHAPTERS['qiannang'];
  const bonusUnlocked = bonusQiannang && save?.completedChapters?.includes('ch1') && (save?.favor ?? 0) >= 10;
  const bonusDone = save?.completedChapters?.includes('qiannang');

  const hasProgress = save?.currentNodeId;
  const finished = save?.completedChapters?.includes(CHAPTER_1.id);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      {/* title art backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center rounded-2xl opacity-90"
        style={{ backgroundImage: 'url(/assets/game/title-art.webp)' }}
      />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/45 via-transparent to-black/20" />
      <div className="relative max-w-md mx-auto text-center space-y-6 py-10">
      <div className="space-y-2">
        <div className="text-xs tracking-[0.5em] text-white/85 font-body drop-shadow">修仙 · 恋爱 · 学卦</div>
        <h2 className="text-4xl font-bold font-display text-white drop-shadow-lg">天机 · 第一章</h2>
        <div className="text-xl font-display text-amber-200 drop-shadow">《第一卦》</div>
        <p className="text-sm text-white/90 font-body leading-relaxed px-6 pt-2 drop-shadow">
          入太卜宗，遇引路人，摇你人生第一卦。<br />玩完这一章，你会真的用三枚硬币起一卦。
        </p>
      </div>

      <div className="space-y-3 px-8">
        {hasProgress && !finished && (
          <button onClick={continueSave} className="w-full py-3 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-900 font-medium font-body shadow-lg">
            继续修行（{save.settings.playerName || '无名'} · 灵力 {save.lingli}）
          </button>
        )}
        {finished && (
          <div className="text-sm text-amber-200 font-body drop-shadow">✦ 本章已通关 · 灵力 {save.lingli} · 好感 {save.favor}</div>
        )}
        {bonusUnlocked && (
          <button onClick={() => startBonus('qiannang')} className="w-full py-3 rounded-lg bg-rose-50/85 border border-rose-200 text-rose-800 font-medium font-body shadow-lg">
            {bonusDone ? '重温番外 ·《钱囊》' : '✧ 番外解锁 ·《钱囊》'}
          </button>
        )}
        <button onClick={startNew} className="w-full py-3 rounded-lg border border-white/60 text-white font-body hover:bg-white/10 transition-colors shadow-lg backdrop-blur-sm">
          {hasProgress ? '重新入门（新开档）' : '入山门'}
        </button>
        {hasProgress && (
          save?._confirmReset ? (
            <button onClick={doReset} className="w-full py-2 rounded-lg border border-red-300 bg-red-50/90 text-red-600 text-sm font-body">
              确认清除存档？此操作不可恢复——再点一次确认
            </button>
          ) : (
            <button onClick={resetConfirm} className="text-xs text-white/70 font-body hover:text-white drop-shadow">
              清除存档
            </button>
          )
        )}
      </div>
      </div>
    </div>
  );
}
