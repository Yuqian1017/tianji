# CC-TASK-XIANGSHU.md — 面相 + 手相模块（前端ML提取 + 文字LLM解读）

> **架构核心**：图片不出设备。前端ML提取特征 → 结构化文字 → 发给任意LLM。
> 成本极低·隐私友好·效果稳定。

---

## 一、架构

```
用户拍照/上传
    ↓
浏览器端 MediaPipe（免费·无API调用）
    ↓ 提取关键点坐标
前端JS计算特征（面型·三停比例·五官尺寸·掌纹走向……）
    ↓ 输出结构化文字
发送给LLM（只发文字·不发图片）
    ↓
AI根据文字特征 + 面相/手相规则给出解读
```

**成本对比**：
- Vision API：每次 ~$0.01-0.03（图片token贵）
- 本方案：每次 ~$0.001-0.003（纯文字·几百token）
- **省 90%+**

**额外好处**：
- 图片永远不离开浏览器 → 隐私宣传点
- 不依赖特定Vision API → 换任何LLM都行
- 结构化数据 → 每次分析角度一致·不会遗漏

---

## 二、技术依赖

### MediaPipe（Google开源·浏览器端运行）

```
面相：@mediapipe/face_mesh — 468个面部关键点
手相：@mediapipe/hands — 21个手部关键点

安装：npm install @mediapipe/tasks-vision
（新版统一包，含FaceLandmarker和HandLandmarker）
```

---

## 三、面相模块

### 关键点提取 → 计算特征

```javascript
function analyzeFaceFeatures(landmarks) {
  // landmarks = [{x, y, z}, ...] 共468点，归一化坐标(0-1)
  const features = {};
  
  // 三停比例
  const hairlineY = landmarks[10].y;
  const eyebrowY = landmarks[9].y;
  const noseTipY = landmarks[1].y;
  const chinY = landmarks[152].y;
  const total = chinY - hairlineY;
  features.upperStop = ((eyebrowY - hairlineY) / total * 100).toFixed(1);
  features.middleStop = ((noseTipY - eyebrowY) / total * 100).toFixed(1);
  features.lowerStop = ((chinY - noseTipY) / total * 100).toFixed(1);
  
  // 面型（宽高比）
  const faceW = landmarks[454].x - landmarks[234].x;
  const ratio = faceW / total;
  features.faceShape = ratio > 0.85 ? '方圆脸（土/金形）' :
                       ratio > 0.75 ? '标准脸' :
                       ratio > 0.65 ? '长脸（木形）' : '窄长脸（火形）';
  
  // 眼睛·眉毛·鼻子·嘴巴·印堂·下巴·对称性
  // ... 具体参照关键点索引计算尺寸比例
  
  return features;
}
```

### 生成文字 → 发给LLM

```javascript
function buildFaceDescription(f) {
  return `面相特征（ML提取）：
面型：${f.faceShape}
三停：上${f.upperStop}% 中${f.middleStop}% 下${f.lowerStop}%
眼睛：${f.eyeSize} 眉间距：${f.browGap} 眉长：${f.browLength}
鼻子：${f.noseHeight} ${f.noseWidth} 嘴巴：${f.mouthSize} ${f.lipThickness}
印堂：${f.yintang} 下巴：${f.chinShape} 对称：${f.symmetry}
请按面相学分析。`;
}
```

**面相模块100%前端ML → 文字LLM，不需要Vision API。**

---

## 四、手相模块

### ML能做的 vs 不能做的

```
✅ MediaPipe Hands 能算：手型·手指长度比例·掌丘隆起·指缝张开度
❌ MediaPipe Hands 不能算：掌纹线条（生命线·智慧线·感情线）
```

### 解决掌纹：问卷选择（免费）+ 可选Vision分析（付费）

```
默认模式（免费）：
  ML提取手型+手指+掌丘 → 显示3-4个掌纹问卷题（带参考图）→ 用户选择 → 综合文字发LLM

高级模式（可选·付费）：
  用户点击「AI视觉深度分析」→ 裁剪掌心区域 → 发Vision API → 更精确的掌纹分析
```

### 掌纹问卷

```javascript
const PALM_LINE_QUESTIONS = [
  {
    id: 'lifeLine', label: '生命线（围绕拇指的弧线）',
    options: [
      '长且深·弧度大', '长但浅·贴近拇指',
      '短但清晰', '有断裂或圈', '看不清'
    ]
  },
  {
    id: 'headLine', label: '智慧线（横穿掌心）',
    options: [
      '直线·很长', '略弯·中等', '明显下弯',
      '和生命线连在一起', '和生命线分开', '看不清'
    ]
  },
  {
    id: 'heartLine', label: '感情线（最上面横线）',
    options: [
      '很长到食指下', '到中指下结束', '食指中指之间',
      '比较直平', '很多分叉', '看不清'
    ]
  },
  {
    id: 'fateLine', label: '命运线（掌心纵线·有的人没有）',
    options: ['有且清晰', '断断续续', '从中间才开始', '没有', '看不清']
  }
];
```

---

## 五、AI Prompt

### 面相（纯文字·便宜）

```javascript
const FACE_SYSTEM_PROMPT = (style) => `
你是精通中国传统面相学的相术师。${style === 'casual'
  ? '说话亲切有趣，像长辈看面相。' : '引用麻衣神相，系统深入。'}
你收到的是ML提取的面部结构化数据。
按面型→三停→五官→印堂→综合(性格·事业·财运·感情·健康)→建议的顺序分析。
多说优点。负面用"需注意"。结尾加免责。`;
```

### 手相（纯文字·便宜）

```javascript
const PALM_SYSTEM_PROMPT = (style) => `
你是精通手相学的相术师。${style === 'casual'
  ? '亲切通俗。' : '引用经典，专业深入。'}
你收到两部分：ML提取的手型数据 + 用户自述的掌纹特征。
⚠️ 生命线长短≠寿命，必须说明。
按手型→主线→掌丘→综合(性格·事业·感情·财运·健康)→建议分析。`;
```

---

## 六、UI流程

```
面相：拍照 → ML处理(1-2秒) → "检测到面部" → 自动发文字给LLM → AI解读
手相：拍照 → ML处理 → 显示手型结果 → 弹出掌纹问卷(3-4题·带参考图) →
     综合发文字给LLM → AI解读
     [可选按钮：AI视觉深度分析(消耗API额度)]
```

### 摄像头

```
面相：前置摄像头 facingMode:'user'
手相：后置摄像头 facingMode:'environment'（拍自己手掌）
都支持上传照片作为备选
拍照前显示对齐参考线（面部椭圆/手掌轮廓）
```

### 隐私提示

```
"您的照片仅在本地浏览器中处理，不会上传至任何服务器。
 仅提取的面部/手部特征数据（文字）会发送给AI进行解读。"
```

---

## 七、npm依赖

```
npm install @mediapipe/tasks-vision
```

---

## 八、知识库

- `10-xiangshu/01-mianxiang.md` — 面相知识（三停·五官·十二宫·气色）
- `10-xiangshu/02-shouxiang.md` — 手相知识（主线·辅线·掌丘·手型）

将关键对照表精简后嵌入system prompt即可。
