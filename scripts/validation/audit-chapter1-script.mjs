// Chapter 1 script-data lint — PRD §4.6 quality gate
// Checks: node-graph integrity, scored-choice completeness, KP accepted status,
// point accounting (灵力 37 / 好感 10), template variables, variant skeleton, transcription progress.
// Usage: node scripts/validation/audit-chapter1-script.mjs   (npm run audit:chapter1)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { CHAPTER_1 } = await import(path.join(ROOT, 'src/game/chapters/chapter1.js'));

const EXPECTED = {
  teachMomentLingli: 12,      // 见过×3 + 用过×3×3 (3 KP × (1+3))
  cpMasteryLingli: 15,        // 3 CP × +5 (掌握档统一由 CP reward 发放)
  chapterClearLingli: 10,
  totalLingli: 37,
  totalFavor: 10,             // 计分 9 + 二幕风味 1
  knowledgePoints: ['KP-LY-001', 'KP-LY-002', 'KP-LY-003'],
  scoredChoicePoints: ['CH1-CP-01', 'CH1-CP-02', 'CH1-CP-03'],
  allowedVars: ['senior', 'ta', 'junior', 'player'],
  fixedThrows: [9, 8, 7, 8, 8, 7],
};

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const nodes = CHAPTER_1.nodes;
const ids = Object.keys(nodes);

// ── 1. Node graph integrity ─────────────────────────────────────────
if (!nodes[CHAPTER_1.entryNode]) fail(`entryNode ${CHAPTER_1.entryNode} not found`);

const outEdges = (node) => {
  const edges = [];
  if (node.next !== undefined && node.next !== null) edges.push(node.next);
  if (node.options) for (const o of node.options) if (o.next) edges.push(o.next);
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

// reachability from entry
const reachable = new Set();
const stack = [CHAPTER_1.entryNode];
while (stack.length) {
  const id = stack.pop();
  if (!id || reachable.has(id) || !nodes[id]) continue;
  reachable.add(id);
  stack.push(...outEdges(nodes[id]));
}
for (const id of ids) if (!reachable.has(id)) fail(`orphan node (unreachable from entry): ${id}`);

// ── 2. Transcription progress ───────────────────────────────────────
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

// ── 4. KP accepted status (database/knowledge) ──────────────────────
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
const referencedKps = new Set([
  ...scoredChoices.flatMap((c) => c.testsKp || []),
  ...ids.filter((id) => nodes[id].type === 'teachMoment').map((id) => nodes[id].kpId),
]);
for (const kp of referencedKps) {
  if (!EXPECTED.knowledgePoints.includes(kp)) fail(`referenced KP ${kp} is outside the chapter's approved KP list`);
}

// ── 5. Point accounting ─────────────────────────────────────────────
const teachMoments = ids.filter((id) => nodes[id].type === 'teachMoment').map((id) => nodes[id]);
const tmLingli = teachMoments.reduce((s, n) => s + (n.lingli || 0), 0);
const cpLingli = scoredChoices.reduce((s, n) => s + (n.rewards?.optimal?.lingli || 0), 0);
const endNode = chapterEnds.length === 1 ? nodes[chapterEnds[0]] : null;
const clearLingli = endNode?.rewards?.lingli || 0;

let favorTotal = 0;
for (const node of Object.values(nodes)) {
  if (node.options) for (const o of node.options) favorTotal += o.effects?.favor || 0;
  if (node.effects?.favor) favorTotal += node.effects.favor;
  if (node.type === 'scoredChoice') favorTotal += node.rewards?.optimal?.favor || 0;
}

if (todoNodes.length === 0) {
  if (tmLingli !== EXPECTED.teachMomentLingli) fail(`teachMoment 灵力 sum ${tmLingli} ≠ ${EXPECTED.teachMomentLingli}`);
  if (cpLingli !== EXPECTED.cpMasteryLingli) fail(`CP mastery 灵力 sum ${cpLingli} ≠ ${EXPECTED.cpMasteryLingli}`);
  if (clearLingli !== EXPECTED.chapterClearLingli) fail(`chapter clear 灵力 ${clearLingli} ≠ ${EXPECTED.chapterClearLingli}`);
  if (tmLingli + cpLingli + clearLingli !== EXPECTED.totalLingli) fail(`total 灵力 ≠ ${EXPECTED.totalLingli}`);
  if (favorTotal !== EXPECTED.totalFavor) fail(`total 好感 ${favorTotal} ≠ ${EXPECTED.totalFavor}`);
  // teach-moment loop completeness: each KP needs demo + guided (+ independent via CP or teachMoment)
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
  for (const f of ['text', 'aside', 'prompt']) if (typeof node[f] === 'string') texts.push(node[f]);
  if (node.variants) { texts.push(node.variants.female || '', node.variants.male || ''); }
  if (node.options) for (const o of node.options) {
    if (o.text) texts.push(o.text);
    if (o.response?.text) texts.push(o.response.text);
    if (o.response?.aside) texts.push(o.response.aside);
  }
  if (node.perThrow) for (const t of node.perThrow) if (t.speakerLine) texts.push(t.speakerLine);
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

// ── 7. Fixed cast sequence ──────────────────────────────────────────
if (JSON.stringify(CHAPTER_1.fixedCase?.throws) !== JSON.stringify(EXPECTED.fixedThrows)) {
  fail(`fixedCase.throws ≠ engine-verified [${EXPECTED.fixedThrows}]`);
}
const casts = ids.filter((id) => nodes[id].type === 'castInteraction').map((id) => nodes[id]);
for (const c of casts) {
  if (c.mode === 'fixed' && JSON.stringify(c.throws) !== JSON.stringify(EXPECTED.fixedThrows)) {
    fail(`castInteraction ${c.castId}: fixed throws ≠ [${EXPECTED.fixedThrows}]`);
  }
  if (c.mode === 'random' && !c.saveAs) fail(`castInteraction ${c.castId}: random cast must declare saveAs`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`Chapter 1 script-data audit — ${new Date().toISOString().slice(0, 10)}`);
console.log(`nodes: ${ids.length} | reachable: ${reachable.size} | scoredChoice: ${scoredChoices.length} | teachMoment: ${teachMoments.length} | cast: ${casts.length}`);
console.log(`KP status: ${Object.entries(kpStatus).map(([k, v]) => `${k}=${v}`).join(' ')}`);
for (const w of warnings) console.log(`⚠️  ${w}`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\n✓ all checks passed${warnings.length ? ' (with warnings)' : ''}`);
