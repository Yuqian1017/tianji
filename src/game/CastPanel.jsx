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
              ? 'bg-[var(--g-paper-soft)] border-[var(--g-gold-line-soft)] text-[var(--g-ink-dim)]'
              : 'bg-[var(--g-gold-wash)] border-[var(--g-gold-line)] text-[var(--g-gold-deep)]'
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
          <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--g-gold-deep)]' : 'bg-[var(--g-ink)]'}`} />
        ) : (
          <>
            <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--g-gold-deep)]' : 'bg-[var(--g-ink)]'}`} />
            <div className="w-4" />
            <div className={`h-2 flex-1 rounded-sm ${info.moving ? 'bg-[var(--g-gold-deep)]' : 'bg-[var(--g-ink)]'}`} />
          </>
        )}
      </div>
      {info.moving && <span className="text-[var(--g-gold-deep)] text-xs font-bold">{info.yang ? '○' : '×'}</span>}
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
    <div className="border border-[var(--g-gold-line)] rounded-xl p-4 bg-[var(--g-paper)] space-y-4">
      <div className="text-center text-sm text-[var(--g-ink-dim)] font-body">
        问卦：{renderTemplate(node.question, settings)}
      </div>

      {/* 卦纸: six lines bottom-up */}
      <div className="max-w-[200px] mx-auto flex flex-col-reverse gap-2">
        {thrown.map((total, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] w-7 text-[var(--g-ink-dim)] font-body">{YAO_LABELS[i]}</span>
            <div className="flex-1"><YaoLine total={total} highlight={i === count - 1 && !done} /></div>
          </div>
        ))}
        {thrown.length === 0 && (
          <div className="text-center text-xs text-[var(--g-ink-dim)] py-3 font-body">卦纸空白，待你第一掷</div>
        )}
      </div>

      {/* last throw result */}
      {lastTotal !== null && (
        <div className="space-y-2">
          <CoinRow total={lastTotal} />
          <div className="text-center text-sm font-body">
            <span className="font-bold">{RESULT_INFO[lastTotal].name}</span>
            <span className="text-[var(--g-ink-dim)]"> · {RESULT_INFO[lastTotal].yao}</span>
            {RESULT_INFO[lastTotal].moving && <span className="text-[var(--g-gold-deep)]"> · 动</span>}
          </div>
        </div>
      )}

      {/* speaker line for last throw (per-throw speaker override — ch2 self-reported casts; default 沈疏桐 for ch1 compat) */}
      {lastLine && !paused && (
        <div className="text-sm leading-relaxed font-body border-t border-[var(--g-gold-line-soft)] pt-3">
          <span className="text-[var(--g-gold-deep)] font-medium">{renderTemplate(perThrow[count - 1]?.speaker || '沈疏桐', settings)}</span>：
          {renderTemplate(lastLine, settings)}
        </div>
      )}

      {/* action */}
      {!done && !paused && (
        <button
          onClick={onThrow}
          className="w-full py-2.5 rounded-lg bg-[var(--g-gold-wash)] border border-[var(--g-gold-line)] text-[var(--g-gold-deep)] font-medium hover:opacity-80 transition-opacity font-body"
        >
          {count === 0 ? '合掌摇钱，掷第一次' : `第 ${count + 1} 掷（${YAO_LABELS[count]}）`}
        </button>
      )}
      {paused && !done && (
        <div className="text-center text-xs text-[var(--g-ink-dim)] font-body">——摇卦暂歇，听{renderTemplate('{{senior}}', settings)}讲——</div>
      )}
    </div>
  );
}

/**
 * DressingBoard — 装卦盘 (chapter-2 M2 extension per handoff note: CastPanel 扩展，逐爻显示纳甲/世应标记).
 * Pure display driven by Player.activeDressing (set by dressingUpdate nodes carrying FULL cumulative state —
 * idempotent by design: no reducer, refresh recovers at the next update node).
 * board: { throws:number[6], revealed:[{pos:1-6, branch, wuxing}], marks:{world,response}|null }
 */
export function DressingBoard({ board }) {
  if (!board?.throws) return null;
  const revealed = board.revealed || [];
  const byPos = {};
  for (const r of revealed) byPos[r.pos] = r;
  const marks = board.marks || null;
  return (
    <div className="border border-[var(--g-gold-line)]/70 rounded-xl px-4 py-3 bg-[var(--g-paper)]/95 shadow-lg">
      <div className="text-center text-[10px] tracking-[0.4em] text-[var(--g-ink-dim)] font-body mb-2">装 卦</div>
      <div className="max-w-[250px] mx-auto flex flex-col-reverse gap-1.5">
        {board.throws.map((total, i) => {
          const pos = i + 1;
          const r = byPos[pos];
          const mark = marks?.world === pos ? '世' : marks?.response === pos ? '应' : '';
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] w-7 text-[var(--g-ink-dim)] font-body">{YAO_LABELS[i]}</span>
              <div className="flex-1"><YaoLine total={total} /></div>
              <span className={`text-xs text-right font-body ${board.revealed?.some((x) => x.bian) ? 'w-40' : board.revealed?.some((x) => x.wangshuai) ? 'w-32' : board.revealed?.some((x) => x.liuqin) ? 'w-24' : 'w-11'}`}>
                {r ? (
                  <b className="text-[var(--g-gold-deep)]">
                    {r.branch}<span className="opacity-70 font-normal">{r.wuxing}</span>
                    {r.liuqin && <span className="text-[var(--g-seal)] font-medium">·{r.liuqin}</span>}
                    {r.wangshuai && <span className="text-[var(--g-gold-deep)] font-medium">·{r.wangshuai}</span>}
                    {r.bian && <span className="text-[var(--g-seal)] font-medium"> →{r.bian}</span>}
                  </b>
                ) : (
                  <span className="opacity-25">·</span>
                )}
              </span>
              <span className="text-[10px] w-4 font-body font-bold text-[var(--g-gold-deep)]">{mark}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
