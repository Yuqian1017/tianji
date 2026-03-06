// Quick validation script for liuyao algorithm
// Test case from reference/test-cases.md:
// 甲辰年 丙寅月 壬午日，coins: [7, 8, 7, 9, 8, 7]
// Expected: 本卦=离为火(离宫), 变卦=山火贲(艮宫), 世6应3, 空亡=[午,未]

import { paipan, getTodayGanzhi, getKongWang } from './src/liuyao/engine.js';

// Override date functions for test — we'll just validate the algorithm part
const testValues = [7, 8, 7, 9, 8, 7]; // 初爻到上爻

console.log('=== 六爻排盘算法验证 ===\n');

try {
  const result = paipan(testValues);

  console.log(`本卦: ${result.benGua.name}`);
  console.log(`  期望: 离为火`);
  console.log(`  ${result.benGua.name === '离为火' ? '✅ 正确' : '❌ 错误'}`);

  console.log(`\n卦宫: ${result.benGua.palace}`);
  console.log(`  期望: 离宫`);
  console.log(`  ${result.benGua.palace === '离宫' ? '✅ 正确' : '❌ 错误'}`);

  console.log(`\n变卦: ${result.bianGua?.name || '无'}`);
  console.log(`  期望: 山火贲`);
  console.log(`  ${result.bianGua?.name === '山火贲' ? '✅ 正确' : '❌ 错误'}`);

  // 世爻应爻
  const worldLine = result.lines.find(l => l.isWorld);
  const responseLine = result.lines.find(l => l.isResponse);
  console.log(`\n世爻位置: ${worldLine?.position}`);
  console.log(`  期望: 6`);
  console.log(`  ${worldLine?.position === 6 ? '✅ 正确' : '❌ 错误'}`);

  console.log(`\n应爻位置: ${responseLine?.position}`);
  console.log(`  期望: 3`);
  console.log(`  ${responseLine?.position === 3 ? '✅ 正确' : '❌ 错误'}`);

  // 空亡验证 (壬午日)
  const kw = getKongWang('壬', '午');
  console.log(`\n空亡(壬午日): ${kw.join('、')}`);
  console.log(`  期望: 午、未`);
  console.log(`  ${kw[0] === '午' && kw[1] === '未' ? '✅ 正确' : '❌ 错误'}`);

  // 动爻
  console.log(`\n动爻: 第${result.movingLines.map(i => i + 1).join('、')}爻`);
  console.log(`  期望: 第4爻 (value=9, 老阳)`);
  console.log(`  ${result.movingLines.length === 1 && result.movingLines[0] === 3 ? '✅ 正确' : '❌ 错误'}`);

  // 纳甲验证 (离为火: 内卦离纳己，外卦离纳己)
  console.log('\n纳甲验证:');
  console.log('  离卦内卦应纳己: 己卯、己丑、己亥');
  console.log('  离卦外卦应纳己: 己酉、己未、己巳');
  result.lines.forEach(l => {
    console.log(`  ${l.positionName}: ${l.stem}${l.branch} (${l.wuxingCn}) - ${l.liuqin}`);
  });

  // 六亲验证 (离宫属火)
  // 火与木=木生火=父母, 火与土=火生土=子孙, 火与金=火克金=妻财
  // 火与水=水克火=官鬼, 火与火=同=兄弟
  console.log('\n六亲验证 (离宫·火):');
  const expectedLiuqin = {
    '卯': '父母',  // 木生火
    '丑': '子孙',  // 火生土
    '亥': '官鬼',  // 水克火
    '酉': '妻财',  // 火克金
    '未': '子孙',  // 火生土
    '巳': '兄弟',  // 火与火
  };
  let liuqinCorrect = true;
  result.lines.forEach(l => {
    const expected = expectedLiuqin[l.branch];
    const match = l.liuqin === expected;
    if (!match) liuqinCorrect = false;
    console.log(`  ${l.positionName} ${l.branch}: ${l.liuqin} (期望: ${expected}) ${match ? '✅' : '❌'}`);
  });
  console.log(`  六亲整体: ${liuqinCorrect ? '✅ 全部正确' : '❌ 有错误'}`);

  // 六神验证 (壬日起玄武)
  console.log('\n六神验证 (壬日):');
  console.log('  壬日六神: 玄武·青龙·朱雀·勾陈·螣蛇·白虎');
  const expectedSpirits = ['玄武','青龙','朱雀','勾陈','螣蛇','白虎'];
  let spiritCorrect = true;
  result.lines.forEach((l, i) => {
    const match = l.spirit === expectedSpirits[i];
    if (!match) spiritCorrect = false;
    console.log(`  ${l.positionName}: ${l.spirit} (期望: ${expectedSpirits[i]}) ${match ? '✅' : '❌'}`);
  });
  console.log(`  六神整体: ${spiritCorrect ? '✅ 全部正确' : '❌ 有错误'}`);

  console.log('\n=== 验证完成 ===');

} catch (e) {
  console.error('排盘出错:', e);
}
