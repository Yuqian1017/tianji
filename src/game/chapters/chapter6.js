// Chapter 6 《动爻》 — structured node-flow data
// Source of truth: docs/script/CHAPTER_6_SCRIPT_v1.md v1.1 (two-round review converged
// 2026-07-18; owner-gate delegated). This file is a FAITHFUL transcription.
// Do NOT edit dialogue content here without updating the script doc first (脚本先行铁律).
//
// Node types: see chapter1-5.js headers. ch6 uses NO new node types.
// ch6-specific conventions:
// - favorBranch(45) is in ACT SIX (natal homework beat, ch6-s6-fb) — NOT the opener
//   (ch5 used the opener slot). pass=知心 close, fail=课业 close; both chains zero
//   favor, converge at ch6-s6-merge. Pre-fork max accumulation is +9 (guides 3 +
//   CP 1/2/2 + case-flavor 1); chapter-end +1 lands after.
// - Dual fixed periods: act 1 = 辰月己酉日 ({year:2026,month:4,day:5}), acts 2-7
//   anchor day = 辰月辛亥日 ({year:2026,month:4,day:7,hour:21}). 22 days after ch5
//   丁亥 (script wording: 二十余日 — NOT 旬日, R1 P2-7).
// - Case gua 观之剥 has ONE moving line (5th, 辛巳官鬼→变丙子子孙). DressingUpdate
//   board gains optional `bian` field on revealed rows: { pos:5, ..., moving:true,
//   bian:'子·子孙' } — renderer support added this chapter (wangshuai-column model).
// - 巳线两层分离 (机检): natal homework nodes (ch6-s6-fb through ch6-s6-merge span)
//   must not contain 案情指称词 他/动手/贼/来取 — lint-enforced.
// - Banned-term whitelist deltas vs ch5: UNBAN 動爻生克语境/變爻/回頭生/回頭克/
//   暗動机理/日破/沖散辨伪/择动; NEW BANS 化進神/化退神/化空/沖空/沖起/合住/沖實.
//   仇神 whitelist from ch5 (single node) does NOT carry over — zero occurrences here.
// - 「休」「囚」 single chars banned from dialogue text (泄气/衰半档 only).
//
// ── Coin-face convention (canonical) ──────────
// Count BACKS: 1 back=单(7 少阳) · 2 backs=拆(8 少阴) · 3 backs=重(9 老阳,动) · 3 chars=交(6 老阴,动)

export const CHAPTER_6 = {
  id: 'ch6',
  title: '动爻',
  scriptVersion: 'v1.1-converged-2026-07-18',
  entryNode: 'ch6-s1-header',

  // 剧情固定卦象：风地观之山地剥 · 五爻辛巳官鬼独发（乾宫四世；引擎实测 2026-07-18，辰月辛亥日）
  // 教学复盘卦：火天大有辰月快照（幕六）；動靜生克章谱例（坤/兌之歸妹/坤之晉——口头，不上盘）。
  fixedCase: {
    throws: [8, 8, 8, 8, 9, 7], // 初爻→上爻；五爻 9=老阳動
    benGua: '风地观',
    bianGua: '山地剥',
    palace: '乾宫',
    guaType: '四世',
    movingLine: 5, // 1-based position
    period: { monthBranch: '辰', dayGanzhi: '辛亥', engineRef: { year: 2026, month: 4, day: 7, hour: 21 } },
  },

  nodes: {
    // ── MERGED FROM TRANSCRIPTION AGENTS (A: acts 1-4, B: acts 5-7) ──
  },
};
