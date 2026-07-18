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
import { CHAPTER_1 } from './chapters/index.js';
import CastPanel, { DressingBoard } from './CastPanel.jsx';
import {
  persistSave, renderTemplate, pickVariant,
  applyTeachMoment, applyScoredChoice, applyFavor, applyChapterEnd,
  dynamicOptionText, natalPalaceText, natalDressingBoard,
} from './state.js';
import { throwCoins, paipan } from '../modules/liuyao/engine.js';
import { BG_SWITCH, BGM_SWITCH, PORTRAITS, NPC_PORTRAITS, portraitVisible, fallbackForNode } from './presentation.js';
import './game-ui.css';

const KP_SHORT = {
  'KP-LY-001': '认卦', 'KP-LY-002': '摇卦', 'KP-LY-003': '动变',
  'KP-LY-004': '八宫', 'KP-LY-005': '纳甲', 'KP-LY-006': '世应',
};

function Continue({ onClick, label = '继续 ▸' }) {
  return (
    <button
      onClick={onClick}
      className="g-quiet-btn mt-4 w-full py-2 rounded-lg text-sm font-body"
    >
      {label}
    </button>
  );
}

function GenderButton({ value, set, current, label }) {
  return (
    <button
      onClick={() => set(value)}
      className={`px-4 py-2 rounded-lg border text-sm font-body ${current === value ? 'border-[var(--g-gold-line)] text-[var(--g-gold-deep)] bg-[var(--g-gold-wash)]' : 'border-[var(--g-gold-line-soft)] text-[var(--g-ink-dim)]'}`}
    >
      {label}
    </button>
  );
}

function Hud({ save, chapter }) {
  return (
    <div className="flex items-center justify-between text-xs font-body px-1 text-[var(--g-hud-text-dim)]">
      <div className="g-hud flex gap-3 rounded-full px-3 py-1">
        <span>灵力 <b className="text-amber-300">{save.lingli}</b></span>
        <span>好感 <b className="text-[var(--g-hud-text)]">{save.favor}</b></span>
      </div>
      <div className="g-hud flex gap-2 rounded-full px-3 py-1">
        {(chapter.knowledgePoints || []).map((kp) => (
          <span key={kp} className={save.pendingReview.includes(kp) ? 'text-amber-300' : ''}>
            {KP_SHORT[kp]}·{save.mastery[kp] || '—'}{save.pendingReview.includes(kp) ? '⟳' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Player({ save, setSave, onExit, chapter = CHAPTER_1 }) {
  const nodes = chapter.nodes;
  const node = nodes[save.currentNodeId];
  // transient (non-persisted) UI state
  const [pendingResponse, setPendingResponse] = useState(null); // choice response being shown
  const [toast, setToast] = useState(null);                     // teachMoment / reward toast
  const [activeCast, setActiveCast] = useState(null);           // {nodeId, thrown[], paused}
  const [activeDressing, setActiveDressing] = useState(null);   // 装卦盘 board (ch2) — set by dressingUpdate nodes; ephemeral, rebuilt at next update on refresh
  const [npcOnStage, setNpcOnStage] = useState(null);           // NPC portrait stage (left side): set when a portrait-bearing NPC speaks, cleared per scene
  const [bg, setBg] = useState(() => fallbackForNode(save.currentNodeId).bg); // resume-safe
  const bgmRef = useRef(null);                                  // HTMLAudio, lazy

  // presentation switches: bg + bgm keyed by node id (resume falls back per scene)
  const sceneRef = useRef(null);
  useEffect(() => {
    const id = save.currentNodeId;
    const scene = /^(?:ch\d+|qn)-s(\d)/.exec(id || '')?.[1] || null;
    // NPC stage: scene boundary clears; a portrait-bearing NPC entering dialogue takes the left slot
    const n = nodes[id];
    if (n?.type === 'sceneHeader') setNpcOnStage(null);
    else if (n?.type === 'dialogue' && NPC_PORTRAITS[n.speaker]) setNpcOnStage(n.speaker);
    if (BG_SWITCH[id]) {
      setBg(BG_SWITCH[id]);
    } else if (scene !== null && scene !== sceneRef.current) {
      // exact-node switch missed (fast advance / resume) → scene-level fallback
      setBg(fallbackForNode(id).bg);
    }
    sceneRef.current = scene;
    const bgmSrc = BGM_SWITCH[id];
    if (bgmSrc !== undefined) {
      if (!bgmRef.current) { bgmRef.current = new Audio(); bgmRef.current.loop = true; bgmRef.current.volume = 0.35; }
      const audio = bgmRef.current;
      if (bgmSrc === null) { audio.pause(); }
      else if (!audio.src.endsWith(bgmSrc)) {
        audio.src = bgmSrc;
        audio.play().catch((e) => console.warn('[game] bgm autoplay blocked or missing:', e.message));
      }
    } else if (!bgmRef.current) {
      // resume mid-scene: start fallback bgm lazily
      const fb = fallbackForNode(id).bgm;
      if (fb) {
        bgmRef.current = new Audio(fb); bgmRef.current.loop = true; bgmRef.current.volume = 0.35;
        bgmRef.current.play().catch((e) => console.warn('[game] bgm autoplay blocked or missing:', e.message));
      }
    }
  }, [save.currentNodeId, nodes]);

  // stop bgm on unmount (exit to title)
  useEffect(() => () => { bgmRef.current?.pause(); }, []);

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
    if (node?.type === 'dressingUpdate') {
      // 装卦盘 state event — board carries FULL cumulative state (idempotent), so no
      // processed-guard needed: StrictMode double-run re-commits the same next id harmlessly.
      setActiveDressing(node.dynamicNatalBoard
        ? natalDressingBoard(save.natalHexagram, node.dynamicNatalBoard)
        : (node.board || null));
      advance(node.next);
    }
    if (node?.type === 'favorBranch') {
      // silent route by favor threshold (ch3 章末称谓分支). Pure routing, idempotent.
      // Fail loudly on malformed data rather than guessing a default path.
      if (!node.pass || !node.fail) {
        console.error(`[game] favorBranch missing pass/fail at ${save.currentNodeId}`);
      } else {
        advance(save.favor >= (node.threshold ?? 25) ? node.pass : node.fail);
      }
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
        <div className="text-sm text-[var(--g-ink)]">存档指向了不存在的节点（{String(save.currentNodeId)}）。这是数据 bug，请回报。</div>
        <button onClick={onExit} className="px-4 py-2 rounded-lg border border-[var(--g-gold-line-soft)] text-sm">返回</button>
      </div>
    );
  }

  // ── render helpers ────────────────────────────────────────────────
  const T = (text) => renderTemplate(text, save.settings);
  const nodeText = () => {
    let t = pickVariant(node, save.settings);
    // ch2 6.4: narration nodes flagged dynamicNatal carry a 〔…〕 placeholder replaced
    // with the player's actual natal palace lookup (literal text is the loud fallback).
    if (node.dynamicNatal && typeof t === 'string') {
      const natal = natalPalaceText(save.natalHexagram);
      if (natal) t = t.replace(/〔[^〕]*〕/, `「${natal}」`);
    }
    return T(t);
  };

  // ── per-type rendering ────────────────────────────────────────────
  let body = null;

  if (node.type === 'teachMoment' || node.type === 'dressingUpdate' || node.type === 'favorBranch') {
    body = null; // settled by effect; brief blank frame before advance
  } else if (node.type === 'settings') {
    body = <SettingsForm onSubmit={(settings) => advance(node.next, (s) => ({ ...s, settings }))} />;
  } else if (node.type === 'sceneHeader') {
    body = (
      <div className="text-center py-10 space-y-3 cursor-pointer" onClick={() => advance(node.next)}>
        <div className="text-xs tracking-[0.4em] text-[var(--g-ink-dim)] font-body">第{['','一','二','三','四','五','六','七','八'][node.scene]}幕</div>
        <div className="text-2xl font-bold font-display text-[var(--g-ink)]">{T(node.title)}</div>
        <div className="text-sm text-[var(--g-ink-dim)] font-body">{node.time}</div>
        {node.ambience && <div className="text-xs text-[var(--g-ink-dim)] font-body opacity-70">{T(node.ambience)}</div>}
        <div className="text-xs text-[var(--g-ink-dim)] pt-4 animate-pulse">点击继续</div>
      </div>
    );
  } else if (node.type === 'narration' || node.type === 'dialogue') {
    const isResume = node.resumeCast === true;
    const clickable = node.next && !isResume;
    const favorMutator = node.effects?.favor ? (s) => applyFavor(s, node.effects.favor) : undefined;
    body = (
      <div className={clickable ? 'cursor-pointer' : ''} onClick={clickable ? () => advance(node.next, favorMutator) : undefined}>
        {node.aside && <div className="text-[13.5px] italic text-[var(--g-ink-dim)] leading-relaxed mb-2 font-body">{T(node.aside)}</div>}
        {node.type === 'dialogue' ? (
          <div className="leading-[1.95] text-[17px] font-body text-[var(--g-ink)]">「{nodeText()}」</div>
        ) : (
          <div className="leading-[1.95] text-[16.5px] text-[var(--g-ink)] font-body whitespace-pre-line">{nodeText()}</div>
        )}
        {isResume ? (
          activeCast?.paused === true ? (
            <Continue onClick={resumeCast} label="——继续摇卦——" />
          ) : (
            <div className="mt-3 text-center text-xs text-[var(--g-ink-dim)] font-body">（摇卦进行中——掷上方铜钱）</div>
          )
        ) : (
          <div className="text-right text-xs text-[var(--g-ink-dim)] mt-2 opacity-50 animate-pulse">▸</div>
        )}
      </div>
    );
  } else if (node.type === 'choice' || node.type === 'scoredChoice') {
    if (pendingResponse) {
      const { option } = pendingResponse;
      let resp = option.response;
      // ch2 6.4 籍贯查询: substitute the 〔按玩家实际本命卦生成…〕 placeholder with the
      // player's actual natal palace/position (fails loudly to the literal placeholder text).
      if (resp && option.dynamicNatal) {
        const t = natalPalaceText(save.natalHexagram);
        if (t) {
          const sub = (s) => (typeof s === 'string' ? s.replace(/〔[^〕]*〕/, `「${t}」`) : s);
          resp = { ...resp, text: sub(resp.text), aside: sub(resp.aside) };
        }
      }
      body = (
        <div>
          {resp?.aside && <div className="text-sm italic text-[var(--g-ink-dim)] leading-relaxed mb-3 font-body">{T(resp.aside)}</div>}
          {resp && (resp.speaker ? (
            <div className="leading-[1.95] text-[16px] font-body">
              <span className="text-[var(--g-gold-deep)] font-medium">{T(resp.speaker)}</span>
              <span className="text-[var(--g-ink-dim)]">：「</span>
              <span className="text-[var(--g-ink)]">{T(resp.text)}</span>
              <span className="text-[var(--g-ink-dim)]">」</span>
            </div>
          ) : (
            // speaker-less response = pure narration beat (e.g. ch2 act-3 silent option)
            <div className="leading-[1.95] text-[16px] text-[var(--g-ink)] font-body whitespace-pre-line">{T(resp.text)}</div>
          ))}
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
          {node.prompt && <div className="leading-loose text-[var(--g-ink)] font-body whitespace-pre-line mb-2">{T(node.prompt)}</div>}
          {node.context && <div className="text-sm italic text-[var(--g-ink-dim)] leading-relaxed font-body">{T(node.context)}</div>}
          {node.options.map((option, i) => (
            <button
              key={i}
              onClick={() => pick(option)}
              className="g-option w-full text-left px-4 py-3 rounded-lg text-[15px] leading-relaxed font-body"
            >
              {option.dynamic ? (dynamicOptionText(option.key, save.natalHexagram) ?? T(option.text)) : T(option.text)}
            </button>
          ))}
        </div>
      );
    }
  } else if (node.type === 'castInteraction') {
    body = (
      <div className="text-center text-sm text-[var(--g-ink-dim)] font-body py-2">
        {node.aside ? T(node.aside) : '——摇卦进行中，心思只在一件事上——'}
      </div>
    );
  } else if (node.type === 'chapterEnd') {
    body = (
      <div className="space-y-5 py-2">
        <div className="text-center text-xl font-display text-[var(--g-ink)]">{node.title || '【第一章 · 终】'}</div>
        <div className="text-center text-sm text-[var(--g-gold-deep)] font-body">章节通关 · 灵力 +{node.rewards?.lingli || 0}</div>
        {node.hooks?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-[var(--g-ink-dim)] font-body">悬而未决：</div>
            {node.hooks.map((h, i) => (
              <div key={i} className="text-sm text-[var(--g-ink)] font-body leading-relaxed">· {T(h)}</div>
            ))}
          </div>
        )}
        {node.nextChapterTeaser && (
          <div className="text-sm text-[var(--g-ink-dim)] italic font-body leading-relaxed border-t border-[var(--g-gold-line-soft)] pt-3">
            {T(node.nextChapterTeaser)}
          </div>
        )}
        <SaveSummary save={save} chapter={chapter} />
        <Continue onClick={() => { advance(null, (s) => applyChapterEnd(s, node, chapter.id)); onExit(); }} label="存档并返回" />
      </div>
    );
  } else {
    // Unknown node type — fail loudly (never render blank and continue silently).
    console.error(`[game] unknown node type "${node.type}" at ${save.currentNodeId}`);
    body = <div className="text-sm text-[var(--g-ink-dim)]">未知节点类型：{node.type}（数据 bug，请回报）</div>;
  }

  // PLACEHOLDER-RENDER-2
  const isDialogNode = node.type === 'narration' || node.type === 'dialogue';
  const showPortrait = portraitVisible(save.currentNodeId);
  const portraitSrc = PORTRAITS[save.settings.seniorGender] || PORTRAITS.female;
  const speaking = node.type === 'dialogue' && node.speaker === '沈疏桐';
  const npcSpeaking = node.type === 'dialogue' && npcOnStage && node.speaker === npcOnStage;

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-[background-image] duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* NPC portrait layer (left slot; smaller than 沈疏桐 = supporting-cast hierarchy) */}
      {npcOnStage && (
        <img
          src={NPC_PORTRAITS[npcOnStage]}
          alt={npcOnStage}
          className="absolute bottom-0 left-[-4%] h-[74%] object-contain transition-all duration-300"
          style={{
            zIndex: npcSpeaking ? 12 : 10, // speaker-in-front (VN two-shot convention)
            filter: npcSpeaking
              ? 'brightness(1.03) drop-shadow(0 6px 18px rgba(0,0,0,0.35))'
              : 'brightness(0.62) drop-shadow(0 6px 14px rgba(0,0,0,0.25))',
            transform: npcSpeaking ? 'scale(1)' : 'scale(0.985)',
          }}
          onError={(e) => { console.warn('[game] npc portrait missing:', npcOnStage); e.target.style.display = 'none'; }}
        />
      )}

      {/* portrait layer (沈疏桐, gender variant) */}
      {showPortrait && (
        <img
          src={portraitSrc}
          alt="沈疏桐"
          className={`absolute bottom-0 h-[86%] object-contain transition-all duration-300 ${npcOnStage ? 'right-[-6%]' : 'right-[6%]'}`}
          style={{
            zIndex: speaking ? 12 : 11, // stays above a silent NPC, yields to a speaking one
            // alpha-cutout portraits (birefnet) — no blend tricks needed
            filter: speaking
              ? 'brightness(1.03) drop-shadow(0 6px 18px rgba(0,0,0,0.35))'
              : `brightness(${npcOnStage ? 0.62 : 0.72}) drop-shadow(0 6px 14px rgba(0,0,0,0.25))`,
            transform: speaking ? 'scale(1)' : 'scale(0.985)',
          }}
          onError={(e) => { console.warn('[game] portrait missing:', portraitSrc); e.target.style.display = 'none'; }}
        />
      )}

      {/* HUD */}
      <div className="absolute top-0 inset-x-0 z-30 px-4 py-2 bg-gradient-to-b from-black/30 to-transparent">
        <div className="[&_*]:!text-white/90"><Hud save={save} chapter={chapter} /></div>
      </div>

      {/* toast */}
      {toast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full g-paper-panel text-sm text-[var(--g-gold-deep)] font-body font-medium">
          {toast.text}
        </div>
      )}

      {/* cast panel: centered overlay during casting */}
      {activeCast && castNode && (
        <div className="absolute inset-x-0 top-[8%] z-20 flex justify-center px-4">
          <div className="w-full max-w-md max-h-[64vh] overflow-y-auto rounded-xl">
            <CastPanel
              node={castNode}
              settings={save.settings}
              thrown={activeCast.thrown}
              paused={activeCast.paused === true}
              onThrow={handleThrow}
            />
          </div>
        </div>
      )}

      {/* 装卦盘: persistent board while dressing sequence is live (ch2); hidden during an active cast */}
      {activeDressing && !activeCast && (
        <div className="absolute inset-x-0 top-[7%] z-20 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-xs">
            <DressingBoard board={activeDressing} />
          </div>
        </div>
      )}

      {/* main content: dialog box (bottom) for text nodes; centered overlay card otherwise */}
      {isDialogNode ? (
        <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-4">
          <div className="relative max-w-3xl mx-auto g-paper-panel rounded-xl px-6 py-5 min-h-[132px]">
            {/* 祥云角花 — generated ornament, multiply blend over paper; clipped in its own
                inset layer so the seal name plate (negative-margin tab) stays unclipped */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden="true">
              <img
                src="/assets/game/ui-corner-cloud.webp"
                alt=""
                className="absolute -top-1 -right-1 w-24 opacity-45 rotate-90"
                style={{ mixBlendMode: 'multiply' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            {node.type === 'dialogue' && (
              <div className="inline-block -mt-9 mb-1.5 px-4 py-1 rounded-md g-name-plate text-sm font-medium font-body">
                {T(node.speaker)}
              </div>
            )}
            {body}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 overflow-y-auto py-14">
          <div className="w-full max-w-xl g-paper-panel rounded-xl p-6">
            {body}
          </div>
        </div>
      )}

      {/* exit */}
      <button onClick={onExit} className="g-hud absolute bottom-2 left-3 z-30 text-xs rounded-full px-3 py-1 hover:text-white font-body">
        ← 存档并退出
      </button>
    </div>
  );
}

function SaveSummary({ save, chapter = CHAPTER_1 }) {
  return (
    <div className="border border-[var(--g-gold-line-soft)] rounded-lg p-3 space-y-2 text-sm font-body">
      <div className="text-xs text-[var(--g-ink-dim)]">本章结算</div>
      <div className="flex justify-between">
        <span>灵力 <b className="text-[var(--g-gold-deep)]">{save.lingli}</b></span>
        <span>沈疏桐好感 <b>{save.favor}</b></span>
      </div>
      <div className="space-y-1">
        {(chapter.knowledgePoints || []).map((kp) => (
          <div key={kp} className="flex justify-between text-xs">
            <span className="text-[var(--g-ink-dim)]">{KP_SHORT[kp]}（{kp}）</span>
            <span>
              {save.mastery[kp] || '未接触'}
              {save.pendingReview.includes(kp) && <span className="text-[var(--g-gold-deep)]"> · 待复习</span>}
            </span>
          </div>
        ))}
      </div>
      {save.natalHexagram && (
        <div className="text-xs text-[var(--g-ink-dim)] border-t border-[var(--g-gold-line-soft)] pt-2">
          本命卦：<b className="text-[var(--g-ink)]">{save.natalHexagram.benGua}</b>
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
      <div className="text-center text-lg font-display text-[var(--g-ink)]">入门造册</div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--g-ink-dim)] font-body">道号（你的名字）</div>
        <input
          value={name} onChange={(e) => setName(e.target.value)} maxLength={12}
          placeholder="报上名来"
          className="w-full px-3 py-2 rounded-lg border border-[var(--g-gold-line-soft)] bg-transparent text-[var(--g-ink)] font-body outline-none focus:border-[var(--g-gold-line)]"
        />
      </div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--g-ink-dim)] font-body">你的身份</div>
        <div className="flex gap-2">
          <GenderButton value="female" set={setPlayerGender} current={playerGender} label="女弟子" />
          <GenderButton value="male" set={setPlayerGender} current={playerGender} label="男弟子" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-[var(--g-ink-dim)] font-body">引路人（内门弟子沈疏桐）</div>
        <div className="flex gap-2">
          <GenderButton value="female" set={setSeniorGender} current={seniorGender} label="师姐" />
          <GenderButton value="male" set={setSeniorGender} current={seniorGender} label="师兄" />
        </div>
      </div>
      <button
        disabled={!name.trim()}
        onClick={() => onSubmit({ playerName: name.trim(), playerGender, seniorGender })}
        className="w-full py-2.5 rounded-lg bg-[var(--g-gold-wash)] border border-[var(--g-gold-line)] text-[var(--g-gold-deep)] font-medium disabled:opacity-40 font-body"
      >
        入山门
      </button>
    </div>
  );
}
