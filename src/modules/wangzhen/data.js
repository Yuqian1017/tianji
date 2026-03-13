/**
 * 望诊 (Visual Diagnosis) data — diagnostic categories, guidance, and analysis dimensions.
 */

export const DIAGNOSIS_TYPES = [
  {
    id: 'tongue',
    name: '舌诊',
    icon: '👅',
    description: '通过观察舌质颜色、舌形、舌苔等判断脏腑气血状态',
    guidance: '请伸出舌头，自然放松，在光线充足的环境下拍照。建议在自然光或白色灯光下拍摄，避免彩色灯光影响。',
    dimensions: [
      { name: '舌质颜色', detail: '淡白/淡红/红/绛红/紫暗' },
      { name: '舌形', detail: '胖大/瘦薄/齿痕/裂纹/芒刺' },
      { name: '舌苔颜色', detail: '白苔/黄苔/灰黑苔' },
      { name: '舌苔质地', detail: '薄苔/厚苔/腻苔/剥苔/无苔' },
      { name: '舌下络脉', detail: '细短/粗长/迂曲/紫暗' },
      { name: '润燥', detail: '润泽/干燥/滑腻' },
    ],
  },
  {
    id: 'face',
    name: '面诊',
    icon: '😊',
    description: '通过观察面部气色、色泽分布判断五脏健康状态',
    guidance: '请面对镜头，保持自然表情，确保面部光线均匀。不要化妆拍摄效果更准确。',
    dimensions: [
      { name: '面色', detail: '红润/苍白/萎黄/晦暗/青紫' },
      { name: '额部', detail: '心之外候 — 色泽变化反映心火状态' },
      { name: '鼻部', detail: '脾之外候 — 色泽反映脾胃运化' },
      { name: '左颊', detail: '肝之外候 — 反映肝胆疏泄' },
      { name: '右颊', detail: '肺之外候 — 反映肺气宣降' },
      { name: '颏部', detail: '肾之外候 — 反映肾气盛衰' },
      { name: '眼部', detail: '目为肝之窍，观神气/眼白/眼袋' },
      { name: '唇色', detail: '脾开窍于口 — 淡白/红润/紫暗/干裂' },
    ],
  },
  {
    id: 'palm',
    name: '手诊',
    icon: '🖐',
    description: '通过手掌颜色、纹理、形态判断体质与脏腑状态',
    guidance: '请将手掌自然展开面对镜头，在光线充足的环境下拍摄。先拍左手，再拍右手效果更佳。',
    dimensions: [
      { name: '掌色', detail: '红润/苍白/黄/青紫/斑点' },
      { name: '大鱼际', detail: '肺区 — 饱满/凹陷/发红' },
      { name: '小鱼际', detail: '肾区 — 色泽与弹性' },
      { name: '指甲', detail: '半月痕/色泽/纹路/形状' },
      { name: '手温', detail: '（需自述）冰凉/温热/潮湿/干燥' },
    ],
  },
];

/**
 * Get diagnosis type by ID.
 */
export function getDiagnosisType(id) {
  return DIAGNOSIS_TYPES.find(t => t.id === id) || DIAGNOSIS_TYPES[0];
}
