import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { TIZHI_VALIDATION } from '../../src/modules/tizhi/data.js';
import { assessConstitution } from '../../src/modules/tizhi/engine.js';
import { ZIWU_LIUZHU } from '../../src/modules/ziwu/data.js';
import { formatForAI as formatZiwuForAI } from '../../src/modules/ziwu/engine.js';
import { analyzeYear, formatForAI as formatWuyunForAI } from '../../src/modules/wuyun/engine.js';
import { buildVisionMessage } from '../../src/modules/wangzhen/engine.js';

const ROOT = new URL('../../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, ROOT), 'utf8');
}

test('blocks the incomplete historical constitution questionnaire', async () => {
  assert.equal(TIZHI_VALIDATION.status, 'blocked_unvalidated_questionnaire');
  assert.equal(TIZHI_VALIDATION.canonicalStandard, 'ZYYXH/T 157-2009');
  assert.throws(
    () => assessConstitution([]),
    /历史简化问卷未达到 ZYYXH\/T 157-2009 的完整条目与判定要求/,
  );

  const ui = await source('src/modules/tizhi/TizhiModule.jsx');
  assert.match(ui, /功能暂停/);
  assert.doesNotMatch(ui, /AI 调养解读|推荐茶饮|艾灸为主/);
});

test('keeps the meridian clock structural and non-clinical', async () => {
  assert.equal(ZIWU_LIUZHU.length, 12);
  for (const entry of ZIWU_LIUZHU) {
    assert.deepEqual(
      Object.keys(entry).sort(),
      ['hours', 'hourStart', 'meridian', 'organ', 'shichen', 'wuxing'].sort(),
    );
  }

  const aiText = formatZiwuForAI(new Date('2026-07-10T10:00:00+08:00'));
  assert.doesNotMatch(aiText, /养生|疾病|症状|穴位|排毒|最佳/);

  const prompt = await source('src/modules/ziwu/prompt.js');
  assert.match(prompt, /文化结构/);
  assert.doesNotMatch(prompt, /生理特点|养生建议|保健穴位|饮食/);
});

test('keeps Five Movements and Six Qi output away from health claims', async () => {
  const result = analyzeYear(2026);
  assert.equal(result.validation.interpretation, 'not_validated');
  assert.equal('affectedOrgans' in result, false);

  const aiText = formatWuyunForAI(result);
  assert.doesNotMatch(aiText, /重点关注脏腑|疾病|食疗|健康风险/);

  const data = await source('src/modules/wuyun/data.js');
  assert.doesNotMatch(data, /heart|心血管|呼吸道|脾胃关注|心肾关注/);

  const prompt = await source('src/modules/wuyun/prompt.js');
  assert.match(prompt, /文化结构/);
  assert.doesNotMatch(prompt, /健康指导|易发疾病|食疗方案|健康风险/);
});

test('limits visual inspection to observable image features', async () => {
  const message = buildVisionMessage('ZmFrZQ==', 'tongue', '仅测试');
  const textPart = message.content.find(part => part.type === 'text').text;
  assert.match(textPart, /只描述照片中可见/);
  assert.doesNotMatch(textPart, /综合判断|调养建议|脏腑|体质/);

  const prompt = await source('src/modules/wangzhen/prompt.js');
  assert.match(prompt, /客观观察助手/);
  assert.doesNotMatch(prompt, /脏腑判断|体质倾向|调养建议/);
});

test('does not expose concrete herbal doses through active TCM runtime paths', async () => {
  const paths = [
    'src/modules/tizhi/data.js',
    'src/modules/tizhi/prompt.js',
    'src/modules/ziwu/data.js',
    'src/modules/ziwu/prompt.js',
    'src/modules/wuyun/data.js',
    'src/modules/wuyun/prompt.js',
    'src/modules/wangzhen/data.js',
    'src/modules/wangzhen/prompt.js',
  ];
  const content = (await Promise.all(paths.map(source))).join('\n');
  assert.doesNotMatch(content, /\d+(?:\.\d+)?\s*(?:g|克)\b/i);
});
