// Chapter 5 canon audit — 跟随制审计第五批（元神忌神·衰旺）
// Three layers (same structure as audit-chapter4-canon.mjs):
//   1. Witness fidelity: yuanji-shuaiwang-2026-07-17.json passages ↔ fresh extraction.
//   2. Engine cross-check: 元神/忌神 direction semantics on the 大有 triangle;
//      明夷 same-branch duplicate + fushen fact; 乾为天 辰戌 distinct-branch pair;
//      亥沖巳; 卯月丁亥日 direction set; period pin 2026-03-14.
//   3. KP-card chain: kp-ly-013/014/015 canonicalTexts anchored in witness.
// Usage: node scripts/validation/audit-chapter5-canon.mjs   (npm run audit:chapter5-canon)
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { wuxingRelation, paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));
const { BRANCH_WUXING } = await import(path.join(ROOT, 'src/modules/liuyao/data.js'));
const baziData = await import(path.join(ROOT, 'src/modules/bazi/data.js'));

const failures = [];
let checks = 0;
const assert = (cond, msg) => { checks += 1; if (!cond) failures.push(msg); };

// ── Layer 1: witness fidelity ───────────────────────────────────────
const HTML = path.join(ROOT, 'database/sources/ctext/zengshanbuyi-wiki-950329-2026-07-12.html');
const WITNESS = path.join(ROOT, 'database/sources/ctext/yuanji-shuaiwang-2026-07-17.json');

function extractLines(htmlPath) {
  let h = readFileSync(htmlPath, 'utf-8');
  h = h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  h = h.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  const text = h.replace(/<[^>]+>/g, '\n');
  return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).slice(1);
}
const lines = extractLines(HTML);
const L = (n) => lines[n - 1] ?? '';
const joinRange = (a, b) => {
  const parts = [];
  for (let n = a; n <= b; n += 1) { const t = L(n); if (!/^\d+$/.test(t)) parts.push(t); }
  return parts.join('／');
};

// Calibration anchors (batch-4 convention guard)
assert(L(545).includes('須要先念渾天甲子'), 'calibration: l.545 anchor lost');
assert(L(751) === '用神元神忌神仇神章第九', `calibration: l.751 ≠ 章第九 heading (got "${L(751).slice(0, 20)}")`);
assert(L(773) === '元神忌神衰旺章第十', `calibration: l.773 ≠ 章第十 heading`);
assert(L(817).includes('五行相生章第十一'), 'calibration: l.817 anchor lost');

const witness = JSON.parse(readFileSync(WITNESS, 'utf-8'));
const passages = witness.pages['zengshanbuyi-950329'].passages;
for (const [name, p] of Object.entries(passages)) {
  const loc = String(p.lineLocator);
  let expected;
  if (loc.includes('-')) { const [a, b] = loc.split('-').map(Number); expected = joinRange(a, b); }
  else expected = L(Number(loc));
  if (p.textIsExcerpt) assert(expected.includes(p.text), `witness "${name}": excerpt not in line(s) ${loc}`);
  else assert(p.text === expected, `witness "${name}": text ≠ fresh extraction of line(s) ${loc}`);
}

// Key teaching quotes present at cited lines
assert(L(753).includes('元神﹐生用神之神卽為元神。忌神克用神之爻也'), 'l.753 definition wording lost');
assert(L(775).includes('元神𨿽生用神﹐須要旺相﹐方可生得用神'), 'l.775 总纲 wording lost');
assert(L(795).includes('𨿽有如無'), 'l.795 雖有如無 wording lost');
assert(L(769).includes('當擇其旺者而用之'), 'l.769 择旺 wording lost');

// ── Layer 2a: 元神/忌神 direction semantics (definition ↔ engine) ───
// 元神 generates the 用神; 忌神 restricts it. Viewed FROM the 用神:
assert(wuxingRelation('fire', 'wood') === 'generated_by', '寅/卯木 must be 元神 of 巳火 (生我)');
assert(wuxingRelation('fire', 'water') === 'restricted_by', '子/亥水 must be 忌神 of 巳火 (克我)');
assert(wuxingRelation('earth', 'fire') === 'generated_by', '巳午火 must be 元神 of 丑土 (明夷用神)');

// ── Layer 2b: 大有 triangle under 卯月丁亥日 ────────────────────────
const DATE = { year: 2026, month: 3, day: 14, hour: 22, minute: 0 };
const dy = paipan([7, 7, 7, 7, 8, 7], DATE);
assert(dy.benGua.name === '火天大有', `case throws → ${dy.benGua.name} ≠ 火天大有`);
assert(dy.benGua.palace === '乾宫' && dy.benGua.guaType === '归魂', `大有 ${dy.benGua.palace}/${dy.benGua.guaType} ≠ 乾宫/归魂`);
assert(dy.movingLines.length === 0, '大有 must be 六爻安静');
assert(dy.date.monthBranch === '卯' && dy.date.dayStem === '丁' && dy.date.dayBranch === '亥',
  `period drifted: ${dy.date.monthBranch}月 ${dy.date.dayStem}${dy.date.dayBranch}日 ≠ 卯月丁亥日`);
const resp = dy.lines.find((l) => l.isResponse);
assert(resp.position === 6 && resp.branch === '巳' && resp.liuqin === '官鬼', `大有 应 ≠ 上爻巳官鬼 (got ${resp.positionName}${resp.branch}${resp.liuqin})`);
const world = dy.lines.find((l) => l.isWorld);
assert(world.position === 3 && world.branch === '辰' && world.liuqin === '父母', `大有 世 ≠ 三爻辰父母`);
const yuanShen = dy.lines[1];
assert(yuanShen.branch === '寅' && yuanShen.liuqin === '妻财', `大有 二爻 ≠ 寅妻财 (元神)`);
const jiShen = dy.lines[0];
assert(jiShen.branch === '子' && jiShen.liuqin === '子孙', `大有 初爻 ≠ 子子孙 (忌神)`);
// 卯月 directions: 元神寅木 same-wuxing 幫扶 (旺); 忌神子水 generates wood = 泄 (衰)
assert(BRANCH_WUXING['卯'] === 'wood' && BRANCH_WUXING['寅'] === 'wood', '卯寅同木 (元神月扶=旺)');
assert(wuxingRelation('water', 'wood') === 'generate', '子水 vs 卯月 = 我生(泄) → 忌神衰');
// 亥沖巳 (暗動 echo slot)
const clashSet = new Set(baziData.BRANCH_RELATIONS.liuchong.map((c) => c.pair.slice().sort().join('')));
assert(clashSet.has(['巳', '亥'].sort().join('')), '巳亥 must be in liuchong (暗動 echo)');

// ── Layer 2c: 明夷 same-branch duplicate + fushen fact ──────────────
const my = paipan([7, 8, 7, 8, 8, 8], DATE);
assert(my.benGua.name === '地火明夷', 'reread throws ≠ 明夷');
const guis = my.lines.filter((l) => l.liuqin === '官鬼');
assert(guis.length === 2 && guis.every((l) => l.branch === '丑'), '明夷 两官鬼 must both be 丑 (same-branch degeneracy)');
assert(guis.some((l) => l.isWorld && l.position === 4), '明夷 四爻官鬼 must carry 世 (tie-break by 临世)');
assert(my.lines.every((l) => l.wuxingCn !== '火'), '明夷 must have no VISIBLE fire line');
assert(my.fushen.some((f) => f.liuqin === '妻财' && f.branch === '午'), '明夷 fushen must include 妻财午 (元神伏而不现 — gloss guard)');

// ── Layer 2d: 乾为天 distinct-branch duplicate (KP-015 主例) ────────
const qian = paipan([7, 7, 7, 7, 7, 7], DATE);
const fumus = qian.lines.filter((l) => l.liuqin === '父母');
assert(fumus.length === 2, '乾为天 must have exactly 2 父母 lines');
const branchSet = new Set(fumus.map((l) => l.branch));
assert(branchSet.has('辰') && branchSet.has('戌') && branchSet.size === 2, `乾为天 两父母 ≠ {辰,戌} (got ${[...branchSet]})`);
// 辰月假设推演 (原文 769 口径): 辰临月建 → picks 辰
assert(clashSet.has(['辰', '戌'].sort().join('')), '辰戌相沖 (choosing-context awareness: 辰月 both 临&沖 — script must handle by 769 wording 臨月建取辰)');

// ── Layer 3: KP-card chain (kp-ly-013/014/015) ──────────────────────
const KP_EXPECT = [
  { id: 'kp-ly-013', passage: '用神元神忌神仇神章第九_定义' },
  { id: 'kp-ly-014', passage: '元神忌神衰旺章第十_能生五条件' },
  { id: 'kp-ly-015', passage: '章第九_乾为天择旺例' },
];
const witnessTexts = Object.values(passages).map((p) => p.text);
for (const { id, passage } of KP_EXPECT) {
  const kpPath = path.join(ROOT, `database/knowledge/${id}.json`);
  if (!existsSync(kpPath)) { checks += 1; failures.push(`KP card missing: ${id}.json`); continue; }
  const kp = JSON.parse(readFileSync(kpPath, 'utf-8'));
  assert(kp.status === 'reviewed' || kp.status === 'accepted', `${id}: status ${kp.status}`);
  assert(Array.isArray(kp.canonicalTexts) && kp.canonicalTexts.length > 0, `${id}: no canonicalTexts`);
  for (const [i, ct] of (kp.canonicalTexts || []).entries()) {
    const anchored = witnessTexts.some((wt) => wt.includes(ct.text) || ct.text.includes(wt));
    assert(anchored, `${id} canonicalTexts[${i}]: not anchored in witness (引用必 grep violation)`);
    assert((ct.witness || '').includes('yuanji-shuaiwang-2026-07-17.json'), `${id} canonicalTexts[${i}]: witness field must cite yuanji-shuaiwang`);
  }
  const primary = passages[passage].text;
  assert(kp.canonicalTexts.some((ct) => primary.includes(ct.text) || ct.text === primary),
    `${id}: no canonicalText anchors to primary passage 「${passage}」`);
}

// ── Report ──────────────────────────────────────────────────────────
console.log(`chapter-5 canon audit: ${checks} checks, ${failures.length} failure(s)`);
if (failures.length) { for (const f of failures) console.error('  ✗', f); process.exit(1); }
console.log('ALL GREEN — witness fidelity + engine cross-check + KP chain verified');
