// Presentation layer config — maps story nodes to backgrounds & BGM.
// Content (chapter data) and presentation (this file) are deliberately separated:
// the script data never carries art/audio concerns.
// Decorative hexagram motifs inside generated art are NOT teaching references —
// teaching-layer hexagrams are code-drawn in CastPanel (knowledge-correctness boundary).

const A = '/assets/game';

// Background switches keyed by node id (applied when currentNodeId reaches the key).
export const BG_SWITCH = {
  'ch1-settings': `${A}/title-art.png`,
  'ch1-s1-header': `${A}/bg-shanmen.png`,
  'ch1-s1-060': `${A}/bg-jieyindian.png`,
  'ch1-s2-header': `${A}/bg-langting.png`,
  'ch1-s3-header': `${A}/bg-cangjinge.png`,
  'ch1-s4-header': `${A}/bg-cangjinge.png`,
  'ch1-s5-header': `${A}/bg-mingshitang.png`,
  'ch1-s6-header': `${A}/bg-mingshitang.png`,
  'ch1-s7-header': `${A}/bg-shanjing.png`,
  // 石窟 reveal: all three CP-02 branches
  'ch1-s7-cp02a040': `${A}/bg-shiku.png`,
  'ch1-s7-cp02b050': `${A}/bg-shiku.png`,
  'ch1-s7-cp02c020': `${A}/bg-shiku.png`,
  'ch1-s8-header': `${A}/bg-shiku.png`,
  'ch1-s8-420': `${A}/bg-mingshitang.png`,
  'ch1-s8-hook': `${A}/bg-chenguang.png`,
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
  female: `${A}/portrait-shen-f.png`,
  male: `${A}/portrait-shen-m.png`,
};

// Portrait visible from scene 2 onward (沈疏桐 in-scene rule of thumb for ch1).
export function portraitVisible(nodeId) {
  const m = /^ch1-s(\d)/.exec(nodeId || '');
  return m ? Number(m[1]) >= 2 : false;
}

// Resolve current bg/bgm for a node by walking the chapter path is overkill;
// instead the Player tracks "last switch seen" while advancing. For save-resume,
// derive the latest switch at or before the node via scene-prefix fallback:
export const SCENE_FALLBACK_BG = {
  1: `${A}/bg-shanmen.png`,
  2: `${A}/bg-langting.png`,
  3: `${A}/bg-cangjinge.png`,
  4: `${A}/bg-cangjinge.png`,
  5: `${A}/bg-mingshitang.png`,
  6: `${A}/bg-mingshitang.png`,
  7: `${A}/bg-shanjing.png`,
  8: `${A}/bg-shiku.png`,
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
  const m = /^ch1-s(\d)/.exec(nodeId || '');
  const scene = m ? Number(m[1]) : 0;
  return {
    bg: SCENE_FALLBACK_BG[scene] || `${A}/title-art.png`,
    bgm: SCENE_FALLBACK_BGM[scene] || null,
  };
}

export const PRELOAD_IMAGES = [
  `${A}/title-art.png`, `${A}/bg-shanmen.png`, `${A}/bg-jieyindian.png`,
  `${A}/bg-langting.png`, `${A}/bg-cangjinge.png`, `${A}/bg-mingshitang.png`,
  `${A}/bg-shanjing.png`, `${A}/bg-shiku.png`, `${A}/bg-chenguang.png`,
  `${A}/portrait-shen-f.png`, `${A}/portrait-shen-m.png`,
];
