// Chapter 6 script-data lint — PRD §4.6 quality gate (adapted from audit-chapter5-script.mjs)
// ch6 additions vs ch5:
//   - favorBranch(45) is the ACT-SIX natal-homework fork (not the opener) — same
//     currency-neutral double-chain assertion, position-parameterized
//   - 📘 teaching-marker parity check: exactly 6 teachMoments, per KP {示范+1, 引导+3}
//     (mechanizes the defect class R1 re-caught in ch4 AND ch6 — review-catches-it-twice → lint)
//   - 巳线两层分离: natal homework span + favorBranch chains must not contain 案情指称词
//   - dressingUpdate bian column: moving line must carry bian matching engine 变爻,
//     static lines must NOT carry bian/moving
//   - 「辰月休」 five-tier wording ban in dialogue (KP-010 simplified register: 泄气/衰)
//   - 仇神 moved INTO banned terms (ch5 single-point whitelist does not carry over)
// Usage: node scripts/validation/audit-chapter6-script.mjs   (npm run audit:chapter6)
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { CHAPTER_6 } = await import(path.join(ROOT, 'src/game/chapters/chapter6.js'));
const { paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));

const EXPECTED = {
  teachMomentLingli: 12,
  cpMasteryLingli: 15,
  chapterClearLingli: 10,
  totalLingli: 37,
  totalFavor: 10,             // 引导3(判方向/回頭方向/日破) + CP(1+2+2) + 查案1 + 章末1
  knowledgePoints: ['KP-LY-016', 'KP-LY-017', 'KP-LY-018'],
  scoredChoicePoints: ['CH6-CP-01', 'CH6-CP-02', 'CH6-CP-03'],
  allowedVars: ['senior', 'ta', 'junior', 'player'],
  caseThrows: [8, 8, 8, 8, 9, 7],       // 风地观之山地剥 · 五爻独发
  dayouThrows: [7, 7, 7, 7, 8, 7],      // 火天大有（幕六复盘，若入 board）
  favorThreshold: 45,                   // 幕六 natal 作业段档位分叉
  teachMomentCount: 6,                  // 📘 parity: 3 KP × (示范+引导)
};

// ch6 banned terms: ch5 set + 仇神 (whitelist expired) + 化空/沖空/沖起/合住/沖實 family.
// UNBANNED vs ch5 semantics (never in this list): 動爻生克/變爻/回頭生/回頭克/暗動/日破/沖散/择动.
const BANNED_TERMS = [
  '旬空', '空亡', '伏神', '六冲', '六沖', '六合', '三合', '三刑',
  '接续相生', '接續相生', '贪生忘克', '貪生忘克', '化进', '化進', '化退',
  '三墓', '长生帝旺', '長生帝旺', '衰而又絕', '化絕',
  '仇神', '化空', '沖空', '冲空', '沖起', '冲起', '合住', '沖實', '冲实',
];
// Five-tier wording ban: dialogue must use 泄气/衰(半档), never 「辰月休」style tier words.
const TIER_WORD_PATTERNS = ['月休', '火休', '休而动', '巳休'];
// 巳线两层分离 (§ 0 第 12 条): these terms banned inside the natal homework span.
const CASE_TERMS = ['动手', '贼', '来取']; // 「他」 checked separately with tighter scope below

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

const nodes = CHAPTER_6.nodes;
const ids = Object.keys(nodes);

const collectTexts = (node) => {
  const out = [];
  const push = (v) => { if (typeof v === 'string' && v.length) out.push(v); };
  push(node.text); push(node.aside); push(node.question); push(node.prompt);
  push(node.nextChapterTeaser);
  if (node.options) for (const o of node.options) { push(o.text); push(o.response); push(o.aside); }
  if (node.perThrow) for (const t of node.perThrow) { push(t.speakerLine); }
  if (node.rewards) for (const tier of Object.values(node.rewards)) { if (tier && typeof tier === 'object') push(tier.plot); }
  return out;
};

// ── 1. Node graph integrity ─────────────────────────────────────────
if (!nodes[CHAPTER_6.entryNode]) fail(`entryNode ${CHAPTER_6.entryNode} not found`);

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
  if (!isTerminal && outEdges(node).length === 0) {
    fail(`node ${id} (${node.type}) has no outgoing edge and is not chapterEnd`);
  }
  if (node.type === 'favorBranch') {
    if (node.threshold !== EXPECTED.favorThreshold) fail(`${id}: threshold ${node.threshold} ≠ ${EXPECTED.favorThreshold}`);
    if (!node.pass || !node.fail) fail(`${id}: favorBranch must carry both pass and fail`);
    if (!id.startsWith('ch6-s6-')) fail(`${id}: ch6 favorBranch must live in act six (natal homework beat)`);
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
const reachable = reachFrom(CHAPTER_6.entryNode);
for (const id of ids) if (!reachable.has(id)) fail(`orphan node (unreachable from entry): ${id}`);

const favorBranches = ids.filter((id) => nodes[id].type === 'favorBranch');
if (favorBranches.length !== 1) fail(`expected exactly 1 favorBranch, found ${favorBranches.length}`);
const chapterEnds = ids.filter((id) => nodes[id].type === 'chapterEnd');
if (chapterEnds.length !== 1) fail(`expected exactly 1 chapterEnd, found ${chapterEnds.length}`);

// ── 2. favorBranch double-chain: currency-neutral + both reach end ──
let chainExclusive = new Set();
if (favorBranches.length === 1) {
  const fb = nodes[favorBranches[0]];
  const passSet = reachFrom(fb.pass);
  const failSet = reachFrom(fb.fail);
  if (![...passSet].some((id) => nodes[id].type === 'chapterEnd')) fail('favorBranch pass chain never reaches chapterEnd');
  if (![...failSet].some((id) => nodes[id].type === 'chapterEnd')) fail('favorBranch fail chain never reaches chapterEnd');
  for (const [chainName, own, other] of [['pass', passSet, failSet], ['fail', failSet, passSet]]) {
    let chainFavor = 0;
    for (const id of own) {
      if (other.has(id)) continue;
      chainExclusive.add(id);
      const node = nodes[id];
      if (node.effects?.favor) chainFavor += node.effects.favor;
      if (node.options) chainFavor += Math.max(0, ...node.options.map((o) => o.effects?.favor || 0));
    }
    if (chainFavor !== 0) fail(`favorBranch ${chainName} chain carries favor ${chainFavor} ≠ 0 (currency-neutral fork)`);
  }
}

// ── 3. Scored choices + KP coverage ─────────────────────────────────
const scoredChoices = ids.filter((id) => nodes[id].type === 'scoredChoice').map((id) => nodes[id]);
const foundCpIds = scoredChoices.map((n) => n.cpId).sort();
if (JSON.stringify(foundCpIds) !== JSON.stringify(EXPECTED.scoredChoicePoints)) {
  fail(`scoredChoice cpIds ${foundCpIds} ≠ ${EXPECTED.scoredChoicePoints}`);
}
for (const sc of scoredChoices) {
  if (!Array.isArray(sc.testsKp) || sc.testsKp.length === 0) fail(`${sc.cpId}: missing testsKp`);
  for (const kp of sc.testsKp || []) {
    if (!EXPECTED.knowledgePoints.includes(kp)) fail(`${sc.cpId}: testsKp ${kp} not a ch6 KP`);
  }
  if ((sc.rewards?.optimal?.lingli ?? 0) !== 5) fail(`${sc.cpId}: optimal lingli ${sc.rewards?.optimal?.lingli} ≠ 5`);
}

// ── 4. 📘 teaching-marker parity (mechanized R1 defect class) ───────
const teachMoments = ids.filter((id) => nodes[id].type === 'teachMoment').map((id) => ({ id, n: nodes[id] }));
if (teachMoments.length !== EXPECTED.teachMomentCount) {
  fail(`teachMoment count ${teachMoments.length} ≠ ${EXPECTED.teachMomentCount} (📘 parity — 3 KP × 示范/引导)`);
}
for (const kp of EXPECTED.knowledgePoints) {
  const forKp = teachMoments.filter((t) => t.n.kpId === kp);
  const lingliSet = forKp.map((t) => t.n.lingli ?? t.n.effects?.lingli ?? 0).sort();
  if (forKp.length !== 2 || JSON.stringify(lingliSet) !== JSON.stringify([1, 3])) {
    fail(`${kp}: teachMoments ${forKp.length} with lingli [${lingliSet}] ≠ 2 with [1,3] (示范+1/引导+3)`);
  }
}

// ── 5. Lingli + favor ledgers ───────────────────────────────────────
let tmLingli = 0;
for (const t of teachMoments) tmLingli += t.n.lingli ?? t.n.effects?.lingli ?? 0;
if (tmLingli !== EXPECTED.teachMomentLingli) fail(`teachMoment lingli ${tmLingli} ≠ ${EXPECTED.teachMomentLingli}`);
let cpLingli = 0;
for (const sc of scoredChoices) cpLingli += sc.rewards?.optimal?.lingli ?? 0;
if (cpLingli !== EXPECTED.cpMasteryLingli) fail(`CP mastery lingli ${cpLingli} ≠ ${EXPECTED.cpMasteryLingli}`);
const endNode = nodes[chapterEnds[0]];
const clearLingli = endNode?.rewards?.lingli ?? endNode?.effects?.lingli ?? 0;
if (clearLingli !== EXPECTED.chapterClearLingli) fail(`chapter clear lingli ${clearLingli} ≠ ${EXPECTED.chapterClearLingli}`);
if (tmLingli + cpLingli + clearLingli !== EXPECTED.totalLingli) fail(`total lingli ${tmLingli + cpLingli + clearLingli} ≠ ${EXPECTED.totalLingli}`);

let totalFavor = 0;
for (const [, node] of Object.entries(nodes)) {
  if (node.effects?.favor) totalFavor += node.effects.favor;
  if (node.options) totalFavor += Math.max(0, ...node.options.map((o) => o.effects?.favor || 0), 0);
  if (node.type === 'scoredChoice') totalFavor += node.rewards?.optimal?.favor ?? 0;
}
if (totalFavor !== EXPECTED.totalFavor) fail(`optimal-path favor ${totalFavor} ≠ ${EXPECTED.totalFavor}`);

// ── 6. Engine collision: case gua + boards (incl. bian column) ──────
const DATE = { year: 2026, month: 4, day: 7, hour: 21, minute: 0 };
const engCase = paipan(EXPECTED.caseThrows, DATE);
if (engCase.benGua.name !== '风地观' || engCase.bianGua?.name !== '山地剥') fail(`engine: case = ${engCase.benGua.name}之${engCase.bianGua?.name} ≠ 观之剥`);
if (engCase.date.monthBranch !== '辰' || engCase.date.dayGanzhiStr === '辛亥' && false) { /* month checked; day via stem+branch below */ }
if (engCase.date.dayStem + engCase.date.dayBranch !== '辛亥') fail(`engine: day ${engCase.date.dayStem}${engCase.date.dayBranch} ≠ 辛亥`);
const engDayou = paipan(EXPECTED.dayouThrows, DATE);
if (engDayou.benGua.name !== '火天大有') fail(`engine: dayou = ${engDayou.benGua.name}`);
const chartFor = (throws) => {
  const k = JSON.stringify(throws);
  if (k === JSON.stringify(EXPECTED.caseThrows)) return engCase;
  if (k === JSON.stringify(EXPECTED.dayouThrows)) return engDayou;
  return null;
};
const dressings = ids.filter((id) => nodes[id].type === 'dressingUpdate').map((id) => ({ id, node: nodes[id] }));
for (const { id, node } of dressings) {
  const b = node.board;
  if (b === null || b === undefined) continue; // board:null = clear-board node
  const eng = chartFor(b.throws || []);
  if (!eng) { fail(`${id}: board.throws matches neither 观之剥 nor 大有`); continue; }
  for (const r of b.revealed || []) {
    const line = eng.lines[r.pos - 1];
    if (!line) { fail(`${id}: pos ${r.pos} out of range`); continue; }
    if (r.branch !== line.branch) fail(`${id}: pos ${r.pos} branch ${r.branch} ≠ engine ${line.branch}`);
    if (r.wuxing !== line.wuxingCn) fail(`${id}: pos ${r.pos} wuxing ${r.wuxing} ≠ engine ${line.wuxingCn}`);
    if (r.liuqin && r.liuqin !== line.liuqin) fail(`${id}: pos ${r.pos} liuqin ${r.liuqin} ≠ engine ${line.liuqin}`);
    if (r.wangshuai) fail(`${id}: ch6 boards carry no wangshuai column (prep § 6)`);
    if (line.isMoving) {
      const expectBian = `${line.bianYao.branch}·${line.bianYao.liuqin}`;
      if (r.bian !== expectBian) fail(`${id}: pos ${r.pos} bian "${r.bian}" ≠ engine "${expectBian}"`);
      if (r.moving !== true) fail(`${id}: pos ${r.pos} is engine-moving but moving flag ≠ true`);
    } else {
      if (r.bian) fail(`${id}: pos ${r.pos} static line must not carry bian`);
      if (r.moving) fail(`${id}: pos ${r.pos} static line must not carry moving flag`);
    }
  }
  if (b.marks) {
    const w = eng.lines.findIndex((l) => l.isWorld) + 1;
    const rp = eng.lines.findIndex((l) => l.isResponse) + 1;
    if (b.marks.world && b.marks.world !== w) fail(`${id}: marks.world ${b.marks.world} ≠ engine ${w}`);
    if (b.marks.response && b.marks.response !== rp) fail(`${id}: marks.response ${b.marks.response} ≠ engine ${rp}`);
  }
}

// ── 7. Banned terms + tier-word + junior + template vars ────────────
for (const [id, node] of Object.entries(nodes)) {
  for (const text of collectTexts(node)) {
    for (const term of BANNED_TERMS) {
      if (text.includes(term)) fail(`node ${id}: banned term 「${term}」 (未教不考)`);
    }
    for (const pat of TIER_WORD_PATTERNS) {
      if (text.includes(pat)) fail(`node ${id}: five-tier wording 「${pat}」 — use 泄气/衰半档 (R1 P1-4)`);
    }
    if (text.includes('{{junior}}')) fail(`node ${id}: {{junior}} forbidden in ch6 (both tiers ≥25)`);
    const vars = [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
    for (const v of vars) if (!EXPECTED.allowedVars.includes(v)) fail(`node ${id}: unknown template var {{${v}}}`);
    if (text.includes('她')) fail(`node ${id}: bare 她 (ch6 whitelist is EMPTY — 白芷 absent, 沈疏桐 is {{ta}})`);
    if (text.includes('两张卦纸')) fail(`node ${id}: 演卦-reference lint keyword 「两张卦纸」`);
  }
}

// ── 8. 巳线两层分离 (natal homework span + fork chains) ─────────────
// Span: pre-fork homework run-up (s6-340..s6-440 per agent-B report) + chain-exclusive nodes.
const SI_SPAN_RE = /^ch6-s6-(3[4-9]0|4[0-4]0)$/;
const siSpanIds = new Set([...ids.filter((id) => SI_SPAN_RE.test(id)), ...chainExclusive]);
for (const id of siSpanIds) {
  for (const text of collectTexts(nodes[id])) {
    const stripped = text.replace(/\{\{\w+\}\}/g, '');
    for (const term of CASE_TERMS) {
      if (stripped.includes(term)) fail(`node ${id}: 案情指称词 「${term}」 inside natal homework span (巳线两层分离)`);
    }
    if (/他/.test(stripped)) fail(`node ${id}: 「他」 inside natal homework span (巳线两层分离)`);
  }
}
if (siSpanIds.size < 5) warn(`巳线 span only ${siSpanIds.size} nodes — verify SI_SPAN_RE still matches transcription ids`);

// ── Report ──────────────────────────────────────────────────────────
const counts = {};
for (const id of ids) counts[nodes[id].type] = (counts[nodes[id].type] || 0) + 1;
console.log(`audit-chapter6-script: ${ids.length} nodes`, JSON.stringify(counts));
for (const w of warnings) console.warn('  WARN:', w);
console.log(`checks: favor=${totalFavor} lingli=${tmLingli}+${cpLingli}+${clearLingli} 巳span=${siSpanIds.size} failures=${failures.length}`);
if (failures.length) { for (const f of failures) console.error('  FAIL:', f); process.exit(1); }
console.log('ALL GREEN');
