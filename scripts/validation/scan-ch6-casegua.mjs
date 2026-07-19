// ch6《动爻》案卦系统扫描 — 策划期引擎实测工具（一次性，仿 ch5 静卦扫描先例）
// 目标：单动爻案卦，官鬼发动 + 变爻回头克，辰月占期，暗动教学位评估
import { paipan } from '../../src/modules/liuyao/engine.js';

const SHENG = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const KE = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };
const CHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const BRANCH_WX = { 子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood', 辰: 'earth', 巳: 'fire', 午: 'fire', 未: 'earth', 申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water' };

// 旺衰粗判（辰月=土旺）：月建五行生我=相/同我=旺/我生=休/我克=囚/克我=死 → 简化三档
function wangshuaiInMonth(wx, monthWx) {
  if (wx === monthWx) return '旺';
  if (SHENG[monthWx] === wx) return '相';
  if (SHENG[wx] === monthWx) return '休'; // 我生月=泄
  if (KE[wx] === monthWx) return '囚';
  return '死'; // 月克我
}

// Step 1: 打印候选占期干支（2026-04-05 清明后 辰月内 15 天）
if (process.argv[2] === 'dates') {
  for (let d = 4; d <= 30; d++) {
    const r = paipan([7, 8, 8, 8, 8, 7], { year: 2026, month: 4, day: d, hour: 21, minute: 0 });
    console.log(`2026-04-${String(d).padStart(2, '0')} → ${r.date.monthBranch}月 ${r.date.dayStem}${r.date.dayBranch}日 空亡${r.kongWang ? r.kongWang.join('') : '?'}`);
  }
  process.exit(0);
}

// Step 2: 系统扫描 —— 用指定占期，枚举 64 本卦 × 6 单动爻位
const [, , y, m, d] = process.argv.map(Number);
const dateParts = { year: y || 2026, month: m || 4, day: d || 10, hour: 21, minute: 0 };

const results = [];
for (let mask = 0; mask < 64; mask++) {
  // mask bit i = 第 i+1 爻阴阳（1=阳）
  for (let mv = 0; mv < 6; mv++) {
    const raw = [];
    for (let i = 0; i < 6; i++) {
      const yang = (mask >> i) & 1;
      if (i === mv) raw.push(yang ? 9 : 6);
      else raw.push(yang ? 7 : 8);
    }
    let r;
    try { r = paipan(raw, dateParts); } catch { continue; }
    const monthWx = BRANCH_WX[r.date.monthBranch];
    const dayBranch = r.date.dayBranch;
    const moving = r.lines[mv];
    if (moving.liuqin !== '官鬼') continue; // 约束1：官鬼发动
    const bian = moving.bianYao;
    if (!bian) continue;
    // 约束2：变爻回头关系
    let huitou = '';
    if (KE[bian.wuxing] === moving.wuxing) huitou = '回头克';
    else if (SHENG[bian.wuxing] === moving.wuxing) huitou = '回头生';
    else if (CHONG[bian.branch] === moving.branch) huitou = '回头冲';
    if (!huitou) continue;
    // 官鬼旺衰（辰月）
    const guiWS = wangshuaiInMonth(moving.wuxing, monthWx);
    // 暗动位：日辰所冲之静爻（旺相者=暗动）
    const anDong = r.lines
      .filter((l, i) => i !== mv && CHONG[dayBranch] === l.branch)
      .map(l => `${l.positionName}${l.branch}${l.liuqin}(${wangshuaiInMonth(l.wuxing, monthWx)})`);
    if (moving.isEmpty) continue; // 约束3：动爻不临空亡（旬空超纲，剧本无法处理）
    // 世应
    const shiYao = r.lines.find(l => l.isWorld);
    const yingYao = r.lines.find(l => l.isResponse);
    results.push({
      gua: `${r.benGua.name}之${r.bianGua?.name || '?'}`,
      palace: `${r.benGua.palace}·${r.benGua.guaType || ''}`,
      raw: raw.join(''),
      moving: `${moving.positionName}${moving.stem}${moving.branch}官鬼[${guiWS}]動`,
      bian: `变${bian.branch}${bian.liuqin}→${huitou}`,
      anDong: anDong.join(',') || '-',
      shi: shiYao ? `世${shiYao.branch}${shiYao.liuqin}${shiYao.isEmpty ? '⚠空' : ''}` : '?',
      ying: yingYao ? `应${yingYao.branch}${yingYao.liuqin}${yingYao.isEmpty ? '⚠空' : ''}${yingYao.isMoving ? '★動' : ''}` : '?',
    });
  }
}
console.log(`占期: ${dateParts.year}-${dateParts.month}-${dateParts.day} | 命中 ${results.length} 组`);
for (const x of results) {
  console.log(`${x.gua}〔${x.palace}〕掷${x.raw} | ${x.moving} ${x.bian} | 暗動:${x.anDong} | ${x.shi} ${x.ying}`);
}
