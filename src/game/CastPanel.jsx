// Cast interaction panel — the six-throw coin divination performance.
// Controlled component: Player owns activeCast state {thrown: number[], paused}.
// Coin-face convention (classics, KP-LY-002): value 3 = BACK(背), 2 = char face(字).
// 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)
import { renderTemplate } from './state.js';

const RESULT_INFO = {
  9: { name: '重', yao: '老阳', moving: true, yang: true, backs: 3 },
  8: { name: '拆', yao: '少阴', moving: false, yang: false, backs: 2 },
  7: { name: '单', yao: '少阳', moving: false, yang: true, backs: 1 },
  6: { name: '交', yao: '老阴', moving: true, yang: false, backs: 0 },
};

const YAO_LABELS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

function CoinRow({ total }) {
  const info = RESULT_INFO[total];
  // Render 3 coins: `backs` of them back-side, rest char-side.
  const faces = [...Array(3)].map((_, i) => i < info.backs);
  return (
    <div className="flex items-center justify-center gap-3">
      {faces.map((isBack, i) => (
        <div
          key={i}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
            isBack
              ? 'bg-[var(--color-surface-dim)] border-[var(--color-border)] text-[var(--color-text-dim)]'
              : 'bg-[var(--color-gold-bg-faint)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
          }`}
        >
          {isBack ? '背' : '字'}
        </div>
      ))}
    </div>
  );
}

function YaoLine({ total, highlight }) {
  const info = RESULT_INFO[total];
  return (
    <div className={`flex items-center gap-2 ${highlight ? 'animate-pulse' : ''}`}>
      <div className="flex-1 flex gap-1.5">
        {info.yang ? (
          <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-text)]'}`} />
        ) : (
          <>
            <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-text)]'}`} />
            <div className="w-4" />
            <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-text)]'}`} />
          </>
        )}
      </div>
      {info.moving && <span className="text-[var(--color-gold)] text-xs font-bold">{info.yang ? '○' : '×'}</span>}
    </div>
  );
}

/**
 * props:
 *  node       — castInteraction node
 *  settings   — save.settings (template rendering)
 *  thrown     — number[] totals so far (Player-owned)
 *  paused     — true while interleave chain is playing (throws disabled, panel compact)
 *  onThrow()  — Player performs next throw (fixed: node.throws[i]; random: engine)
 */
export default function CastPanel({ node, settings, thrown, paused, onThrow }) {
  const count = thrown.length;
  const done = count >= 6;
  const lastTotal = count > 0 ? thrown[count - 1] : null;
  const perThrow = node.perThrow || [];
  const lastLine = count > 0 ? perThrow[count - 1]?.speakerLine : null;

  return (
    <div className="border border-[var(--color-gold-border)] rounded-xl p-4 bg-[var(--color-surface)] space-y-4">
      <div className="text-center text-sm text-[var(--color-text-dim)] font-body">
        问卦：{renderTemplate(node.question, settings)}
      </div>

      {/* 卦纸: six lines bottom-up */}
      <div className="max-w-[200px] mx-auto flex flex-col-reverse gap-2">
        {thrown.map((total, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] w-7 text-[var(--color-text-dim)] font-body">{YAO_LABELS[i]}</span>
            <div className="flex-1"><YaoLine total={total} highlight={i === count - 1 && !done} /></div>
          </div>
        ))}
        {thrown.length === 0 && (
          <div className="text-center text-xs text-[var(--color-text-dim)] py-3 font-body">卦纸空白，待你第一掷</div>
        )}
      </div>

      {/* last throw result */}
      {lastTotal !== null && (
        <div className="space-y-2">
          <CoinRow total={lastTotal} />
          <div className="text-center text-sm font-body">
            <span className="font-bold">{RESULT_INFO[lastTotal].name}</span>
            <span className="text-[var(--color-text-dim)]"> · {RESULT_INFO[lastTotal].yao}</span>
            {RESULT_INFO[lastTotal].moving && <span className="text-[var(--color-gold)]"> · 动</span>}
          </div>
        </div>
      )}

      {/* speaker line for last throw */}
      {lastLine && !paused && (
        <div className="text-sm leading-relaxed font-body border-t border-[var(--color-border)] pt-3">
          <span className="text-[var(--color-gold)] font-medium">沈疏桐</span>：
          {renderTemplate(lastLine, settings)}
        </div>
      )}

      {/* action */}
      {!done && !paused && (
        <button
          onClick={onThrow}
          className="w-full py-2.5 rounded-lg bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] text-[var(--color-gold)] font-medium hover:opacity-80 transition-opacity font-body"
        >
          {count === 0 ? '合掌摇钱，掷第一次' : `第 ${count + 1} 掷（${YAO_LABELS[count]}）`}
        </button>
      )}
      {paused && !done && (
        <div className="text-center text-xs text-[var(--color-text-dim)] font-body">——摇卦暂歇，听{renderTemplate('{{senior}}', settings)}讲——</div>
      )}
    </div>
  );
}
