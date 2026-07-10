export const WANGZHEN_VALIDATION = Object.freeze({
  scope: 'visible_image_features_only',
  medicalInference: 'blocked',
  interpretation: 'not_validated',
});

export const DIAGNOSIS_TYPES = [
  {
    id: 'tongue',
    name: '舌面观察',
    icon: '👅',
    description: '记录照片中可见的颜色、形态、覆盖物与润燥外观',
    guidance: '请在自然光或中性白光下拍摄，关闭美颜和滤镜，保持画面清晰；颜色会受设备与环境光影响。',
    dimensions: [
      { name: '画面光线', detail: '亮度、偏色与阴影' },
      { name: '可见颜色', detail: '只描述照片呈现的颜色范围' },
      { name: '外形', detail: '宽窄、边缘、可见纹理' },
      { name: '表面覆盖', detail: '颜色、厚薄与分布外观' },
      { name: '润燥外观', detail: '反光、湿润或干燥外观' },
    ],
  },
  {
    id: 'face',
    name: '面部观察',
    icon: '😊',
    description: '记录照片中可见的光线、颜色分布与表面特征',
    guidance: '请面对镜头，在均匀自然光或中性白光下拍摄，关闭美颜和滤镜；不要用单张照片作健康判断。',
    dimensions: [
      { name: '画面光线', detail: '曝光、阴影与偏色' },
      { name: '颜色分布', detail: '只描述照片中可见的区域差异' },
      { name: '表面特征', detail: '可见纹理、斑点与干燥外观' },
      { name: '对称与遮挡', detail: '拍摄角度、表情和遮挡影响' },
    ],
  },
  {
    id: 'palm',
    name: '手部观察',
    icon: '🖐',
    description: '记录手掌照片中可见的颜色、纹理与指甲外观',
    guidance: '请在均匀自然光或中性白光下拍摄，手掌自然展开，关闭滤镜；触感与温度无法从照片判断。',
    dimensions: [
      { name: '画面光线', detail: '曝光、阴影与偏色' },
      { name: '可见颜色', detail: '只描述照片呈现的颜色' },
      { name: '纹理', detail: '掌纹、干燥与表面纹理外观' },
      { name: '指甲外观', detail: '可见颜色、纹路与形状' },
    ],
  },
];

export function getDiagnosisType(id) {
  const type = DIAGNOSIS_TYPES.find(item => item.id === id);
  if (!type) throw new RangeError(`Unsupported observation type: ${id}`);
  return type;
}
