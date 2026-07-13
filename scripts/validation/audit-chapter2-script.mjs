// Chapter 2 script-data lint — PRD §4.6 quality gate (adapted from audit-chapter1-script.mjs)
// Checks: node-graph integrity (incl. cast interleave edges), scored-choice completeness,
// KP accepted status, point accounting (灵力 37 / 好感 max-10 semantics), template variables,
// variant skeleton, fixed cast sequence, and 装卦 (dressing) data vs the liuyao engine tables.
// Usage: node scripts/validation/audit-chapter2-script.mjs   (npm run audit:chapter2)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { CHAPTER_2 } = await import(path.join(ROOT, 'src/game/chapters/chapter2.js'));
const { paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));
const { NAJIA, BRANCH_WUXING, WUXING_CN } = await import(path.join(ROOT, 'src/modules/liuyao/data.js'));

const EXPECTED = {
  teachMomentLingli: 12,      // 3 KP × (demo 1 + guided 3)
  cpMasteryLingli: 15,        // 3 CP × +5 (掌握档统一由 CP reward 发放)
  chapterClearLingli: 10,
  totalLingli: 37,
  totalFavor: 10,             // max-obtainable: 引导3 + CP奖(2+1+2) + 6.4 择一 + 章末1
  knowledgePoints: ['KP-LY-004', 'KP-LY-005', 'KP-LY-006'],
  scoredChoicePoints: ['CH2-CP-01', 'CH2-CP-02', 'CH2-CP-03'],
  allowedVars: ['senior', 'ta', 'junior', 'player'],
  fixedThrows: [7, 8, 7, 8, 8, 8],   // 地火明夷 · 六爻安静 (engine-verified 2026-07-12)
};

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const nodes = CHAPTER_2.nodes;
const ids = Object.keys(nodes);

// ── 1. Node graph integrity (outEdges includes cast interleave chains) ──
if (!nodes[CHAPTER_2.entryNode]) fail(`entryNode ${CHAPTER_2.entryNode} not found`);

const outEdges = (node) => {
  const edges = [];
  if (node.next !== undefined && node.next !== null) edges.push(node.next);
  if (node.options) for (const o of node.options) if (o.next) edges.push(o.next);
  if (node.perThrow) for (const t of node.perThrow) if (t.interleaveNode) edges.push(t.interleaveNode);
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
}

const reachable = new Set();
const stack = [CHAPTER_2.entryNode];
while (stack.length) {
  const id = stack.pop();
  if (!id || reachable.has(id) || !nodes[id]) continue;
  reachable.add(id);
  stack.push(...outEdges(nodes[id]));
}
for (const id of ids) if (!reachable.has(id)) fail(`orphan node (unreachable from entry): ${id}`);

// ── 2. Transcription progress / single end ──────────────────────────
const todoNodes = ids.filter((id) => id.includes('TODO') || (nodes[id].text || '').includes('TRANSCRIPTION PENDING'));
if (todoNodes.length) warn(`transcription incomplete: ${todoNodes.length} TODO node(s): ${todoNodes.join(', ')}`);

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
  const expectVerdicts = ['optimal', 'suboptimal', 'wrong'];
  if (JSON.stringify(verdicts) !== JSON.stringify([...expectVerdicts].sort())) {
    fail(`${where}: verdicts must be exactly {optimal, suboptimal, wrong}, got [${verdicts}]`);
  }
  for (const o of cp.options || []) {
    if (!o.basis) fail(`${where}/${o.key}: missing basis`);
    if (o.verdict === 'optimal' && (!Array.isArray(o.sourceRef) || o.sourceRef.length === 0)) {
      fail(`${where}/${o.key}: optimal option must carry non-empty sourceRef`);
    }
    if (!o.next) fail(`${where}/${o.key}: missing next`);
  }
  if (!cp.rewards?.optimal) fail(`${where}: missing rewards.optimal`);
  if (!cp.onWrong) fail(`${where}: missing onWrong`);
}

// ── 4. KP accepted status + no out-of-list references ───────────────
const kpStatus = {};
for (const kp of EXPECTED.knowledgePoints) {
  try {
    const card = JSON.parse(readFileSync(path.join(ROOT, `database/knowledge/${kp.toLowerCase()}.json`), 'utf-8'));
    kpStatus[kp] = card.status;
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

// ── 5. Point accounting ─────────────────────────────────────────────
// 好感 semantics: MAX obtainable, not sum — ch2 has mutually-exclusive +1 options
// (act-3 次序洞察 two of three; act-6.4 both). Per choice node take max option favor.
const tmLingli = teachMoments.reduce((s, n) => s + (n.lingli || 0), 0);
const cpLingli = scoredChoices.reduce((s, n) => s + (n.rewards?.optimal?.lingli || 0), 0);
const endNode = chapterEnds.length === 1 ? nodes[chapterEnds[0]] : null;
const clearLingli = endNode?.rewards?.lingli || 0;

let favorTotal = 0;
for (const node of Object.values(nodes)) {
  if (node.options) {
    favorTotal += Math.max(0, ...node.options.map((o) => o.effects?.favor || 0));
  }
  if (node.effects?.favor) favorTotal += node.effects.favor;
  if (node.type === 'scoredChoice') favorTotal += node.rewards?.optimal?.favor || 0;
}

if (todoNodes.length === 0) {
  if (tmLingli !== EXPECTED.teachMomentLingli) fail(`teachMoment 灵力 sum ${tmLingli} ≠ ${EXPECTED.teachMomentLingli}`);
  if (cpLingli !== EXPECTED.cpMasteryLingli) fail(`CP mastery 灵力 sum ${cpLingli} ≠ ${EXPECTED.cpMasteryLingli}`);
  if (clearLingli !== EXPECTED.chapterClearLingli) fail(`chapter clear 灵力 ${clearLingli} ≠ ${EXPECTED.chapterClearLingli}`);
  if (tmLingli + cpLingli + clearLingli !== EXPECTED.totalLingli) fail(`total 灵力 ≠ ${EXPECTED.totalLingli}`);
  if (favorTotal !== EXPECTED.totalFavor) fail(`total 好感 (max-obtainable) ${favorTotal} ≠ ${EXPECTED.totalFavor}`);
  for (const kp of EXPECTED.knowledgePoints) {
    const stages = new Set(teachMoments.filter((t) => t.kpId === kp).map((t) => t.stage));
    const testedByCp = scoredChoices.some((c) => (c.testsKp || []).includes(kp));
    if (!stages.has('demo')) fail(`${kp}: missing demo teach moment`);
    if (!stages.has('guided')) fail(`${kp}: missing guided teach moment`);
    if (!stages.has('independent') && !testedByCp) fail(`${kp}: no independent application (neither teachMoment nor CP)`);
  }
} else {
  warn(`accounting checks deferred (transcription incomplete): 灵力 tm=${tmLingli} cp=${cpLingli} clear=${clearLingli}, 好感=${favorTotal}`);
}

// ── 6. Template variables & variants ────────────────────────────────
const varPattern = /\{\{([^}]+)\}\}/g;
const collectTexts = (node) => {
  const texts = [];
  for (const f of ['text', 'aside', 'prompt', 'context']) if (typeof node[f] === 'string') texts.push(node[f]);
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

// ── 7. Fixed cast sequence + engine verification ────────────────────
if (JSON.stringify(CHAPTER_2.fixedCase?.throws) !== JSON.stringify(EXPECTED.fixedThrows)) {
  fail(`fixedCase.throws ≠ engine-verified [${EXPECTED.fixedThrows}]`);
}
const casts = ids.filter((id) => nodes[id].type === 'castInteraction').map((id) => nodes[id]);
for (const c of casts) {
  if (c.mode === 'fixed' && JSON.stringify(c.throws) !== JSON.stringify(EXPECTED.fixedThrows)) {
    fail(`castInteraction ${c.castId}: fixed throws ≠ [${EXPECTED.fixedThrows}]`);
  }
  if (c.mode === 'random' && !c.saveAs) fail(`castInteraction ${c.castId}: random cast must declare saveAs`);
}

// Engine ground truth for the case cast (palace facts are date-independent).
const engine = paipan(EXPECTED.fixedThrows, { year: 2026, month: 1, day: 1, hour: 0, minute: 0 });
if (engine.benGua.name !== '地火明夷') fail(`engine says fixed throws = ${engine.benGua.name}, script expects 地火明夷`);
if (engine.benGua.palace !== '坎宫' || engine.benGua.guaType !== '游魂') {
  fail(`engine palace mismatch: ${engine.benGua.palace}/${engine.benGua.guaType}, expected 坎宫/游魂`);
}
if (engine.movingLines.length !== 0) fail(`case cast must be 六爻安静, engine reports moving lines [${engine.movingLines}]`);
const worldLine = engine.lines.find((l) => l.isWorld)?.position;
const respLine = engine.lines.find((l) => l.isResponse)?.position;
if (worldLine !== 4 || respLine !== 1) fail(`engine 世/应 = ${worldLine}/${respLine}, expected 4/1`);

// ── 8. Dressing (装卦盘) data vs engine tables ──────────────────────
const dressings = ids.filter((id) => nodes[id].type === 'dressingUpdate').map((id) => ({ id, node: nodes[id] }));
const expectBranch = (pos) => {
  // 明夷: inner 离 / outer 坤 — per NAJIA table, bottom-up
  const inner = NAJIA['离'].inner, outer = NAJIA['坤'].outer;
  return pos <= 3 ? inner[pos - 1] : outer[pos - 4];
};
let sawClear = false;
let maxRevealed = 0;
for (const { id, node } of dressings) {
  const b = node.board;
  if (b === null || b === undefined) { sawClear = true; continue; }
  if (JSON.stringify(b.throws) !== JSON.stringify(EXPECTED.fixedThrows)) {
    fail(`${id}: board.throws ≠ case throws`);
  }
  for (const r of b.revealed || []) {
    const want = expectBranch(r.pos);
    if (r.branch !== want) fail(`${id}: pos ${r.pos} branch ${r.branch} ≠ engine NAJIA ${want}`);
    const wantWx = WUXING_CN[BRANCH_WUXING[r.branch]];
    if (r.wuxing !== wantWx) fail(`${id}: pos ${r.pos} wuxing ${r.wuxing} ≠ ${wantWx}`);
  }
  if ((b.revealed || []).length < maxRevealed) {
    fail(`${id}: revealed count regressed (${(b.revealed || []).length} < ${maxRevealed}) — boards must be cumulative`);
  }
  maxRevealed = Math.max(maxRevealed, (b.revealed || []).length);
  if (b.marks) {
    if (b.marks.world !== 4 || b.marks.response !== 1) {
      fail(`${id}: marks 世/应 ${b.marks.world}/${b.marks.response} ≠ engine 4/1`);
    }
  }
}
if (todoNodes.length === 0 && dressings.length > 0) {
  if (maxRevealed !== 6) fail(`dressing never reaches full 6-line reveal (max ${maxRevealed})`);
  if (!dressings.some(({ node }) => node.board?.marks)) fail(`no dressingUpdate carries 世应 marks`);
  if (!sawClear) fail(`no dressingUpdate clears the board (board: null) before chapter end`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`Chapter 2 script-data audit — ${new Date().toISOString().slice(0, 10)}`);
console.log(`nodes: ${ids.length} | reachable: ${reachable.size} | scoredChoice: ${scoredChoices.length} | teachMoment: ${teachMoments.length} | cast: ${casts.length} | dressingUpdate: ${dressings.length}`);
console.log(`KP status: ${Object.entries(kpStatus).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(`账目: 灵力 tm=${tmLingli}+cp=${cpLingli}+clear=${clearLingli}=${tmLingli + cpLingli + clearLingli} | 好感(max)=${favorTotal}`);
for (const w of warnings) console.log(`⚠️  ${w}`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\n✓ all checks passed${warnings.length ? ' (with warnings)' : ''}`);
