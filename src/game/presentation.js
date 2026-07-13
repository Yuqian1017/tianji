// Presentation layer config — maps story nodes to backgrounds & BGM.
// Content (chapter data) and presentation (this file) are deliberately separated:
// the script data never carries art/audio concerns.
// Decorative hexagram motifs inside generated art are NOT teaching references —
// teaching-layer hexagrams are code-drawn in CastPanel (knowledge-correctness boundary).

const A = '/assets/game';

// Background switches keyed by node id (applied when currentNodeId reaches the key).
export const BG_SWITCH = {
  'ch1-settings': `${A}/title-art.webp`,
  'ch1-s1-header': `${A}/bg-shanmen.webp`,
  'ch1-s1-060': `${A}/bg-jieyindian.webp`,
  'ch1-s2-header': `${A}/bg-langting.webp`,
  'ch1-s3-header': `${A}/bg-cangjinge.webp`,
  'ch1-s4-header': `${A}/bg-cangjinge.webp`,
  'ch1-s5-header': `${A}/bg-mingshitang.webp`,
  'ch1-s6-header': `${A}/bg-mingshitang.webp`,
  'ch1-s7-header': `${A}/bg-shanjing.webp`,
  // 石窟 reveal: all three CP-02 branches
  'ch1-s7-cp02a040': `${A}/bg-shiku.webp`,
  'ch1-s7-cp02b050': `${A}/bg-shiku.webp`,
  'ch1-s7-cp02c020': `${A}/bg-shiku.webp`,
  'ch1-s8-header': `${A}/bg-shiku.webp`,
  'ch1-s8-420': `${A}/bg-mingshitang.webp`,
  'ch1-s8-hook': `${A}/bg-chenguang.webp`,
};

// BGM switches keyed by node id. null = fade out.
export const BGM_SWITCH = {
  'ch1-settings': `${A}/bgm-main.mp3`,
  'ch1-s3-header': `${A}/bgm-mystery.mp3`,
  'ch1-s5-header': `${A}/bgm-ritual.mp3`,
  'ch1-s6-header': `${A}/bgm-mystery.mp3`,
  'ch1-s8-420': `${A}/bgm-ritual.mp3`,
  'ch1-s8-hook': `${A}/bgm-dawn.mp3`,
};

export const PORTRAITS = {
  female: `${A}/portrait-shen-f-cut.webp`, // birefnet alpha cutout (2026-07-12)
  male: `${A}/portrait-shen-m-cut.webp`,
};

// Portrait visibility: ch1 from scene 2 onward; ch2 throughout (沈疏桐全程在场);
// bonus qiannang (qn-) scenes 3+ (廊亭夜起).
export function portraitVisible(nodeId) {
  const ch1 = /^ch1-s(\d)/.exec(nodeId || '');
  if (ch1) return Number(ch1[1]) >= 2;
  if (/^ch2-s\d/.test(nodeId || '')) return true;
  const qn = /^qn-s(\d)/.exec(nodeId || '');
  if (qn) return Number(qn[1]) >= 3;
  return false;
}

// Resolve current bg/bgm for a node by walking the chapter path is overkill;
// instead the Player tracks "last switch seen" while advancing. For save-resume,
// derive the latest switch at or before the node via scene-prefix fallback:
export const SCENE_FALLBACK_BG = {
  1: `${A}/bg-shanmen.webp`,
  2: `${A}/bg-langting.webp`,
  3: `${A}/bg-cangjinge.webp`,
  4: `${A}/bg-cangjinge.webp`,
  5: `${A}/bg-mingshitang.webp`,
  6: `${A}/bg-mingshitang.webp`,
  7: `${A}/bg-shanjing.webp`,
  8: `${A}/bg-shiku.webp`,
};
export const SCENE_FALLBACK_BGM = {
  1: `${A}/bgm-main.mp3`,
  2: `${A}/bgm-main.mp3`,
  3: `${A}/bgm-mystery.mp3`,
  4: `${A}/bgm-mystery.mp3`,
  5: `${A}/bgm-ritual.mp3`,
  6: `${A}/bgm-mystery.mp3`,
  7: `${A}/bgm-mystery.mp3`,
  8: `${A}/bgm-mystery.mp3`,
};

export function fallbackForNode(nodeId) {
  if (/^qn-/.test(nodeId || '')) {
    // bonus《钱囊》: pavilion nights + main theme by default; switches refine per scene
    const s = Number(/^qn-s(\d)/.exec(nodeId)?.[1] || 0);
    return { bg: s === 2 ? `${A}/bg-shanmen.webp` : `${A}/bg-langting.webp`, bgm: s >= 3 ? `${A}/bgm-dawn.mp3` : `${A}/bgm-main.mp3` };
  }
  if (/^ch2-/.test(nodeId || '')) {
    const s = Number(/^ch2-s(\d)/.exec(nodeId)?.[1] || 0);
    return {
      bg: CH2_SCENE_BG[s] || `${A}/title-art.webp`,
      bgm: CH2_SCENE_BGM[s] || null,
    };
  }
  const m = /^ch1-s(\d)/.exec(nodeId || '');
  const scene = m ? Number(m[1]) : 0;
  return {
    bg: SCENE_FALLBACK_BG[scene] || `${A}/title-art.webp`,
    bgm: SCENE_FALLBACK_BGM[scene] || null,
  };
}

// Bonus chapter switches (merged into the same lookup by Player)
BG_SWITCH['qn-s1-header'] = `${A}/bg-langting.webp`;
BG_SWITCH['qn-s2-header'] = `${A}/bg-shanmen.webp`;
BG_SWITCH['qn-s3-header'] = `${A}/bg-langting.webp`;
BGM_SWITCH['qn-s1-header'] = `${A}/bgm-main.mp3`;
BGM_SWITCH['qn-s3-header'] = `${A}/bgm-dawn.mp3`;

// ── Chapter 2《装卦》 (M2) ──────────────────────────────────────────
// 藏经阁内景无专图：复用 bg-cangjinge（阁前）（HANDOFF/script §0-8，M3 可补内景图）。
// Scene arc: 点验(阁) → 授课(明蓍堂) → 点验(阁) → 缺位/伪页(阁·夜) → 案卦(明蓍堂·夜) → 灯(夜半)。
BG_SWITCH['ch2-s1-header'] = `${A}/bg-cangjinge.webp`;
BG_SWITCH['ch2-s2-header'] = `${A}/bg-mingshitang.webp`;
BG_SWITCH['ch2-s3-header'] = `${A}/bg-mingshitang.webp`;
// 3.2 点验开工 in-scene switch is wired post-merge on the 3.2 anchor node (see CH2_SCENE note below)
BG_SWITCH['ch2-s4-header'] = `${A}/bg-cangjinge.webp`;
BG_SWITCH['ch2-s5-header'] = `${A}/bg-cangjinge.webp`;
BG_SWITCH['ch2-s6-header'] = `${A}/bg-mingshitang.webp`;
BG_SWITCH['ch2-s7-header'] = `${A}/bg-mingshitang.webp`;
BGM_SWITCH['ch2-s1-header'] = `${A}/bgm-mystery.mp3`;
BGM_SWITCH['ch2-s2-header'] = `${A}/bgm-main.mp3`;
BGM_SWITCH['ch2-s4-header'] = `${A}/bgm-mystery.mp3`;
BGM_SWITCH['ch2-s6-header'] = `${A}/bgm-ritual.mp3`;
BGM_SWITCH['ch2-s7-header'] = `${A}/bgm-dawn.mp3`;

// ch2 resume fallbacks (scene-level; s3 splits 明蓍堂→藏经阁 mid-scene — fallback picks 阁 as
// the longer half; resuming inside 3.1 shows 阁 briefly until next header, accepted P3)
const CH2_SCENE_BG = {
  1: `${A}/bg-cangjinge.webp`, 2: `${A}/bg-mingshitang.webp`, 3: `${A}/bg-cangjinge.webp`,
  4: `${A}/bg-cangjinge.webp`, 5: `${A}/bg-cangjinge.webp`, 6: `${A}/bg-mingshitang.webp`,
  7: `${A}/bg-mingshitang.webp`,
};
const CH2_SCENE_BGM = {
  1: `${A}/bgm-mystery.mp3`, 2: `${A}/bgm-main.mp3`, 3: `${A}/bgm-mystery.mp3`,
  4: `${A}/bgm-mystery.mp3`, 5: `${A}/bgm-mystery.mp3`, 6: `${A}/bgm-ritual.mp3`,
  7: `${A}/bgm-dawn.mp3`,
};

export const PRELOAD_IMAGES = [
  `${A}/title-art.webp`, `${A}/bg-shanmen.webp`, `${A}/bg-jieyindian.webp`,
  `${A}/bg-langting.webp`, `${A}/bg-cangjinge.webp`, `${A}/bg-mingshitang.webp`,
  `${A}/bg-shanjing.webp`, `${A}/bg-shiku.webp`, `${A}/bg-chenguang.webp`,
  `${A}/portrait-shen-f-cut.webp`, `${A}/portrait-shen-m-cut.webp`,
];
