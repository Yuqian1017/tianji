/**
 * 望诊 engine — builds multimodal messages for vision AI analysis.
 */

import { getDiagnosisType } from './data.js';

/**
 * Build a multimodal message with image + text for AI analysis.
 *
 * @param {string} base64 - Base64-encoded JPEG image data (no prefix)
 * @param {string} typeId - Diagnosis type: 'tongue' | 'face' | 'palm'
 * @param {string} [userNote] - Optional user-provided symptom description
 * @returns {{ role: string, content: Array }} Message in Anthropic vision format
 */
export function buildVisionMessage(base64, typeId, userNote = '') {
  const type = getDiagnosisType(typeId);
  const dimensionList = type.dimensions.map(d => `  - ${d.name}: ${d.detail}`).join('\n');

  let textContent = `请对这张${type.name}照片进行分析。\n\n`;
  textContent += `分析维度:\n${dimensionList}\n`;

  if (userNote) {
    textContent += `\n用户描述的症状/关注点: ${userNote}\n`;
  }

  textContent += `\n请根据照片逐项分析以上维度，然后给出综合判断和调养建议。`;

  return {
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64,
        },
      },
      {
        type: 'text',
        text: textContent,
      },
    ],
  };
}

/**
 * Build a text-only follow-up message (for conversation after initial analysis).
 */
export function buildFollowUpMessage(text) {
  return { role: 'user', content: text };
}
