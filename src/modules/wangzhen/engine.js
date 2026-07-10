import { getDiagnosisType } from './data.js';

export function buildVisionMessage(base64, typeId, userNote = '') {
  if (typeof base64 !== 'string' || base64.length === 0) {
    throw new TypeError('base64 image data is required');
  }
  const type = getDiagnosisType(typeId);
  const dimensionList = type.dimensions.map(item => `  - ${item.name}: ${item.detail}`).join('\n');

  let textContent = `请观察这张${type.name}照片。\n\n`;
  textContent += `只描述照片中可见的画面特征：\n${dimensionList}\n`;
  if (userNote.trim()) textContent += `\n拍摄备注: ${userNote.trim()}\n`;
  textContent += '\n请先说明光线、白平衡、清晰度和遮挡限制，再逐项客观描述。不要输出医学含义、健康结论或行动方案。';

  return {
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
      },
      { type: 'text', text: textContent },
    ],
  };
}

export function buildFollowUpMessage(text) {
  return { role: 'user', content: text };
}
