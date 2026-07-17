// Chapter 4 《旺衰》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_4_SCRIPT_v1.md (owner-gate passed 2026-07-17
// delegated 「你自己审，自己往下推」; 4-round review converged: R1-R3 technical +
// R4 teachability). This file is a FAITHFUL transcription of the approved script.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1/2/3.js headers. ch4 uses NO new node types.
// ch4-specific conventions:
// - Occult period is FIXED by script (卯月辛巳日) — castInteraction runs mode:'fixed',
//   no runtime paipan, so no fixedDate engine contract is needed (evaluated 2026-07-17:
//   Player.jsx only builds dateParts for mode:'random'+saveAs natal casts).
// - dressingUpdate revealed[] entries may carry optional `wangshuai` (e.g. '旺·月生日临')
//   displayed after liuqin by CastPanel.DressingBoard — ONLY the 用神 line (初爻父母巳火)
//   of the 地泽临 case chart carries it. Rendered as 「巳火·父母·旺」 style.
// - favorBranch anchor is MID-CHAPTER (幕六末, threshold 25) — before it, 沈疏桐 dialogue
//   uses neutral address only (no {{junior}}, no {{player}} direct-name); enforced by lint.
// - Bare 她 in rendered text = 白芷 only (natally female); 沈疏桐 always {{ta}}.
//   Bare 他 = 宋补之/崔小砚/郑司书/案犯 (natally male). Enforced by lint whitelist.
//
// ── Coin-face convention (canonical, per 卜筮正宗/增删卜易) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_4 = {
  id: 'ch4',
  title: '旺衰',
  scriptVersion: 'v1.2-owner-approved-2026-07-17',
  entryNode: 'ch4-s1-header',

  // 剧情固定卦象：地泽临 · 六爻安静（坤宫二世，世二应五；引擎实测 2026-07-17，卯月辛巳日）
  // 教学复盘卦：乾为天（世六应三）；「点偏半分」谱页：风地观（乾宫四世，五爻辛巳官鬼）；
  // 山地剥（ch3 案卦）应二官鬼巳火本章旺衰复读。
  fixedCase: {
    throws: [7, 7, 8, 8, 8, 8], // 初爻→上爻
    benGua: '地泽临',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-010', 'KP-LY-011', 'KP-LY-012'],

  nodes: {
    /* AGENT-A-SLOT: 幕一~幕四 (ch4-s1-* .. ch4-s4-*) — 幕四末节点 next: 'ch4-s5-header' */
    /* AGENT-B-SLOT: 幕五~幕七 (ch4-s5-* .. ch4-s7-*, ch4-end) — 起点锚 ch4-s5-header */
  },
};

export default CHAPTER_4;
