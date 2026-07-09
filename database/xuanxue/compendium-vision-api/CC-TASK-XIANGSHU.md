# CC-TASK-XIANGSHU.md — 新增模块：面相 + 手相（摄像头/上传图片 → AI视觉分析）

> 在现有应用中新增两个模块：面相分析和手相分析。
> 核心能力：开摄像头拍照 或 上传图片 → 发送给 Claude API（Vision）→ AI返回分析结果。

---

## 技术方案

### 关键点：Claude API 支持图片输入

```javascript
// Claude Messages API 可以接收 base64 图片
// 把拍到的照片转成 base64，放在 messages 的 content 里

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,  // 面相或手相的系统提示词
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",  // 或 image/png
            data: base64ImageData       // 不含 data:image/jpeg;base64, 前缀
          }
        },
        {
          type: "text",
          text: USER_PROMPT  // 分析指令
        }
      ]
    }]
  })
});
```

---

## 功能流程

### 面相模块

```
用户打开「面相分析」
  ↓
选择输入方式：
  [开启摄像头拍照]  或  [上传照片]
  ↓
摄像头模式：
  - 调用 navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  - 显示实时预览（<video> 元素）
  - 显示对齐参考框（椭圆形脸部轮廓线）
  - 用户点击「拍照」→ 用 <canvas> 截取当前帧 → 转 base64
  ↓
上传模式：
  - <input type="file" accept="image/*" capture="user">
  - 读取文件 → FileReader → base64
  ↓
显示预览 + [重拍] [开始分析] 按钮
  ↓
点击「开始分析」→ 调用 Claude API（带图片）
  ↓
显示 AI 分析结果（逐字打出效果）
```

### 手相模块

```
用户打开「手相分析」
  ↓
选择输入方式：
  [开启摄像头拍照]  或  [上传照片]
  ↓
摄像头模式：
  - 调用 getUserMedia({ video: { facingMode: 'environment' } })
    注意：手相用后置摄像头更好（拍自己的手掌）
    如果是桌面端，用默认摄像头
  - 显示手掌对齐参考框
  - 提示文字："请将手掌正面朝向摄像头，手指自然张开"
  ↓
后续同面相流程
```

---

## 摄像头组件实现

```jsx
import { useState, useRef, useCallback } from 'react';

function CameraCapture({ onCapture, facingMode = 'user', guideType = 'face' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      alert('无法访问摄像头：' + err.message);
    }
  }, [facingMode]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    // 去掉 "data:image/jpeg;base64," 前缀
    const base64Data = base64.split(',')[1];
    setCaptured(base64);
    onCapture(base64Data);
    
    // 停止摄像头
    video.srcObject?.getTracks().forEach(t => t.stop());
    setStreaming(false);
  }, [onCapture]);

  return (
    <div className="camera-container">
      {!captured ? (
        <>
          <video ref={videoRef} autoPlay playsInline 
                 style={{ display: streaming ? 'block' : 'none' }} />
          {/* 对齐参考线 */}
          {streaming && guideType === 'face' && (
            <div className="face-guide">
              {/* 椭圆形脸部轮廓参考线（CSS绘制） */}
            </div>
          )}
          {streaming && guideType === 'palm' && (
            <div className="palm-guide">
              {/* 手掌轮廓参考线 */}
            </div>
          )}
          {!streaming && <button onClick={startCamera}>开启摄像头</button>}
          {streaming && <button onClick={capture}>拍照</button>}
        </>
      ) : (
        <>
          <img src={captured} alt="captured" />
          <button onClick={() => { setCaptured(null); startCamera(); }}>重拍</button>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// 图片上传备选
function ImageUpload({ onCapture }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      onCapture(base64Data);
    };
    reader.readAsDataURL(file);
  };

  return <input type="file" accept="image/*" onChange={handleFile} />;
}
```

---

## AI Prompt

### 面相分析

```javascript
const FACE_SYSTEM_PROMPT = (style) => `
你是一位精通中国传统面相学的相术师。${style === 'casual'
  ? '你说话温和有趣，像长辈给后辈看面相一样亲切自然。'
  : '你用专业术语分析，引用麻衣神相等经典，系统而深入。'}

分析流程——请严格按此顺序：

1. **面型判断**：金形/木形/水形/火形/土形，给出判断依据
2. **三停分析**：上停(额头到眉)·中停(眉到鼻尖)·下停(鼻尖到下巴)的比例
3. **五官逐一分析**：
   - 额头：宽窄·饱满度·发际线
   - 眉毛：浓淡·长短·形状·眉间距
   - 眼睛：大小·神采·眼型·卧蚕
   - 鼻子：鼻梁高低·鼻头形状·鼻翼
   - 嘴巴：大小·唇厚薄·嘴角
   - 耳朵（如可见）：大小·耳垂·位置
4. **印堂（命宫）**：宽窄·明暗
5. **气色**：整体面部气色判断
6. **综合论断**：
   - 性格特点（2-3句）
   - 事业方向（适合什么）
   - 财运倾向
   - 感情特点
   - 健康提示
7. **开运建议**（1-2条实用建议）

规则：
- 多说优点和特色，少说"不好"
- 凡是负面特征，用"需要注意"代替"不好"
- 气色判断要谨慎——可能是光线问题，需说明
- 如果照片不清晰/角度不好，直接说明而不是硬分析
- 结尾加免责声明

⚠️ 你分析的是面部特征与传统相学的对应关系，不是在做医学诊断或性格测评。
`;

const FACE_USER_PROMPT = `
请根据这张照片进行面相分析。

如果照片质量不够好（太暗、太模糊、角度太偏、遮挡太多），请先说明，然后基于可见部分尽量分析。

请按照面型→三停→五官→印堂→气色→综合→建议的顺序给出完整分析。
`;
```

### 手相分析

```javascript
const PALM_SYSTEM_PROMPT = (style) => `
你是一位精通中国传统手相学的相术师。${style === 'casual'
  ? '你说话亲切自然，用通俗语言把掌纹的含义解释清楚。'
  : '你用专业术语分析，引用传统手相经典。'}

分析流程——请严格按此顺序：

1. **手型判断**：金形/木形/水形/火形/土形，给出依据
2. **三大主线**：
   - 生命线：长短·深浅·弧度·特殊标记（岛纹/链纹/分支/断裂）
   - 智慧线：长短·深浅·走向（直/弯）·起点（与生命线关系）
   - 感情线：长短·深浅·走向·终点位置
   ⚠️ 必须说明：生命线长短≠寿命长短
3. **辅助线**（如可见）：
   - 命运线（事业线）：有无·走向
   - 太阳线（成功线）：有无
   - 婚姻线：条数·长短
4. **掌丘**（如能判断）：哪些丘位比较丰隆或凹陷
5. **手指**（如可见）：手指比例·指缝
6. **综合论断**：
   - 性格特点
   - 事业倾向
   - 感情特点
   - 财运倾向
   - 健康提示
7. **建议**（1-2条）

规则：
- 多说积极面·特色·优势
- "没有命运线"不是坏事——说明自由型/创业型
- "生命线短"一定要强调不代表短寿
- 如果照片不清晰/掌纹看不清，直接说明
- 区分左右手（如果用户说明了哪只手）
- 结尾加免责声明

⚠️ 你分析的是掌纹特征与传统手相学的对应关系，不是在做医学诊断。
`;

const PALM_USER_PROMPT = (hand = '惯用手') => `
请根据这张手掌照片进行手相分析。这是${hand}。

如果照片质量不够好（掌纹不清晰、角度不对、光线不足），请先说明，然后基于可见部分尽量分析。

请按照手型→三大主线→辅助线→掌丘→综合→建议的顺序给出完整分析。
`;
```

---

## UI设计

### 面相页面

```
┌─────────────────────────────────────┐
│  面相分析                            │
│                                     │
│  ┌─────────────────────────┐       │
│  │                         │       │
│  │    摄像头预览/照片       │       │
│  │    (椭圆脸部参考线)     │       │
│  │                         │       │
│  └─────────────────────────┘       │
│                                     │
│  [📷 拍照分析]  [📁 上传照片]       │
│                                     │
│  ── AI面相分析 ──                   │
│                                     │
│  面型：土形面（方圆·敦厚……）        │
│  三停：上停饱满·中停略长……          │
│  ……                                │
│  综合：性格稳重务实……               │
│                                     │
│  ⚠️ 仅供趣味参考                    │
└─────────────────────────────────────┘
```

### 手相页面

```
┌─────────────────────────────────────┐
│  手相分析                            │
│                                     │
│  ┌─────────────────────────┐       │
│  │                         │       │
│  │    摄像头预览/照片       │       │
│  │    (手掌参考线)         │       │
│  │                         │       │
│  └─────────────────────────┘       │
│                                     │
│  左右手：[左手(先天)] [右手(后天)]   │
│  [📷 拍照分析]  [📁 上传照片]       │
│                                     │
│  ── AI手相分析 ──                   │
│                                     │
│  手型：木形手（长掌·指长……）         │
│  生命线：深而清晰·弧度大……          │
│  智慧线：略向下弯·长……              │
│  ……                                │
│                                     │
│  ⚠️ 仅供趣味参考                    │
└─────────────────────────────────────┘
```

---

## 集成位置

在现有应用的导航中，加入「相术」分类（与六爻/八字/风水/中医并列）：

```
占算模块新增：
  [六爻] [八字] [梅花] [紫微] [奇门] [风水] [面相🆕] [手相🆕]

或者单独开一个「相术」Tab：
  [面相分析] [手相分析]
```

---

## 注意事项

```
1. 摄像头权限：必须 HTTPS 环境才能调用（localhost 开发时例外）
2. 移动端适配：手机拍照是最主要场景，确保移动端体验好
3. 图片压缩：拍照后压缩到 1280px 以内，JPEG quality 0.85
   避免base64太大导致API请求超时
4. 加载状态：AI分析需要几秒，显示"正在观相中…"的loading
5. 隐私提示：在开启摄像头前显示提示——照片仅发送给AI分析，不存储
6. 离线兜底：如果API不可用，显示手动分析指引（教用户自己看）
```

---

## 知识库文件

CC实现AI提示词时，可参考以下知识文件获取详细断语：
- `10-xiangshu/01-mianxiang.md` — 面相完整知识（三停·五官·十二宫·气色）
- `10-xiangshu/02-shouxiang.md` — 手相完整知识（主线·辅线·掌丘·手型）

可以把关键数据表（五行面型表·十二宫表·主线判断规则）精简后嵌入system prompt。

---

## 做完后更新

```
1. 更新 CHANGELOG.md
2. 更新 CLAUDE.md 的文件索引（加入 10-xiangshu 目录）
```
