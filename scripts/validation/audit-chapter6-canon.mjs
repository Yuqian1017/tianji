// Chapter 6 canon audit — 跟随制审计第六批（動爻·變爻回頭·暗動日破）
// Three layers (same structure as audit-chapter5-canon.mjs):
//   1. Witness fidelity: dongyao-andong-2026-07-18.json passages ↔ fresh extraction.
//   2. Engine cross-check: 观之剥 case gua (五爻巳官鬼独发/变子回头克/两现巳/空亡);
//      natal 节卦回头生; 大有辰月 snapshot; 亥沖巳三态; date chain 丁亥→己酉→辛亥;
//      動靜生克章例卦 (兌之歸妹 / 坤之晉) verbatim-to-engine collision.
//   3. KP-card chain: kp-ly-016/017/018 canonicalTexts anchored in witness; kp-ly-015 择动 patch.
// Usage: node scripts/validation/audit-chapter6-canon.mjs   (npm run audit:chapter6-canon)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const { wuxingRelation, paipan } = await import(path.join(ROOT, 'src/modules/liuyao/engine.js'));

const failures = [];
let checks = 0;
const assert = (cond, msg) => { checks += 1; if (!cond) failures.push(msg); };

// ── Layer 1: witness fidelity ───────────────────────────────────────
const HTML = path.join(ROOT, 'database/sources/ctext/zengshanbuyi-wiki-950329-2026-07-12.html');
const WITNESS = path.join(ROOT, 'database/sources/ctext/dongyao-andong-2026-07-18.json');

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

// Calibration anchors (batch-4/5 convention guard)
assert(L(545).includes('須要先念渾天甲子'), 'calibration: l.545 anchor lost');
assert(L(693) === '動變章第七', 'calibration: l.693 ≠ 動變章第七 heading');
assert(L(901) === '動靜生克章第十四', 'calibration: l.901 ≠ 章第十四 heading');
assert(L(937) === '動變生克沖合章第十五', 'calibration: l.937 ≠ 章第十五 heading');
assert(L(1075) === '日辰章第十七', 'calibration: l.1075 ≠ 日辰章 heading');
assert(L(1359) === '暗動章第二十二', 'calibration: l.1359 ≠ 暗動章 heading');
assert(L(1381) === '動散章第二十三', 'calibration: l.1381 ≠ 動散章 heading');

const witness = JSON.parse(readFileSync(WITNESS, 'utf-8'));
const passages = witness.pages['zengshanbuyi-950329'].passages;
assert(Object.keys(passages).length === 10, `witness passage count ${Object.keys(passages).length} ≠ 10`);
for (const [name, p] of Object.entries(passages)) {
  const loc = String(p.lineLocator);
  let expected;
  if (loc.includes('-')) { const [a, b] = loc.split('-').map(Number); expected = joinRange(a, b); }
  else expected = L(Number(loc));
  if (p.textIsExcerpt) assert(expected.includes(p.text), `witness "${name}": excerpt not in line(s) ${loc}`);
  else assert(p.text === expected, `witness "${name}": text ≠ fresh extraction of line(s) ${loc}`);
}

// Key teaching quotes present at cited lines
assert(L(573) === '3、卦中之動爻能生克沖合', 'l.573 四处之三 heading lost');
assert(L(577) === '4、世爻發動變出之爻能回頭生克沖合', 'l.577 四处之四 heading lost');
assert(L(579).includes('變出寅卯之木謂之回頭克世'), 'l.579 回頭克 wording lost');
assert(L(903).includes('蓋旺相者有力之人也'), 'l.903 总纲 wording lost');
assert(L(935).includes('動而能克旺相之卯木'), 'l.935 休囚動克旺相 wording lost');
assert(L(939).includes('不能生克他爻'), 'l.939 變爻边界 wording lost');
assert(L(955).includes('惟日月能生之、克之、沖之、令之'), 'l.955 惟日月 wording lost');
assert(L(1361).includes('福來而不知﹐禍來而不覺'), 'l.1361 暗動金句 lost');
assert(L(1383).includes('神兆機于動﹐動必有因'), 'l.1383 神兆機于動 lost');
// 择动 (batch-5 witness, line 595 latter half — zero re-transcription)
assert(L(595).includes('如一爻動者擇其動者為用神'), 'l.595 择动后半句 lost');

// ── Layer 2a: 观之剥 case gua under 辰月辛亥日 ──────────────────────
const DATE6 = { year: 2026, month: 4, day: 7, hour: 21, minute: 0 };
const gz = paipan([8, 8, 8, 8, 9, 7], DATE6);
assert(gz.benGua.name === '风地观', `case gua → ${gz.benGua.name} ≠ 风地观`);
assert(gz.bianGua?.name === '山地剥', `变卦 → ${gz.bianGua?.name} ≠ 山地剥（ch1 案卦回归）`);
assert(gz.benGua.palace === '乾宫' && gz.benGua.guaType === '四世', `观 ${gz.benGua.palace}/${gz.benGua.guaType} ≠ 乾宫/四世`);
assert(gz.date.monthBranch === '辰' && gz.date.dayStem === '辛' && gz.date.dayBranch === '亥',
  `period drifted: ${gz.date.monthBranch}月 ${gz.date.dayStem}${gz.date.dayBranch}日 ≠ 辰月辛亥日`);
assert(gz.movingLines.length === 1 && gz.movingLines[0] === 4, '观之剥 must be 五爻独发 (index 4)');
const mv = gz.lines[4];
assert(mv.branch === '巳' && mv.liuqin === '官鬼' && mv.stem === '辛', `五爻 ${mv.stem}${mv.branch}${mv.liuqin} ≠ 辛巳官鬼`);
assert(mv.bianYao?.branch === '子' && mv.bianYao?.liuqin === '子孙', `变爻 ${mv.bianYao?.branch}${mv.bianYao?.liuqin} ≠ 子子孙`);
assert(wuxingRelation('fire', 'water') === 'restricted_by', '子水必须克巳火（回頭克方向）');
const gui2 = gz.lines[1];
assert(gui2.branch === '巳' && gui2.liuqin === '官鬼' && !gui2.isMoving, '二爻必须是静巳官鬼（两现一动一静=择动教具）');
assert(gz.lines[3].isWorld && gz.lines[3].branch === '未', '世必须在四爻辛未');
assert(gz.kongWang.includes('寅') && gz.kongWang.includes('卯'), `辛亥日空亡 ${gz.kongWang} ≠ 寅卯`);
assert(gz.lines.every((l) => l.liuqin !== '子孙'), '本卦面上必须无子孙显爻（伏而不现——变爻子孙的戏剧前提）');
assert(mv.isEmpty === false, '动爻五爻辛巳不得临空亡');
// 亥沖巳 direction (day branch 亥 sends the chong)
assert(gz.date.dayBranch === '亥' && mv.branch === '巳', '亥日沖巳前提在位');

// ── Layer 2b: natal 水泽节回頭生 ────────────────────────────────────
const nt = paipan([9, 7, 8, 8, 7, 8], DATE6);
assert(nt.benGua.name === '水泽节' && nt.bianGua?.name === '坎为水', `natal ${nt.benGua.name}之${nt.bianGua?.name} ≠ 节之坎`);
const n0 = nt.lines[0];
assert(n0.branch === '巳' && n0.liuqin === '妻财' && n0.isMoving, `natal 初爻 ${n0.branch}${n0.liuqin} ≠ 巳妻财動`);
assert(n0.bianYao?.branch === '寅' && n0.bianYao?.liuqin === '子孙', `natal 变爻 ${n0.bianYao?.branch}${n0.bianYao?.liuqin} ≠ 寅子孙`);
assert(wuxingRelation('fire', 'wood') === 'generated_by', '寅木必须生巳火（回頭生方向）');

// ── Layer 2c: 大有辰月 snapshot + 亥沖巳三态 ────────────────────────
const dy6 = paipan([7, 7, 7, 7, 8, 7], DATE6);
assert(dy6.benGua.name === '火天大有', `复盘卦 ${dy6.benGua.name} ≠ 火天大有`);
const resp6 = dy6.lines.find((l) => l.isResponse);
assert(resp6.branch === '巳' && resp6.liuqin === '官鬼', `大有应 ${resp6.branch}${resp6.liuqin} ≠ 巳官鬼`);
// 旺衰换景：卯月木生巳火（旺相）→ 辰月巳火生辰土（泄气）——engine relation semantics
assert(wuxingRelation('fire', 'wood') === 'generated_by', '卯月：木生火=巳旺相（ch5 暗動前提）');
assert(wuxingRelation('earth', 'fire') === 'generated_by', '辰月：火生土=巳泄气（ch6 日破前提，from fire side = 泄）');
// ch5 period still resolves (regression guard on shared date engine)
const dy5 = paipan([7, 7, 7, 7, 8, 7], { year: 2026, month: 3, day: 14, hour: 22, minute: 0 });
assert(dy5.date.monthBranch === '卯' && dy5.date.dayStem === '丁' && dy5.date.dayBranch === '亥', 'ch5 卯月丁亥日基线漂移');

// ── Layer 2d: date chain 丁亥 → 己酉(入辰) → 辛亥 ───────────────────
const d0405 = paipan([7, 8, 8, 8, 8, 7], { year: 2026, month: 4, day: 5, hour: 12, minute: 0 });
assert(d0405.date.monthBranch === '辰' && d0405.date.dayStem === '己' && d0405.date.dayBranch === '酉', '04-05 must be 辰月己酉日（清明入辰）');
const d0404 = paipan([7, 8, 8, 8, 8, 7], { year: 2026, month: 4, day: 4, hour: 12, minute: 0 });
assert(d0404.date.monthBranch === '卯', '04-04 must still be 卯月（清明前）');

// ── Layer 2e: 動靜生克章例卦 verbatim ↔ engine ──────────────────────
// l.935 兌之歸妹: 五爻酉金發動克旺相卯木
const dg = paipan([7, 7, 8, 7, 9, 8], { year: 2026, month: 3, day: 14, hour: 12, minute: 0 });
assert(dg.benGua.name === '兑为泽' && dg.bianGua?.name === '雷泽归妹', `例卦 ${dg.benGua.name}之${dg.bianGua?.name} ≠ 兌之歸妹`);
const dgm = dg.lines[4];
assert(dgm.branch === '酉' && dgm.isMoving, `兌卦五爻 ${dgm.branch} 動 ≠ 酉動`);
assert(dg.lines[1].branch === '卯', '兌卦二爻必须卯木（被克靶，纳甲丁卯）');
assert(wuxingRelation('wood', 'metal') === 'restricted_by', '金克木（休囚動克旺相方向）');
// l.955 坤之晉: 上爻酉金動变巳火回頭克
const kz = paipan([8, 8, 8, 6, 8, 6], { year: 2026, month: 1, day: 1, hour: 12, minute: 0 });
assert(kz.benGua.name === '坤为地' && kz.bianGua?.name === '火地晋', `例卦 ${kz.benGua.name}之${kz.bianGua?.name} ≠ 坤之晉`);
const kzTop = kz.lines[5];
assert(kzTop.branch === '酉' && kzTop.isMoving && kzTop.bianYao?.branch === '巳', `坤上爻 ${kzTop.branch}動变${kzTop.bianYao?.branch} ≠ 酉動变巳（回頭克素材）`);
assert(wuxingRelation('metal', 'fire') === 'restricted_by', '巳火必须克酉金（例卦回頭克方向）');

// ── Layer 3: KP-card chain ──────────────────────────────────────────
const witnessText = Object.values(passages).map((p) => p.text).join('\n');
for (const id of ['kp-ly-016', 'kp-ly-017', 'kp-ly-018']) {
  const card = JSON.parse(readFileSync(path.join(ROOT, `database/knowledge/${id}.json`), 'utf-8'));
  assert(['reviewed', 'accepted'].includes(card.status), `${id} status ${card.status} not reviewed/accepted`);
  assert(card.canonicalTexts.length >= 2, `${id} needs ≥2 canonicalTexts`);
  for (const ct of card.canonicalTexts) {
    const inWitness = witnessText.includes(ct.text) || ct.text.split('／').every((seg) => witnessText.includes(seg));
    assert(inWitness, `${id} canonicalText not anchored in witness: "${ct.text.slice(0, 20)}…"`);
  }
  const BATCH6 = ['KP-LY-016', 'KP-LY-017', 'KP-LY-018'];
  for (const pre of card.prereqIds) {
    const preCard = JSON.parse(readFileSync(path.join(ROOT, `database/knowledge/${pre.toLowerCase()}.json`), 'utf-8'));
    const okStatus = BATCH6.includes(pre) ? ['accepted', 'reviewed'] : ['accepted'];
    assert(okStatus.includes(preCard.status), `${id} prereq ${pre} status ${preCard.status} not in [${okStatus}]（跨批 prereq 必须 accepted，同批允许 reviewed）`);
  }
}
// KP-015 择动 patch anchored in batch-5 witness line 595
const p15 = JSON.parse(readFileSync(path.join(ROOT, 'database/knowledge/kp-ly-015.json'), 'utf-8'));
const zedong = p15.canonicalTexts.find((ct) => ct.text.includes('擇其動者'));
assert(!!zedong, 'kp-015 missing 择动 canonicalText');
assert(zedong && L(595).includes(zedong.text.replace(/。$/, '')), 'kp-015 择动 text not in fresh l.595');
assert(p15.simplificationNote.includes('已于 ch6 入账'), 'kp-015 simplificationNote 择动 ledger note missing');

// ── Report ──────────────────────────────────────────────────────────
console.log(`audit-chapter6-canon: ${checks} checks, ${failures.length} failures`);
if (failures.length) { for (const f of failures) console.error('  FAIL:', f); process.exit(1); }
console.log('ALL GREEN');
