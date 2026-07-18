// Chapter 5 script-data lint — PRD §4.6 quality gate (adapted from audit-chapter4-script.mjs)
// ch4 additions vs ch3:
//   - forbidden-term scan on rendered text (旬空/伏神/元神/忌神/六合… still banned;
//     元神/忌神 whitelisted ONLY in ch4-end.nextChapterTeaser per § 0 第 7 条特批位②)
//   - neutral-address check: all 沈疏桐 dialogue reachable BEFORE the favorBranch anchor
//     must contain neither {{junior}} nor {{player}} (§ 0 第 3 条 — R2 lesson mechanized)
//   - bare-她 whitelist: rendered text containing 她 must be on the 白芷 node whitelist
//     (沈疏桐 is gender-flipped → always {{ta}}; R2 pronoun-regression lesson mechanized)
//   - dressingUpdate wangshuai field allowed ONLY on 地泽临 pos 1 (用神父母巳火)
//   - three fixed charts: 地泽临 (case) / 风地观 (幕一谱页) / 乾为天 (幕二教学复盘)
// Usage: node scripts/validation/audit-chapter5-script.mjs   (npm run audit:chapter5)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { CHAPTER_5 } = await import(path.join(ROOT, 'src/game/chapters/chapter5.js'));
const { paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));

const EXPECTED = {
  teachMomentLingli: 12,
  cpMasteryLingli: 15,
  chapterClearLingli: 10,
  totalLingli: 37,
  totalFavor: 10,             // optimal-path max: 引导3 + CP(1+2+2) + 走访1 + 章末1
  knowledgePoints: ['KP-LY-013', 'KP-LY-014', 'KP-LY-015'],
  scoredChoicePoints: ['CH5-CP-01', 'CH5-CP-02', 'CH5-CP-03'],
  allowedVars: ['senior', 'ta', 'junior', 'player'],
  caseThrows: [7, 7, 7, 7, 8, 7],       // 火天大有 · 六爻安静
  mingyiThrows: [7, 8, 7, 8, 8, 8],     // 地火明夷（第三读，若入 board）
  qianThrows: [7, 7, 7, 7, 7, 7],       // 乾为天（幕二三四教学复盘，若入 board）
  favorThreshold: 45,               // ch5 章首档位分叉（知心 45）
};

// Rendered-text policy tables (ch4-specific, § 0 第 3/7 条 + R2 lesson)
const BANNED_TERMS = ['旬空', '空亡', '伏神', '六冲', '六沖', '六合', '三合', '三刑', '接续相生', '接續相生', '贪生忘克', '貪生忘克', '化进', '化進', '化退', '三墓', '长生帝旺', '長生帝旺', '衰而又絕', '化絕'];
const TEASER_ALLOWED = ['动爻', '動爻']; // ch5 teaser 预告第六课动爻——正文他处禁「動爻」？不禁：动爻为 ch1 KP-003 已教词。TEASER_ALLOWED 本轮实际无需（保留机制空转）
// Node ids whose rendered text may contain bare 她 (= 白芷, natally female).
// Fill with actual ids at transcription-merge time; lint fails loudly on any other 她.
const BAIZHI_SHE_WHITELIST = new Set([
  // 白芷 refs only (natally female; 沈疏桐 is always {{ta}}). Verified at merge 2026-07-17.
  'ch4-s5-480', 'ch4-s5-520', 'ch4-s5-530', 'ch4-s5-550', // 5.4 捎话段
  'ch4-s6-040',  // 6.1 in-dialogue pair (插销是她走前才换的新)
  'ch4-end',     // hook ⑤ quotes 白芷所惧
]);

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const nodes = CHAPTER_5.nodes;
const ids = Object.keys(nodes);

// ── 1. Node graph integrity (cast interleave + favorBranch edges) ────
if (!nodes[CHAPTER_5.entryNode]) fail(`entryNode ${CHAPTER_5.entryNode} not found`);

const outEdges = (node) => {
  const edges = [];
  if (node.next !== undefined && node.next !== null) edges.push(node.next);
  if (node.options) for (const o of node.options) if (o.next) edges.push(o.next);
  if (node.perThrow) for (const t of node.perThrow) if (t.interleaveNode) edges.push(t.interleaveNode);
  if (node.type === 'favorBranch') {
    if (node.pass) edges.push(node.pass);
    if (node.fail) edges.push(node.fail);
  }
  return edges;
};

for (const [id, node] of Object.entries(nodes)) {
  for (const target of outEdges(node)) {
    if (!nodes[target]) fail(`node ${id} → dangling next "${target}"`);
  }
  const isTerminal = node.type === 'chapterEnd' || node.next === null;
  if (!isTerminal && outEdges(node).length === 0 && node.type !== 'chapterEnd') {
    fail(`node ${id} (${node.type}) has no outgoing edge and is not chapterEnd`);
  }
  if (node.type === 'favorBranch') {
    if (node.threshold !== EXPECTED.favorThreshold) fail(`${id}: favorBranch threshold ${node.threshold} ≠ ${EXPECTED.favorThreshold}`);
    if (!node.pass || !node.fail) fail(`${id}: favorBranch must carry both pass and fail`);
  }
}

const reachFrom = (start) => {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id) || !nodes[id]) continue;
    seen.add(id);
    stack.push(...outEdges(nodes[id]));
  }
  return seen;
};
const reachable = reachFrom(CHAPTER_5.entryNode);
for (const id of ids) if (!reachable.has(id)) fail(`orphan node (unreachable from entry): ${id}`);

const favorBranches = ids.filter((id) => nodes[id].type === 'favorBranch');
let failExclusive = new Set();
for (const fbId of favorBranches) {
  const fb = nodes[fbId];
  const passSet = reachFrom(fb.pass);
  const failSet = reachFrom(fb.fail);
  for (const id of failSet) if (!passSet.has(id)) failExclusive.add(id);
  const passEnd = [...passSet].some((id) => nodes[id].type === 'chapterEnd');
  const failEnd = [...failSet].some((id) => nodes[id].type === 'chapterEnd');
  if (!passEnd || !failEnd) fail(`${fbId}: pass/fail chains must both reach chapterEnd (pass=${passEnd}, fail=${failEnd})`);
}

// ── 2. Transcription progress / single end ──────────────────────────
const todoNodes = ids.filter((id) => id.includes('TODO') || (nodes[id].text || '').includes('TRANSCRIPTION PENDING'));
if (todoNodes.length) warn(`transcription incomplete: ${todoNodes.length} TODO node(s)`);
const chapterEnds = ids.filter((id) => nodes[id].type === 'chapterEnd');
if (todoNodes.length === 0 && chapterEnds.length !== 1) fail(`expected exactly 1 chapterEnd, found ${chapterEnds.length}`);

// ── 3. Scored choice completeness ───────────────────────────────────
const scoredChoices = ids.filter((id) => nodes[id].type === 'scoredChoice').map((id) => nodes[id]);
const foundCpIds = scoredChoices.map((n) => n.cpId).sort();
if (todoNodes.length === 0) {
  const expectedCp = [...EXPECTED.scoredChoicePoints].sort();
  if (JSON.stringify(foundCpIds) !== JSON.stringify(expectedCp)) {
    fail(`scored choice points mismatch: found [${foundCpIds}], expected [${expectedCp}]`);
  }
}
for (const cp of scoredChoices) {
  const where = cp.cpId || '(missing cpId)';
  if (!cp.cpId) fail(`scoredChoice missing cpId`);
  if (!Array.isArray(cp.testsKp) || cp.testsKp.length === 0) fail(`${where}: missing testsKp`);
  const verdicts = (cp.options || []).map((o) => o.verdict).sort();
  if (JSON.stringify(verdicts) !== JSON.stringify(['optimal', 'suboptimal', 'wrong'])) {
    fail(`${where}: verdicts must be exactly {optimal, suboptimal, wrong}, got [${verdicts}]`);
  }
  for (const o of cp.options || []) {
    if (!o.basis) fail(`${where}/${o.key}: missing basis`);
    if ((o.verdict === 'optimal' || o.verdict === 'wrong' || o.verdict === 'suboptimal') && (!Array.isArray(o.sourceRef) || o.sourceRef.length === 0)) {
      // ch4 upgrade: ALL verdicts carry sourceRef except where script explicitly omits (CP-01 wrong has one per R1 fix)
      if (o.verdict === 'optimal') fail(`${where}/${o.key}: optimal option must carry non-empty sourceRef`);
      else warn(`${where}/${o.key}: ${o.verdict} option has no sourceRef (script parity: R1 fix added them)`);
    }
    if (!o.next) fail(`${where}/${o.key}: missing next`);
  }
  if (!cp.rewards?.optimal) fail(`${where}: missing rewards.optimal`);
  if (!cp.onWrong) fail(`${where}: missing onWrong`);
}

// ── 4. KP accepted status + no out-of-list references ───────────────
for (const kp of EXPECTED.knowledgePoints) {
  try {
    const card = JSON.parse(readFileSync(path.join(ROOT, `database/knowledge/${kp.toLowerCase()}.json`), 'utf-8'));
    if (card.status !== 'accepted') fail(`${kp} status is "${card.status}", must be "accepted" (PRD §4.1 hard rule)`);
    if (card.id !== kp) fail(`${kp} card id mismatch: ${card.id}`);
  } catch (e) {
    fail(`${kp}: knowledge card unreadable — ${e.message}`);
  }
}
const teachMoments = ids.filter((id) => nodes[id].type === 'teachMoment').map((id) => nodes[id]);
const referencedKps = new Set([
  ...scoredChoices.flatMap((c) => c.testsKp || []),
  ...teachMoments.map((n) => n.kpId),
]);
for (const kp of referencedKps) {
  if (!EXPECTED.knowledgePoints.includes(kp)) fail(`referenced KP ${kp} is outside the chapter's approved KP list`);
}

// ── 5. Point accounting (favor = optimal-path max: fail-exclusive excluded) ──
const tmLingli = teachMoments.reduce((s, n) => s + (n.lingli || 0), 0);
const cpLingli = scoredChoices.reduce((s, n) => s + (n.rewards?.optimal?.lingli || 0), 0);
const endNode = chapterEnds.length === 1 ? nodes[chapterEnds[0]] : null;
const clearLingli = endNode?.rewards?.lingli || 0;

let favorTotal = 0;
for (const [id, node] of Object.entries(nodes)) {
  if (failExclusive.has(id)) continue;
  if (node.options) favorTotal += Math.max(0, ...node.options.map((o) => o.effects?.favor || 0));
  if (node.effects?.favor) favorTotal += node.effects.favor;
  if (node.type === 'scoredChoice') favorTotal += node.rewards?.optimal?.favor || 0;
}

if (todoNodes.length === 0) {
  if (tmLingli !== EXPECTED.teachMomentLingli) fail(`teachMoment 灵力 sum ${tmLingli} ≠ ${EXPECTED.teachMomentLingli}`);
  if (cpLingli !== EXPECTED.cpMasteryLingli) fail(`CP mastery 灵力 sum ${cpLingli} ≠ ${EXPECTED.cpMasteryLingli}`);
  if (clearLingli !== EXPECTED.chapterClearLingli) fail(`chapter clear 灵力 ${clearLingli} ≠ ${EXPECTED.chapterClearLingli}`);
  if (tmLingli + cpLingli + clearLingli !== EXPECTED.totalLingli) fail(`total 灵力 ≠ ${EXPECTED.totalLingli}`);
  if (favorTotal !== EXPECTED.totalFavor) fail(`total 好感 (optimal-path max) ${favorTotal} ≠ ${EXPECTED.totalFavor}`);
  for (const kp of EXPECTED.knowledgePoints) {
    const stages = new Set(teachMoments.filter((t) => t.kpId === kp).map((t) => t.stage));
    const testedByCp = scoredChoices.some((c) => (c.testsKp || []).includes(kp));
    if (!stages.has('demo')) fail(`${kp}: missing demo teach moment`);
    if (!stages.has('guided')) fail(`${kp}: missing guided teach moment`);
    if (!testedByCp) fail(`${kp}: no independent application via CP`);
  }
} else {
  warn(`accounting deferred: 灵力 tm=${tmLingli} cp=${cpLingli} clear=${clearLingli}, 好感=${favorTotal}`);
}

// ── 6. Template variables & variants ────────────────────────────────
const varPattern = /\{\{([^}]+)\}\}/g;
const collectTexts = (node) => {
  const texts = [];
  for (const f of ['text', 'aside', 'prompt', 'context', 'ambience', 'title', 'question']) {
    if (typeof node[f] === 'string') texts.push(node[f]);
  }
  if (node.variants) { texts.push(node.variants.female || '', node.variants.male || ''); }
  if (node.options) for (const o of node.options) {
    if (o.text) texts.push(o.text);
    if (o.response?.text) texts.push(o.response.text);
    if (o.response?.aside) texts.push(o.response.aside);
  }
  if (node.perThrow) for (const t of node.perThrow) {
    if (t.speakerLine) texts.push(t.speakerLine);
    if (t.speaker) texts.push(t.speaker);
  }
  if (node.hooks) texts.push(...node.hooks);
  if (typeof node.nextChapterTeaser === 'string') texts.push(node.nextChapterTeaser);
  return texts;
};
for (const [id, node] of Object.entries(nodes)) {
  for (const text of collectTexts(node)) {
    for (const m of text.matchAll(varPattern)) {
      if (!EXPECTED.allowedVars.includes(m[1])) fail(`node ${id}: unknown template variable {{${m[1]}}}`);
    }
  }
  if (node.variants && (!node.variants.female || !node.variants.male)) {
    fail(`node ${id}: variants must carry BOTH female and male (skeleton parity, PRD §6.2)`);
  }
}

// ── 7. Fixed casts + engine ground truth (three charts) ─────────────
if (JSON.stringify(CHAPTER_5.fixedCase?.throws) !== JSON.stringify(EXPECTED.caseThrows)) {
  fail(`fixedCase.throws ≠ engine-verified [${EXPECTED.caseThrows}]`);
}
const casts = ids.filter((id) => nodes[id].type === 'castInteraction').map((id) => nodes[id]);
for (const c of casts) {
  if (c.mode === 'fixed' && JSON.stringify(c.throws) !== JSON.stringify(EXPECTED.caseThrows)) {
    fail(`castInteraction ${c.castId}: fixed throws ≠ [${EXPECTED.caseThrows}]`);
  }
}

const DATE = { year: 2026, month: 3, day: 14, hour: 22, minute: 0 }; // 卯月丁亥日 (script-fixed period, 守窗第七夜)
const engDy = paipan(EXPECTED.caseThrows, DATE);
if (engDy.benGua.name !== '火天大有') fail(`engine: case throws = ${engDy.benGua.name}, expected 火天大有`);
if (engDy.benGua.palace !== '乾宫' || engDy.benGua.guaType !== '归魂') fail(`engine: 大有 palace ${engDy.benGua.palace}/${engDy.benGua.guaType} ≠ 乾宫/归魂`);
if (engDy.movingLines.length !== 0) fail(`大有 must be 六爻安静, engine reports [${engDy.movingLines}]`);
if (engDy.date.monthBranch !== '卯' || engDy.date.dayStem !== '丁' || engDy.date.dayBranch !== '亥') {
  fail(`script-fixed period drifted: engine says ${engDy.date.monthBranch}月${engDy.date.dayStem}${engDy.date.dayBranch}日, expected 卯月丁亥日`);
}
const dyResp = engDy.lines.find((l) => l.isResponse);
if (!dyResp || dyResp.position !== 6 || dyResp.branch !== '巳' || dyResp.liuqin !== '官鬼') fail(`大有 应 ≠ 上爻巳官鬼`);
if (engDy.lines[1].branch !== '寅' || engDy.lines[1].liuqin !== '妻财') fail(`大有 二爻(元神) ≠ 寅妻财`);
if (engDy.lines[0].branch !== '子' || engDy.lines[0].liuqin !== '子孙') fail(`大有 初爻(忌神) ≠ 子子孙`);
const engMy = paipan(EXPECTED.mingyiThrows, DATE);
if (engMy.benGua.name !== '地火明夷') fail(`engine: mingyi throws = ${engMy.benGua.name}`);
const engQian = paipan(EXPECTED.qianThrows, DATE);
if (engQian.benGua.name !== '乾为天') fail(`engine: qian throws = ${engQian.benGua.name}`);
const chartFor = (throws) => {
  const k = JSON.stringify(throws);
  if (k === JSON.stringify(EXPECTED.caseThrows)) return engDy;
  if (k === JSON.stringify(EXPECTED.mingyiThrows)) return engMy;
  if (k === JSON.stringify(EXPECTED.qianThrows)) return engQian;
  return null;
};

// ── 8. Dressing boards vs engine (+ wangshuai placement rule) ───────
const dressings = ids.filter((id) => nodes[id].type === 'dressingUpdate').map((id) => ({ id, node: nodes[id] }));
const maxRevealedByChart = new Map();
for (const { id, node } of dressings) {
  const b = node.board;
  if (b === null || b === undefined) continue;
  const eng = chartFor(b.throws || []);
  if (!eng) { fail(`${id}: board.throws matches none of 大有/明夷/乾为天`); continue; }
  const key = eng.benGua.name;
  for (const r of b.revealed || []) {
    const line = eng.lines[r.pos - 1];
    if (!line) { fail(`${id}: pos ${r.pos} out of range`); continue; }
    if (r.branch !== line.branch) fail(`${id}: pos ${r.pos} branch ${r.branch} ≠ engine ${line.branch}`);
    if (r.wuxing !== line.wuxingCn) fail(`${id}: pos ${r.pos} wuxing ${r.wuxing} ≠ engine ${line.wuxingCn}`);
    if (r.liuqin && r.liuqin !== line.liuqin) fail(`${id}: pos ${r.pos} liuqin ${r.liuqin} ≠ engine ${line.liuqin}`);
    if (r.wangshuai) {
      fail(`${id}: ch5 boards must NOT carry wangshuai (策划案 § 6 裁定不加——盘面保持已教信息由口头承载)`);
    }
  }
  const revealedCount = (b.revealed || []).length;
  if (revealedCount < (maxRevealedByChart.get(key) || 0)) fail(`${id}: revealed count regressed for ${key} — boards must be cumulative`);
  maxRevealedByChart.set(key, Math.max(maxRevealedByChart.get(key) || 0, revealedCount));
  if (b.marks) {
    const w = eng.lines.findIndex((l) => l.isWorld) + 1;
    const r2 = eng.lines.findIndex((l) => l.isResponse) + 1;
    if (b.marks.world && b.marks.world !== w) fail(`${id}: marks.world ${b.marks.world} ≠ engine ${w}`);
    if (b.marks.response && b.marks.response !== r2) fail(`${id}: marks.response ${b.marks.response} ≠ engine ${r2}`);
  }
}

// ── 9. Forbidden-term scan on rendered text (§ 0 第 7 条) ───────────
for (const [id, node] of Object.entries(nodes)) {
  const isTeaser = (t) => node.type === 'chapterEnd' && t === node.nextChapterTeaser;
  for (const text of collectTexts(node)) {
    for (const term of BANNED_TERMS) {
      if (!text.includes(term)) continue;
      if (isTeaser(text) && TEASER_ALLOWED.includes(term)) continue; // 特批位②
      fail(`node ${id}: rendered text contains banned term 「${term}」 (未教不考红线)`);
    }
  }
}

// ── 9b. 仇神 single-point rule (§ 0 第 7 条) ────────────────────────
{
  let qiushenNodes = 0;
  for (const [, node] of Object.entries(nodes)) {
    if (collectTexts(node).some((t) => t.includes('仇神'))) qiushenNodes += 1;
  }
  if (qiushenNodes > QIUSHEN_WHITELIST_MAX) fail(`仇神 appears in ${qiushenNodes} nodes > allowed ${QIUSHEN_WHITELIST_MAX} (立名即止)`);
}

// ── 10. favorBranch(45) opening-fork semantics + bare-她 whitelist ──
if (favorBranches.length === 1) {
  const fb = nodes[favorBranches[0]];
  // Opening fork: both chains are normal paths (NOT a 容错 fail-chain) — each must
  // carry ZERO favor (favor asymmetry at the fork would leak tier into currency).
  for (const [chainName, start] of [['pass', fb.pass], ['fail', fb.fail]]) {
    const chain = reachFrom(start);
    // count favor only in chain-exclusive nodes (shared converged nodes excluded)
    const other = reachFrom(chainName === 'pass' ? fb.fail : fb.pass);
    let chainFavor = 0;
    for (const id of chain) {
      if (other.has(id)) continue;
      const node = nodes[id];
      if (node.effects?.favor) chainFavor += node.effects.favor;
      if (node.options) chainFavor += Math.max(0, ...node.options.map((o) => o.effects?.favor || 0));
    }
    if (chainFavor !== 0) fail(`favorBranch ${chainName} chain carries favor ${chainFavor} ≠ 0 (opening fork must be currency-neutral)`);
  }
} else if (todoNodes.length === 0) {
  fail(`expected exactly 1 favorBranch, found ${favorBranches.length}`);
}

// 全章禁 {{junior}}（两档均 ≥25 直呼名——§ 0 第 2 条）
for (const [id, node] of Object.entries(nodes)) {
  for (const text of collectTexts(node)) {
    if (text.includes('{{junior}}')) fail(`${id}: {{junior}} must not appear anywhere in ch5 (both tiers ≥25)`);
  }
}

for (const [id, node] of Object.entries(nodes)) {
  for (const text of collectTexts(node)) {
    if (text.includes('她') && !BAIZHI_SHE_WHITELIST.has(id)) {
      fail(`node ${id}: bare 她 outside 白芷 whitelist — 沈疏桐 must be {{ta}} (R2 pronoun lesson)`);
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`chapter-4 script lint: ${failures.length} failure(s), ${warnings.length} warning(s)`);
for (const w of warnings) console.warn('  ⚠', w);
if (failures.length) {
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log(`ALL GREEN — nodes=${ids.length}, 灵力 ${tmLingli}+${cpLingli}+${clearLingli}=${tmLingli + cpLingli + clearLingli}, 好感(optimal)=${favorTotal}`);
