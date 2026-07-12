// Game state: save/load, three-track values (掌握度/灵力/好感), template rendering.
// PRD §5.3 三数值分离: mastery per-KP is the only learning truth; 灵力 is its narrative
// projection; 好感 is per-character relationship. PRD §4.2 mastery ladder + demotion.

const SAVE_KEY = 'tianji-game-save';

export const MASTERY_ORDER = ['未接触', '见过', '用过', '掌握', '内化'];

export function newSave() {
  return {
    version: 1,
    settings: { playerName: '', playerGender: 'female', seniorGender: 'female' },
    currentNodeId: null,       // null = not started (settings screen)
    favor: 0,                  // 沈疏桐好感
    lingli: 0,
    mastery: {},               // { 'KP-LY-001': '见过', ... }
    pendingReview: [],         // KP ids marked 待复习 (PRD §4.2 demotion)
    natalHexagram: null,       // saved by scene-8 random cast (long-line hook)
    choiceLog: [],             // [{cpId, key, verdict}] — scored choices only
    completedChapters: [],
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const save = JSON.parse(raw);
    if (save.version !== 1) {
      console.warn(`[game] save version ${save.version} unsupported — starting fresh`);
      return null;
    }
    return save;
  } catch (e) {
    console.warn('[game] save unreadable, starting fresh:', e.message);
    return null;
  }
}

export function persistSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  return save;
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ── Template variables (PRD §6.2) ────────────────────────────────────
export function renderTemplate(text, settings) {
  if (!text) return text;
  const seniorFemale = settings.seniorGender === 'female';
  const playerFemale = settings.playerGender === 'female';
  return text
    .replaceAll('{{senior}}', seniorFemale ? '师姐' : '师兄')
    .replaceAll('{{ta}}', seniorFemale ? '她' : '他')
    .replaceAll('{{junior}}', playerFemale ? '师妹' : '师弟')
    .replaceAll('{{player}}', settings.playerName || '无名');
}

export function pickVariant(node, settings) {
  if (node.variants) {
    return settings.seniorGender === 'female' ? node.variants.female : node.variants.male;
  }
  return node.text;
}

// ── Mastery / points ─────────────────────────────────────────────────
function masteryRank(level) {
  const i = MASTERY_ORDER.indexOf(level || '未接触');
  return i === -1 ? 0 : i;
}

// teachMoment node → apply masteryTo + lingli. Never demote via teach moments.
export function applyTeachMoment(save, node) {
  const next = { ...save, mastery: { ...save.mastery } };
  const current = next.mastery[node.kpId] || '未接触';
  const target = node.masteryTo || current;
  if (masteryRank(target) > masteryRank(current)) {
    next.mastery[node.kpId] = target;
  }
  next.lingli += node.lingli || 0;
  return next;
}

// scoredChoice option → rewards / demotion. Returns {save, outcome}.
export function applyScoredChoice(save, node, option) {
  let next = {
    ...save,
    mastery: { ...save.mastery },
    pendingReview: [...save.pendingReview],
    choiceLog: [...save.choiceLog, { cpId: node.cpId, key: option.key, verdict: option.verdict }],
  };
  if (option.verdict === 'optimal') {
    const r = node.rewards?.optimal || {};
    next.lingli += r.lingli || 0;
    next.favor += r.favor || 0;
    for (const kp of node.testsKp || []) {
      if (masteryRank('掌握') > masteryRank(next.mastery[kp])) next.mastery[kp] = '掌握';
    }
  } else {
    // suboptimal / wrong: 平淡线 + 待复习; never blocks progress (PRD §4.2)
    for (const kp of node.testsKp || []) {
      if (!next.pendingReview.includes(kp)) next.pendingReview.push(kp);
    }
  }
  return next;
}

export function applyFavor(save, favor) {
  if (!favor) return save;
  return { ...save, favor: save.favor + favor };
}

// ── CP-03 dynamic option text (natal cast is random; options must describe the actual hexagram) ──
import { getTrigramFromValues } from '../modules/liuyao/engine.js';

const YAO_NAMES_CN = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

export function dynamicOptionText(optionKey, natal) {
  if (!natal?.throws || natal.throws.length !== 6) {
    console.warn('[game] dynamicOptionText called without a valid natal hexagram — falling back to template text');
    return null;
  }
  const inner = getTrigramFromValues(natal.throws.slice(0, 3));
  const outer = getTrigramFromValues(natal.throws.slice(3, 6));
  const moving = (natal.movingLines || []).map((i) => YAO_NAMES_CN[i]);
  const movingDesc = moving.length ? `${moving.join('、')}动` : '六爻安静';
  if (optionKey === 'A') return `内卦是${inner}，外卦是${outer}，${movingDesc}——${natal.benGua}。`;
  if (optionKey === 'B') return `摇出来的是${natal.benGua}。`;
  if (optionKey === 'C') {
    const topIsYang = natal.throws[5] === 7 || natal.throws[5] === 9;
    return `从上往下数：初爻是${topIsYang ? '阳' : '阴'}爻……`;
  }
  return null;
}

export function applyChapterEnd(save, node, chapterId) {
  const next = { ...save, lingli: save.lingli + (node.rewards?.lingli || 0) };
  if (!next.completedChapters.includes(chapterId)) {
    next.completedChapters = [...next.completedChapters, chapterId];
  }
  return next;
}
