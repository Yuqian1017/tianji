// Chapter player — node-flow playback engine (M1-4).
// Contract with chapter data (see chapter1.js header):
//  - castInteraction: Player owns activeCast {thrown[], paused}. Fixed casts pause
//    at perThrow[i].interleaveNode (advance into the chain, panel stays compact);
//    a node with `resumeCast: true` hands control back for the remaining throws;
//    on 6th throw the player advances to the CURRENT node's next (resume node),
//    or cast.next when the cast ran uninterrupted (random natal cast).
//  - teachMoment: silent settlement + light toast card (隐形评估 — PRD §4).
//  - scoredChoice: applyScoredChoice handles rewards/demotion; branch prose lives
//    in the chapter data itself (B/C chains), Player only reports value changes.
import { useState, useCallback, useEffect, useRef } from 'react';
import { CHAPTER_1 } from './chapters/chapter1.js';
import CastPanel from './CastPanel.jsx';
import {
  persistSave, renderTemplate, pickVariant,
  applyTeachMoment, applyScoredChoice, applyFavor, applyChapterEnd,
  dynamicOptionText,
} from './state.js';
import { throwCoins, paipan } from '../modules/liuyao/engine.js';

const KP_SHORT = { 'KP-LY-001': '认卦', 'KP-LY-002': '摇卦', 'KP-LY-003': '动变' };

function Continue({ onClick, label = '继续 ▸' }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 w-full py-2 rounded-lg text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-gold-border)] transition-colors font-body"
    >
      {label}
    </button>
  );
}

function GenderButton({ value, set, current, label }) {
  return (
    <button
      onClick={() => set(value)}
      className={`px-4 py-2 rounded-lg border text-sm font-body ${current === value ? 'border-[var(--color-gold-border)] text-[var(--color-gold)] bg-[var(--color-gold-bg-faint)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)]'}`}
    >
      {label}
    </button>
  );
}

function Hud({ save }) {
  return (
    <div className="flex items-center justify-between text-xs font-body text-[var(--color-text-dim)] px-1">
      <div className="flex gap-3">
        <span>灵力 <b className="text-[var(--color-gold)]">{save.lingli}</b></span>
        <span>好感 <b className="text-[var(--color-text)]">{save.favor}</b></span>
      </div>
      <div className="flex gap-2">
        {CHAPTER_1.knowledgePoints.map((kp) => (
          <span key={kp} className={save.pendingReview.includes(kp) ? 'text-[var(--color-gold)]' : ''}>
            {KP_SHORT[kp]}·{save.mastery[kp] || '—'}{save.pendingReview.includes(kp) ? '⟳' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Player({ save, setSave, onExit }) {
  const nodes = CHAPTER_1.nodes;
  const node = nodes[save.currentNodeId];
  // transient (non-persisted) UI state
  const [pendingResponse, setPendingResponse] = useState(null); // choice response being shown
  const [toast, setToast] = useState(null);                     // teachMoment / reward toast
  const [activeCast, setActiveCast] = useState(null);           // {nodeId, thrown[], paused}

  const commit = useCallback((mutated, nextId) => {
    const next = persistSave({ ...mutated, currentNodeId: nextId });
    setSave(next);
    setPendingResponse(null);
  }, [setSave]);

  const advance = useCallback((nextId, mutator) => {
    const mutated = mutator ? mutator(save) : save;
    commit(mutated, nextId);
  }, [save, commit]);

  // ── cast orchestration ──────────────────────────────────────────
  const castNode = activeCast ? nodes[activeCast.nodeId] : null;

  const handleThrow = () => {
    const cNode = nodes[activeCast.nodeId];
    const i = activeCast.thrown.length;
    const total = cNode.mode === 'fixed' ? cNode.throws[i] : throwCoins().total;
    const thrown = [...activeCast.thrown, total];

    if (thrown.length === 6) {
      // complete: settle & advance
      let mutator;
      if (cNode.mode === 'random' && cNode.saveAs) {
        const now = new Date();
        const result = paipan(thrown, {
          year: now.getFullYear(), month: now.getMonth() + 1,
          day: now.getDate(), hour: now.getHours(), minute: now.getMinutes(),
        });
        mutator = (s) => ({
          ...s,
          natalHexagram: {
            throws: thrown,
            benGua: result.benGua?.name, bianGua: result.bianGua?.name || null,
            movingLines: result.movingLines, castAt: now.toISOString(),
          },
        });
      }
      // resume-node completion → advance current node's next; uninterrupted → cast.next
      const nextId = activeCast.paused === 'resumed' && node.next ? node.next : cNode.next;
      setActiveCast(null);
      advance(nextId, mutator);
      return;
    }

    const interleave = cNode.perThrow?.[i]?.interleaveNode;
    if (interleave) {
      setActiveCast({ ...activeCast, thrown, paused: true });
      advance(interleave);
    } else {
      setActiveCast({ ...activeCast, thrown });
    }
  };

  const resumeCast = () => {
    setActiveCast((c) => ({ ...c, paused: 'resumed' }));
  };

  // ── effects: cast bootstrap + teachMoment auto-settlement ────────
  const processedTm = useRef(new Set());
  useEffect(() => {
    if (node?.type === 'castInteraction' && (!activeCast || activeCast.nodeId !== save.currentNodeId)) {
      setActiveCast({ nodeId: save.currentNodeId, thrown: [], paused: false });
    }
    if (node?.type === 'teachMoment' && !processedTm.current.has(save.currentNodeId)) {
      processedTm.current.add(save.currentNodeId); // guard: StrictMode double-run / re-render
      const stageLabel = { demo: '见过', guided: '用过', independent: '掌握' }[node.stage] || node.stage;
      setToast({
        kind: 'teach',
        text: `📘 ${KP_SHORT[node.kpId] || node.kpId} · ${stageLabel}${node.lingli ? ` · 灵力 +${node.lingli}` : ''}`,
      });
      advance(node.next, (s) => applyTeachMoment(s, node));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save.currentNodeId, node?.type]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (!node) {
    // Fail loudly — a dangling pointer here means a data bug; never silently reset progress.
    console.error(`[game] node not found: ${save.currentNodeId}`);
    return (
      <div className="p-6 text-center space-y-3">
        <div className="text-sm text-[var(--color-text)]">存档指向了不存在的节点（{String(save.currentNodeId)}）。这是数据 bug，请回报。</div>
        <button onClick={onExit} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm">返回</button>
      </div>
    );
  }

  // ── render helpers ────────────────────────────────────────────────
  const T = (text) => renderTemplate(text, save.settings);
  const nodeText = () => T(pickVariant(node, save.settings));

  // ── per-type rendering ────────────────────────────────────────────
  let body = null;

  if (node.type === 'teachMoment') {
    body = null; // settled by effect; brief blank frame before advance
  } else if (node.type === 'settings') {
    body = <SettingsForm onSubmit={(settings) => advance(node.next, (s) => ({ ...s, settings }))} />;
  } else if (node.type === 'sceneHeader') {
    body = (
      <div className="text-center py-10 space-y-3 cursor-pointer" onClick={() => advance(node.next)}>
        <div className="text-xs tracking-[0.4em] text-[var(--color-text-dim)] font-body">第{['','一','二','三','四','五','六','七','八'][node.scene]}幕</div>
        <div className="text-2xl font-bold font-display text-[var(--color-text)]">{T(node.title)}</div>
        <div className="text-sm text-[var(--color-text-dim)] font-body">{node.time}</div>
        {node.ambience && <div className="text-xs text-[var(--color-text-dim)] font-body opacity-70">{T(node.ambience)}</div>}
        <div className="text-xs text-[var(--color-text-dim)] pt-4 animate-pulse">点击继续</div>
      </div>
    );
  } else if (node.type === 'narration' || node.type === 'dialogue') {
    const isResume = node.resumeCast === true;
    const clickable = node.next && !isResume;
    const favorMutator = node.effects?.favor ? (s) => applyFavor(s, node.effects.favor) : undefined;
    body = (
      <div className={clickable ? 'cursor-pointer' : ''} onClick={clickable ? () => advance(node.next, favorMutator) : undefined}>
        {node.aside && <div className="text-sm italic text-[var(--color-text-dim)] leading-relaxed mb-3 font-body">{T(node.aside)}</div>}
        {node.type === 'dialogue' ? (
          <div className="leading-loose font-body">
            <span className="text-[var(--color-gold)] font-medium">{T(node.speaker)}</span>
            <span className="text-[var(--color-text-dim)]">：「</span>
            <span className="text-[var(--color-text)]">{nodeText()}</span>
            <span className="text-[var(--color-text-dim)]">」</span>
          </div>
        ) : (
          <div className="leading-loose text-[var(--color-text)] font-body whitespace-pre-line">{nodeText()}</div>
        )}
        {isResume ? (
          <Continue onClick={resumeCast} label="——继续摇卦——" />
        ) : (
          <div className="text-right text-xs text-[var(--color-text-dim)] mt-3 opacity-50">▸</div>
        )}
      </div>
    );
  } else if (node.type === 'choice' || node.type === 'scoredChoice') {
    if (pendingResponse) {
      const { option } = pendingResponse;
      const resp = option.response;
      body = (
        <div>
          {resp?.aside && <div className="text-sm italic text-[var(--color-text-dim)] leading-relaxed mb-3 font-body">{T(resp.aside)}</div>}
          {resp && (
            <div className="leading-loose font-body">
              <span className="text-[var(--color-gold)] font-medium">{T(resp.speaker)}</span>
              <span className="text-[var(--color-text-dim)]">：「</span>
              <span className="text-[var(--color-text)]">{T(resp.text)}</span>
              <span className="text-[var(--color-text-dim)]">」</span>
            </div>
          )}
          <Continue onClick={() => {
            if (node.type === 'scoredChoice') {
              advance(option.next, (s) => applyScoredChoice(s, node, option));
            } else {
              advance(option.next, option.effects?.favor ? (s) => applyFavor(s, option.effects.favor) : undefined);
            }
          }} />
        </div>
      );
    } else {
      const pick = (option) => {
        // reward feedback toast for scored choices (values only; consequences live in branch prose)
        if (node.type === 'scoredChoice') {
          const r = node.rewards?.optimal;
          setToast(option.verdict === 'optimal'
            ? { kind: 'reward', text: `✦ 判断得当${r?.lingli ? ` · 灵力 +${r.lingli}` : ''}${r?.favor ? ` · 好感 +${r.favor}` : ''}` }
            : { kind: 'review', text: `⟳ ${(node.testsKp || []).map((k) => KP_SHORT[k] || k).join('/')} 标记待复习` });
        }
        if (option.response) {
          setPendingResponse({ option });
        } else if (node.type === 'scoredChoice') {
          advance(option.next, (s) => applyScoredChoice(s, node, option));
        } else {
          advance(option.next, option.effects?.favor ? (s) => applyFavor(s, option.effects.favor) : undefined);
        }
      };
      body = (
        <div className="space-y-3">
          {node.prompt && <div className="leading-loose text-[var(--color-text)] font-body whitespace-pre-line mb-2">{T(node.prompt)}</div>}
          {node.context && <div className="text-sm italic text-[var(--color-text-dim)] leading-relaxed font-body">{T(node.context)}</div>}
          {node.options.map((option, i) => (
            <button
              key={i}
              onClick={() => pick(option)}
              className="w-full text-left px-4 py-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold-border)] hover:bg-[var(--color-gold-bg-faint)] transition-colors text-sm leading-relaxed text-[var(--color-text)] font-body"
            >
              {option.dynamic ? (dynamicOptionText(option.key, save.natalHexagram) ?? T(option.text)) : T(option.text)}
            </button>
          ))}
        </div>
      );
    }
  } else if (node.type === 'castInteraction') {
    body = (
      <div className="text-center text-sm text-[var(--color-text-dim)] font-body py-2">
        {node.aside ? T(node.aside) : '——摇卦进行中，心思只在一件事上——'}
      </div>
    );
  } else if (node.type === 'chapterEnd') {
    body = (
      <div className="space-y-5 py-2">
        <div className="text-center text-xl font-display text-[var(--color-text)]">【第一章 · 终】</div>
        <div className="text-center text-sm text-[var(--color-gold)] font-body">章节通关 · 灵力 +{node.rewards?.lingli || 0}</div>
        {node.hooks?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-[var(--color-text-dim)] font-body">悬而未决：</div>
            {node.hooks.map((h, i) => (
              <div key={i} className="text-sm text-[var(--color-text)] font-body leading-relaxed">· {T(h)}</div>
            ))}
          </div>
        )}
        {node.nextChapterTeaser && (
          <div className="text-sm text-[var(--color-text-dim)] italic font-body leading-relaxed border-t border-[var(--color-border)] pt-3">
            {T(node.nextChapterTeaser)}
          </div>
        )}
        <SaveSummary save={save} />
        <Continue onClick={() => { advance(null, (s) => applyChapterEnd(s, node, CHAPTER_1.id)); onExit(); }} label="存档并返回" />
      </div>
    );
  } else {
    // Unknown node type — fail loudly (never render blank and continue silently).
    console.error(`[game] unknown node type "${node.type}" at ${save.currentNodeId}`);
    body = <div className="text-sm text-[var(--color-text-dim)]">未知节点类型：{node.type}（数据 bug，请回报）</div>;
  }

  // PLACEHOLDER-RENDER-2
  return (
    <div className="max-w-xl mx-auto space-y-4 pb-16">
      <Hud save={save} />
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] text-sm text-[var(--color-gold)] shadow-md font-body">
          {toast.text}
        </div>
      )}
      {/* cast panel persists (compact) while interleave chain plays */}
      {activeCast && castNode && (
        <CastPanel
          node={castNode}
          settings={save.settings}
          thrown={activeCast.thrown}
          paused={activeCast.paused === true}
          onThrow={handleThrow}
        />
      )}
      <div className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-surface)] min-h-[120px]">
        {body}
      </div>
      <button onClick={onExit} className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] font-body">← 存档并退出</button>
    </div>
  );
}

function SaveSummary({ save }) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 text-sm font-body">
      <div className="text-xs text-[var(--color-text-dim)]">本章结算</div>
      <div className="flex justify-between">
        <span>灵力 <b className="text-[var(--color-gold)]">{save.lingli}</b></span>
        <span>沈疏桐好感 <b>{save.favor}</b></span>
      </div>
      <div className="space-y-1">
        {CHAPTER_1.knowledgePoints.map((kp) => (
          <div key={kp} className="flex justify-between text-xs">
            <span className="text-[var(--color-text-dim)]">{KP_SHORT[kp]}（{kp}）</span>
            <span>
              {save.mastery[kp] || '未接触'}
              {save.pendingReview.includes(kp) && <span className="text-[var(--color-gold)]"> · 待复习</span>}
            </span>
          </div>
        ))}
      </div>
      {save.natalHexagram && (
        <div className="text-xs text-[var(--color-text-dim)] border-t border-[var(--color-border)] pt-2">
          本命卦：<b className="text-[var(--color-text)]">{save.natalHexagram.benGua}</b>
          {save.natalHexagram.bianGua && save.natalHexagram.movingLines?.length > 0 && (
            <span> 之 {save.natalHexagram.bianGua}</span>
          )}
          <span className="opacity-60">（未解，藏于怀中）</span>
        </div>
      )}
    </div>
  );
}

function SettingsForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [playerGender, setPlayerGender] = useState('female');
  const [seniorGender, setSeniorGender] = useState('female');
  return (
    <div className="space-y-5 py-2">
      <div className="text-center text-lg font-display text-[var(--color-text)]">入门造册</div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--color-text-dim)] font-body">道号（你的名字）</div>
        <input
          value={name} onChange={(e) => setName(e.target.value)} maxLength={12}
          placeholder="报上名来"
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-body outline-none focus:border-[var(--color-gold-border)]"
        />
      </div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--color-text-dim)] font-body">你的身份</div>
        <div className="flex gap-2">
          <GenderButton value="female" set={setPlayerGender} current={playerGender} label="女弟子" />
          <GenderButton value="male" set={setPlayerGender} current={playerGender} label="男弟子" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--color-text-dim)] font-body">引路人（内门弟子沈疏桐）</div>
        <div className="flex gap-2">
          <GenderButton value="female" set={setSeniorGender} current={seniorGender} label="师姐" />
          <GenderButton value="male" set={setSeniorGender} current={seniorGender} label="师兄" />
        </div>
      </div>
      <button
        disabled={!name.trim()}
        onClick={() => onSubmit({ playerName: name.trim(), playerGender, seniorGender })}
        className="w-full py-2.5 rounded-lg bg-[var(--color-gold-bg-faint)] border border-[var(--color-gold-border)] text-[var(--color-gold)] font-medium disabled:opacity-40 font-body"
      >
        入山门
      </button>
    </div>
  );
}
