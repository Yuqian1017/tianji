// Chapter 3 script-data lint — PRD §4.6 quality gate (adapted from audit-chapter2-script.mjs)
// ch3 additions: favorBranch routing edges + fail-branch favor exclusion (optimal-path
// max semantics), dual dressing charts (明夷 re-read with liuqin / 山地剥 full dress),
// liuqin cross-check against engine getLiuqin output.
// Usage: node scripts/validation/audit-chapter3-script.mjs   (npm run audit:chapter3)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { CHAPTER_3 } = await import(path.join(ROOT, 'src/game/chapters/chapter3.js'));
const { paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));

const EXPECTED = {
  teachMomentLingli: 12,
  cpMasteryLingli: 15,
  chapterClearLingli: 10,
  totalLingli: 37,
  totalFavor: 10,             // optimal-path max: 引导3 + CP(1+2+2) + 走访1 + 章末1(pass链)
  knowledgePoints: ['KP-LY-007', 'KP-LY-008', 'KP-LY-009'],
  scoredChoicePoints: ['CH3-CP-01', 'CH3-CP-02', 'CH3-CP-03'],
  allowedVars: ['senior', 'ta', 'junior', 'player'],
  caseThrows: [8, 8, 8, 8, 8, 7],       // 山地剥 · 六爻安静
  rereadThrows: [7, 8, 7, 8, 8, 8],     // 地火明夷 (ch2 案卦复盘)
  favorThreshold: 25,
};

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const nodes = CHAPTER_3.nodes;
const ids = Object.keys(nodes);

// ── 1. Node graph integrity (cast interleave + favorBranch edges) ────
if (!nodes[CHAPTER_3.entryNode]) fail(`entryNode ${CHAPTER_3.entryNode} not found`);

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
const reachable = reachFrom(CHAPTER_3.entryNode);
for (const id of ids) if (!reachable.has(id)) fail(`orphan node (unreachable from entry): ${id}`);

// fail-exclusive chain (nodes only reachable via favorBranch.fail) — excluded from
// optimal-path favor max. Both chains must converge to the same chapterEnd.
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

// ── 5. Point accounting (favor = optimal-path max: fail-exclusive chain excluded) ──
const tmLingli = teachMoments.reduce((s, n) => s + (n.lingli || 0), 0);
const cpLingli = scoredChoices.reduce((s, n) => s + (n.rewards?.optimal?.lingli || 0), 0);
const endNode = chapterEnds.length === 1 ? nodes[chapterEnds[0]] : null;
const clearLingli = endNode?.rewards?.lingli || 0;

let favorTotal = 0;
for (const [id, node] of Object.entries(nodes)) {
  if (failExclusive.has(id)) continue; // optimal player rides the pass chain
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

// ── 7. Fixed cast + engine ground truth (both charts) ───────────────
if (JSON.stringify(CHAPTER_3.fixedCase?.throws) !== JSON.stringify(EXPECTED.caseThrows)) {
  fail(`fixedCase.throws ≠ engine-verified [${EXPECTED.caseThrows}]`);
}
const casts = ids.filter((id) => nodes[id].type === 'castInteraction').map((id) => nodes[id]);
for (const c of casts) {
  if (c.mode === 'fixed' && JSON.stringify(c.throws) !== JSON.stringify(EXPECTED.caseThrows)) {
    fail(`castInteraction ${c.castId}: fixed throws ≠ [${EXPECTED.caseThrows}]`);
  }
}

const DATE = { year: 2026, month: 1, day: 1, hour: 0, minute: 0 }; // palace facts are date-independent
const engBo = paipan(EXPECTED.caseThrows, DATE);
if (engBo.benGua.name !== '山地剥') fail(`engine: case throws = ${engBo.benGua.name}, expected 山地剥`);
if (engBo.benGua.palace !== '乾宫' || engBo.benGua.guaType !== '五世') fail(`engine: 剥 palace ${engBo.benGua.palace}/${engBo.benGua.guaType} ≠ 乾宫/五世`);
if (engBo.movingLines.length !== 0) fail(`剥 must be 六爻安静, engine reports [${engBo.movingLines}]`);
const engMy = paipan(EXPECTED.rereadThrows, DATE);
if (engMy.benGua.name !== '地火明夷') fail(`engine: reread throws = ${engMy.benGua.name}, expected 地火明夷`);
const chartFor = (throws) => {
  if (JSON.stringify(throws) === JSON.stringify(EXPECTED.caseThrows)) return engBo;
  if (JSON.stringify(throws) === JSON.stringify(EXPECTED.rereadThrows)) return engMy;
  return null;
};

// ── 8. Dressing boards vs engine (branch + wuxing + liuqin + marks) ──
const dressings = ids.filter((id) => nodes[id].type === 'dressingUpdate').map((id) => ({ id, node: nodes[id] }));
let sawClear = false;
const maxRevealedByChart = new Map();
const maxLiuqinByChart = new Map();
for (const { id, node } of dressings) {
  const b = node.board;
  if (b === null || b === undefined) { sawClear = true; continue; }
  const eng = chartFor(b.throws || []);
  if (!eng) { fail(`${id}: board.throws matches neither case nor reread chart`); continue; }
  const key = eng.benGua.name;
  for (const r of b.revealed || []) {
    const line = eng.lines[r.pos - 1];
    if (!line) { fail(`${id}: pos ${r.pos} out of range`); continue; }
    if (r.branch !== line.branch) fail(`${id}: pos ${r.pos} branch ${r.branch} ≠ engine ${line.branch}`);
    if (r.wuxing !== line.wuxingCn) fail(`${id}: pos ${r.pos} wuxing ${r.wuxing} ≠ engine ${line.wuxingCn}`);
    if (r.liuqin && r.liuqin !== line.liuqin) fail(`${id}: pos ${r.pos} liuqin ${r.liuqin} ≠ engine ${line.liuqin}`);
  }
  const revealedCount = (b.revealed || []).length;
  const liuqinCount = (b.revealed || []).filter((r) => r.liuqin).length;
  if (revealedCount < (maxRevealedByChart.get(key) || 0)) fail(`${id}: revealed count regressed for ${key} — boards must be cumulative`);
  if (liuqinCount < (maxLiuqinByChart.get(key) || 0)) fail(`${id}: liuqin count regressed for ${key} — boards must be cumulative`);
  maxRevealedByChart.set(key, Math.max(maxRevealedByChart.get(key) || 0, revealedCount));
  maxLiuqinByChart.set(key, Math.max(maxLiuqinByChart.get(key) || 0, liuqinCount));
  if (b.marks) {
    const w = eng.lines.find((l) => l.isWorld)?.position;
    const r = eng.lines.find((l) => l.isResponse)?.position;
    if (b.marks.world !== w || b.marks.response !== r) {
      fail(`${id}: marks 世/应 ${b.marks.world}/${b.marks.response} ≠ engine ${w}/${r} (${key})`);
    }
  }
}
if (todoNodes.length === 0 && dressings.length > 0) {
  for (const [key, n] of maxLiuqinByChart) {
    if (n !== 6) fail(`${key}: liuqin never reaches full 6-line reveal (max ${n})`);
  }
  if (!sawClear) fail(`no dressingUpdate clears the board before chapter end`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`Chapter 3 script-data audit — ${new Date().toISOString().slice(0, 10)}`);
console.log(`nodes: ${ids.length} | reachable: ${reachable.size} | scoredChoice: ${scoredChoices.length} | teachMoment: ${teachMoments.length} | cast: ${casts.length} | dressingUpdate: ${dressings.length} | favorBranch: ${favorBranches.length} (fail-exclusive ${failExclusive.size})`);
console.log(`KP status: ${Object.entries(kpStatus).map(([k, v]) => `${k}=${v}`).join(' ')}`);
console.log(`账目: 灵力 tm=${tmLingli}+cp=${cpLingli}+clear=${clearLingli}=${tmLingli + cpLingli + clearLingli} | 好感(optimal-max)=${favorTotal}`);
for (const w of warnings) console.log(`⚠️  ${w}`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\n✓ all checks passed${warnings.length ? ' (with warnings)' : ''}`);
