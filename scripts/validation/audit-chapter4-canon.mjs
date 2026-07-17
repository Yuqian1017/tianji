// Chapter 4 canon audit — 跟随制审计第四批（旺衰·四處生克沖合）
// Three layers, all re-runnable (红线 #10 引用必 grep 的程序化落实):
//   1. Witness fidelity: every passage.text in wangshuai-sichu-2026-07-17.json must
//      byte-match the fresh extraction of zengshanbuyi-wiki-950329-2026-07-12.html
//      (same line-numbering convention as liuqin-sanjian-2026-07-13.json).
//   2. Engine cross-check: 原文 12-branch enumerations (月建 l.567 / 日辰 l.571,
//      世爻戌土) vs wuxingRelation + BRANCH_RELATIONS.liuchong/liuhe; 乾为天 worked
//      example (l.549-561) vs PURE_GUA_LIUQIN + JINGFANG world/response.
//   3. KP-card chain: kp-ly-010/011/012 canonicalTexts.text must be substrings of
//      the witness passage they cite (missing cards fail until created).
// Usage: node scripts/validation/audit-chapter4-canon.mjs   (npm run audit:chapter4-canon)
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { wuxingRelation } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));
const { PURE_GUA_LIUQIN, JINGFANG, BRANCH_WUXING } = await import(path.join(ROOT, 'src/modules/liuyao/data.js'));
const baziData = await import(path.join(ROOT, 'src/modules/bazi/data.js'));
const BRANCH_RELATIONS = baziData.BRANCH_RELATIONS;

const failures = [];
let checks = 0;
const fail = (msg) => failures.push(msg);
const ok = () => { checks += 1; };
const assert = (cond, msg) => { checks += 1; if (!cond) failures.push(msg); };

// ── Layer 1: witness fidelity vs fresh extraction ────────────────────
const HTML = path.join(ROOT, 'database/sources/ctext/zengshanbuyi-wiki-950329-2026-07-12.html');
const WITNESS = path.join(ROOT, 'database/sources/ctext/wangshuai-sichu-2026-07-17.json');

// Extraction convention (= liuqin-sanjian-2026-07-13.json lineLocator 口径):
// strip <script>/<style>, tags→newline, per-line trim, drop blank lines, drop
// leading title line; 1-based line numbers thereafter.
function extractLines(htmlPath) {
  let h = readFileSync(htmlPath, 'utf-8');
  h = h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  h = h.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  const text = h.replace(/<[^>]+>/g, '\n');
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  return lines.slice(1); // drop title line
}
const lines = extractLines(HTML);
const L = (n) => lines[n - 1] ?? '';
const joinRange = (a, b) => {
  const parts = [];
  for (let n = a; n <= b; n += 1) {
    const t = L(n);
    if (/^\d+$/.test(t)) continue; // ctext page-number noise lines
    parts.push(t);
  }
  return parts.join('／');
};

// Calibration anchors (known from ch3 witness) — extraction convention guard.
assert(L(545).includes('須要先念渾天甲子'), 'calibration: l.545 渾天甲子 anchor lost — extraction convention drifted');
assert(L(565) === '1、月建能生克沖合', `calibration: l.565 ≠ 月建 heading (got "${L(565).slice(0, 20)}")`);
assert(L(569) === '2、日辰能生克沖合', `calibration: l.569 ≠ 日辰 heading (got "${L(569).slice(0, 20)}")`);
assert(L(741).includes('占天地、城池'), 'calibration: l.741 用神章父母爻 anchor lost');
assert(L(817).includes('五行相生章第十一'), 'calibration: l.817 五行相生章 anchor lost');

const witness = JSON.parse(readFileSync(WITNESS, 'utf-8'));
const passages = witness.pages['zengshanbuyi-950329'].passages;

for (const [name, p] of Object.entries(passages)) {
  const loc = String(p.lineLocator);
  let expected;
  if (loc.includes('-')) {
    const [a, b] = loc.split('-').map(Number);
    expected = joinRange(a, b);
  } else {
    expected = L(Number(loc));
  }
  if (p.textIsExcerpt) {
    assert(expected.includes(p.text), `witness passage "${name}": excerpt text not found verbatim inside extraction line(s) ${loc}`);
  } else {
    assert(p.text === expected, `witness passage "${name}": text ≠ fresh extraction of line(s) ${loc}`);
  }
}

// ── Layer 2a: 月建 12-branch enumeration (l.567, 世爻戌土) ───────────
// 原文 groups → engine expectation, viewed FROM the 用神 (戌土):
//   寅卯月 傷克/休囚不利  → wuxingRelation(earth, wood)  = restricted_by (克我)
//   辰月   沖=月破        → 辰戌 ∈ liuchong (冲 takes precedence over same-earth 幫扶)
//   巳午月 生=火旺土相    → generated_by (生我)
//   未丑月 幫扶=旺相      → same (同五行, 非冲)
//   戌月   臨月建=當時    → same branch (临)
//   申酉月 泄气休囚       → generate (我生 = 泄)
//   亥子月 泄气休囚       → restrict (我克 = 耗; 原文并称「泄气之時」)
// 日辰 (l.571) mirrors the same facts:辰日=暗動, 戌日=當令得權, 申酉亥子日
// 原文作「無克無生」= 受向描述 (nothing acts ON 戌) — same engine facts.
const YONG = '戌';
const yongWx = BRANCH_WUXING[YONG];
assert(yongWx === 'earth', `BRANCH_WUXING[戌] = ${yongWx} ≠ earth`);

const clashSet = new Set();
for (const { pair } of BRANCH_RELATIONS.liuchong) clashSet.add(pair.slice().sort().join(''));
const heSet = new Set();
for (const { pair } of BRANCH_RELATIONS.liuhe) heSet.add(pair.slice().sort().join(''));
const isClash = (a, b) => clashSet.has([a, b].sort().join(''));
const isHe = (a, b) => heSet.has([a, b].sort().join(''));

const GROUPS = [
  { branches: ['寅', '卯'], canon: '傷克（休囚不利／受日辰傷克）', expect: (b) => wuxingRelation(yongWx, BRANCH_WUXING[b]) === 'restricted_by' && !isClash(YONG, b) },
  { branches: ['辰'], canon: '沖（月建=月破／日辰=暗動）', expect: (b) => isClash(YONG, b) },
  { branches: ['巳', '午'], canon: '生（旺相／生旺）', expect: (b) => wuxingRelation(yongWx, BRANCH_WUXING[b]) === 'generated_by' && !isClash(YONG, b) },
  { branches: ['未', '丑'], canon: '幫扶（同类得助）', expect: (b) => b !== YONG && wuxingRelation(yongWx, BRANCH_WUXING[b]) === 'same' && !isClash(YONG, b) },
  { branches: ['戌'], canon: '臨（月建=當時／日建=當令得權）', expect: (b) => b === YONG },
  { branches: ['申', '酉'], canon: '泄气（月建段）／無克無生（日辰段受向）', expect: (b) => wuxingRelation(yongWx, BRANCH_WUXING[b]) === 'generate' && !isClash(YONG, b) },
  { branches: ['亥', '子'], canon: '泄耗并称泄气（月建段）／無克無生（日辰段受向）', expect: (b) => wuxingRelation(yongWx, BRANCH_WUXING[b]) === 'restrict' && !isClash(YONG, b) },
];

for (const scope of ['月建', '日辰']) {
  const seen = new Set();
  for (const g of GROUPS) {
    for (const b of g.branches) {
      seen.add(b);
      assert(g.expect(b), `${scope} ${b} vs 世爻戌土: engine relation contradicts 原文分类「${g.canon}」`);
    }
  }
  assert(seen.size === 12, `${scope} enumeration must cover all 12 branches (got ${seen.size})`);
}

// 原文 wording anchors for the two 新名目 (must appear in the cited lines):
assert(L(567).includes('戌為月破'), 'l.567 missing 月破 wording');
assert(L(571).includes('謂之世爻暗動'), 'l.571 missing 暗動 wording');
assert(L(571).includes('臨日建當令得權'), 'l.571 missing 當令得權 wording');
assert(L(567).includes('旺相以當時也'), 'l.567 missing 臨月建當時 wording');

// ── Layer 2b: 六合 (l.579 變出卯木謂之合世 / l.587 卯戌合克并存) ────
assert(isHe('卯', YONG), '卯戌 must be in BRANCH_RELATIONS.liuhe (l.579 合世)');
assert(wuxingRelation(yongWx, BRANCH_WUXING['卯']) === 'restricted_by', '卯 must also 克 戌 (l.587 合克并存)');
assert(L(579).includes('變出卯木謂之合世'), 'l.579 missing 合世 wording');
assert(L(587).includes('又與戌合'), 'l.587 missing 合克并存 wording');

// ── Layer 2c: 乾为天 worked example (l.551-561) vs engine chart ─────
// 原文爻序 top→bottom: 戌世/申/午/辰應/寅/子 → engine pos 6..1
const CANON_LINES = [
  { pos: 6, branch: '戌', liuqin: '父母', canonLine: 551 },
  { pos: 5, branch: '申', liuqin: '兄弟', canonLine: 553 },
  { pos: 4, branch: '午', liuqin: '官鬼', canonLine: 555 },
  { pos: 3, branch: '辰', liuqin: '父母', canonLine: 557 },
  { pos: 2, branch: '寅', liuqin: '妻财', canonLine: 559 },
  { pos: 1, branch: '子', liuqin: '子孙', canonLine: 561 },
];
const qianLines = PURE_GUA_LIUQIN['乾'].lines;
const LIUQIN_TRAD = { 妻财: '妻財', 子孙: '子孫', 父母: '父母', 官鬼: '官鬼', 兄弟: '兄弟' };
for (const c of CANON_LINES) {
  const e = qianLines.find((l) => l.pos === c.pos);
  assert(e && e.branch === c.branch && e.liuqin === c.liuqin,
    `乾为天 pos ${c.pos}: engine ${e?.liuqin}${e?.branch} ≠ 原文 ${c.liuqin}${c.branch}`);
  const raw = L(c.canonLine);
  assert(raw.includes(LIUQIN_TRAD[c.liuqin]) && raw.includes(c.branch),
    `l.${c.canonLine} does not contain ${c.liuqin}${c.branch} (got "${raw.slice(0, 12)}")`);
}
const qianGua = JINGFANG['乾宫'].gua.find((g) => g.name === '乾为天');
assert(qianGua.world === 6 && qianGua.response === 3, `乾为天 world/response = ${qianGua.world}/${qianGua.response} ≠ 6/3 (原文 戌世/辰應)`);

// ── Layer 3: KP-card citation chain (kp-ly-010/011/012) ─────────────
const KP_EXPECT = [
  { id: 'kp-ly-010', passage: '月建能生克沖合' },
  { id: 'kp-ly-011', passage: '日辰能生克沖合' },
  { id: 'kp-ly-012', passage: '旺衰合断' },
];
for (const { id, passage } of KP_EXPECT) {
  const kpPath = path.join(ROOT, `database/knowledge/${id}.json`);
  if (!existsSync(kpPath)) { fail(`KP card missing: database/knowledge/${id}.json`); continue; }
  const kp = JSON.parse(readFileSync(kpPath, 'utf-8'));
  assert(kp.status === 'reviewed' || kp.status === 'accepted', `${id}: status ${kp.status} not reviewed/accepted`);
  assert(Array.isArray(kp.canonicalTexts) && kp.canonicalTexts.length > 0, `${id}: no canonicalTexts`);
  const witnessTexts = Object.values(passages).map((p) => p.text);
  for (const [i, ct] of (kp.canonicalTexts || []).entries()) {
    const inWitness = witnessTexts.some((wt) => wt.includes(ct.text) || ct.text.includes(wt));
    assert(inWitness, `${id} canonicalTexts[${i}]: text not anchored in any witness passage (引用必 grep violation)`);
    assert((ct.witness || '').includes('wangshuai-sichu-2026-07-17.json'), `${id} canonicalTexts[${i}]: witness field must cite wangshuai-sichu-2026-07-17.json`);
  }
  // primary passage must be among the citations
  const primary = passages[passage].text;
  assert(kp.canonicalTexts.some((ct) => primary.includes(ct.text) || ct.text === primary),
    `${id}: none of canonicalTexts anchors to primary passage 「${passage}」`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`chapter-4 canon audit: ${checks} checks, ${failures.length} failure(s)`);
if (failures.length) {
  for (const f of failures) console.error('  ✗', f);
  process.exit(1);
}
console.log('ALL GREEN — witness fidelity + engine cross-check + KP chain verified');
