/**
 * Common traditional meridian-clock correspondence.
 * This is a cultural mapping, not a clinically validated body schedule.
 */
export const ZIWU_MODEL = Object.freeze({
  model: 'common_traditional_meridian_clock_mapping',
  structureStatus: 'candidate_traditional_mapping',
  clinicalInterpretation: 'not_validated',
  productScope: 'cultural_structure_only',
});

export const ZIWU_LIUZHU = [
  { shichen: '子', hours: '23:00-01:00', hourStart: 23, organ: '胆', meridian: '足少阳胆经', wuxing: 'wood' },
  { shichen: '丑', hours: '01:00-03:00', hourStart: 1, organ: '肝', meridian: '足厥阴肝经', wuxing: 'wood' },
  { shichen: '寅', hours: '03:00-05:00', hourStart: 3, organ: '肺', meridian: '手太阴肺经', wuxing: 'metal' },
  { shichen: '卯', hours: '05:00-07:00', hourStart: 5, organ: '大肠', meridian: '手阳明大肠经', wuxing: 'metal' },
  { shichen: '辰', hours: '07:00-09:00', hourStart: 7, organ: '胃', meridian: '足阳明胃经', wuxing: 'earth' },
  { shichen: '巳', hours: '09:00-11:00', hourStart: 9, organ: '脾', meridian: '足太阴脾经', wuxing: 'earth' },
  { shichen: '午', hours: '11:00-13:00', hourStart: 11, organ: '心', meridian: '手少阴心经', wuxing: 'fire' },
  { shichen: '未', hours: '13:00-15:00', hourStart: 13, organ: '小肠', meridian: '手太阳小肠经', wuxing: 'fire' },
  { shichen: '申', hours: '15:00-17:00', hourStart: 15, organ: '膀胱', meridian: '足太阳膀胱经', wuxing: 'water' },
  { shichen: '酉', hours: '17:00-19:00', hourStart: 17, organ: '肾', meridian: '足少阴肾经', wuxing: 'water' },
  { shichen: '戌', hours: '19:00-21:00', hourStart: 19, organ: '心包', meridian: '手厥阴心包经', wuxing: 'fire' },
  { shichen: '亥', hours: '21:00-23:00', hourStart: 21, organ: '三焦', meridian: '手少阳三焦经', wuxing: 'fire' },
];

export const WUXING_COLORS = {
  wood: '#22c55e',
  fire: '#ef4444',
  earth: '#eab308',
  metal: '#9ca3af',
  water: '#3b82f6',
};
