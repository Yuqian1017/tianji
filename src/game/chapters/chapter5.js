// Chapter 5 《元神忌神》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_5_SCRIPT_v1.md (owner-gate delegated;
// review convergence pending — transcription starts only after convergence).
// This file is a FAITHFUL transcription of the approved script.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1-4.js headers. ch5 uses NO new node types.
// ch5-specific conventions:
// - favorBranch(45) is the OPENING fork (after s1-header): pass=知心 opening,
//   fail=信任 opening; both chains are normal paths, both carry ZERO favor
//   (currency-neutral fork — lint-enforced), converge at the 1.2 anchor.
// - {{junior}} appears NOWHERE (both tiers ≥25 use direct name).
// - 仇神 may appear in exactly ONE node (act-2 naming beat) — lint-capped.
// - No wangshuai board annotations this chapter (prep § 6 ruling).
// - Fixed period 卯月丁亥日 (engine ref input {year:2026,month:3,day:14,hour:22}).
//
// ── Coin-face convention (canonical) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_5 = {
  id: 'ch5',
  title: '元神忌神',
  scriptVersion: 'PENDING-convergence',
  entryNode: 'ch5-s1-header',

  // 剧情固定卦象：火天大有 · 六爻安静（乾宫归魂，世三应上；引擎实测 2026-07-17，卯月丁亥日）
  // 教学复盘卦：乾为天（幕二三四）；地火明夷第三读（幕三四）；山地剥一句复读位（幕七）。
  fixedCase: {
    throws: [7, 7, 7, 7, 8, 7], // 初爻→上爻
    benGua: '火天大有',
    bianGua: null,              // 六爻安静
    movingLineIndex: null,
  },

  knowledgePoints: ['KP-LY-013', 'KP-LY-014', 'KP-LY-015'],

  nodes: {
    /* AGENT-A-SLOT: 幕一~幕四 (ch5-s1-* .. ch5-s4-*) — 幕四末节点 next: 'ch5-s5-header' */
    /* AGENT-B-SLOT: 幕五~幕七 (ch5-s5-* .. ch5-s7-*, ch5-end) — 起点锚 ch5-s5-header */
  },
};

export default CHAPTER_5;
