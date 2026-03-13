/**
 * MediaPipe integration layer for face and hand landmark detection.
 * Lazy-loads models from Google CDN on first use (~5-10MB each).
 * All processing happens in-browser — no images leave the device.
 */

import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;
let handLandmarker = null;
let filesetResolver = null;

async function getFileset() {
  if (!filesetResolver) {
    filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
  }
  return filesetResolver;
}

/**
 * Initialize FaceLandmarker (468 face mesh points).
 * @param {function} [onProgress] - Optional callback for status updates
 * @returns {FaceLandmarker}
 */
export async function initFaceLandmarker(onProgress) {
  if (faceLandmarker) return faceLandmarker;

  if (onProgress) onProgress('正在下载面部识别模型...');

  const fileset = await getFileset();

  faceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
  });

  if (onProgress) onProgress('面部识别模型加载完成');
  return faceLandmarker;
}

/**
 * Initialize HandLandmarker (21 hand points).
 * @param {function} [onProgress] - Optional callback for status updates
 * @returns {HandLandmarker}
 */
export async function initHandLandmarker(onProgress) {
  if (handLandmarker) return handLandmarker;

  if (onProgress) onProgress('正在下载手部识别模型...');

  const fileset = await getFileset();

  handLandmarker = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numHands: 2,
  });

  if (onProgress) onProgress('手部识别模型加载完成');
  return handLandmarker;
}

/**
 * Detect face landmarks from an image element.
 * @param {HTMLImageElement} imageEl
 * @returns {Array|null} Array of normalized landmarks [{x, y, z}, ...] or null
 */
export async function detectFace(imageEl) {
  const landmarker = await initFaceLandmarker();
  const result = landmarker.detect(imageEl);
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
    console.warn('[mediapipe] No face detected in image');
    return null;
  }
  return result.faceLandmarks[0]; // first face
}

/**
 * Detect hand landmarks from an image element.
 * @param {HTMLImageElement} imageEl
 * @returns {{ landmarks: Array, handedness: string }|null}
 */
export async function detectHand(imageEl) {
  const landmarker = await initHandLandmarker();
  const result = landmarker.detect(imageEl);
  if (!result.landmarks || result.landmarks.length === 0) {
    console.warn('[mediapipe] No hand detected in image');
    return null;
  }
  return {
    landmarks: result.landmarks[0],
    handedness: result.handednesses?.[0]?.[0]?.categoryName || 'Unknown',
  };
}

// ========== Face Feature Analysis (468 landmarks) ==========

// Helper: Euclidean distance between two 3D landmarks
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// Helper: 2D distance (ignore depth)
function dist2d(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Analyze facial features from 468 face mesh landmarks.
 * Key landmark indices reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 *
 * @param {Array<{x:number, y:number, z:number}>} lm - 468 face landmarks (normalized 0-1)
 * @returns {object} Extracted face features
 */
export function analyzeFaceFeatures(lm) {
  // === Three Stops (三停) ===
  // Forehead top (#10), brow line (#9), nose tip (#1), chin bottom (#152)
  const foreheadY = lm[10].y;
  const browY = lm[9].y;
  const noseTipY = lm[1].y;
  const chinY = lm[152].y;

  const totalHeight = chinY - foreheadY;
  const upperStop = ((browY - foreheadY) / totalHeight * 100).toFixed(1);
  const middleStop = ((noseTipY - browY) / totalHeight * 100).toFixed(1);
  const lowerStop = ((chinY - noseTipY) / totalHeight * 100).toFixed(1);

  // === Face Shape (面型) ===
  // Cheekbone width: #234 (left) ↔ #454 (right)
  const faceWidth = dist2d(lm[234], lm[454]);
  const faceHeight = dist2d(lm[10], lm[152]);
  const widthHeightRatio = (faceWidth / faceHeight).toFixed(2);

  // Jaw width: #172 (left jaw) ↔ #397 (right jaw)
  const jawWidth = dist2d(lm[172], lm[397]);
  const jawCheekRatio = (jawWidth / faceWidth).toFixed(2);

  let faceShape;
  const whr = parseFloat(widthHeightRatio);
  const jcr = parseFloat(jawCheekRatio);
  if (whr > 0.85 && jcr > 0.85) faceShape = 'earth'; // 方圆厚实 → 土
  else if (whr > 0.85 && jcr > 0.75) faceShape = 'metal'; // 方脸 → 金
  else if (whr > 0.80 && jcr < 0.75) faceShape = 'water'; // 圆脸下巴圆 → 水
  else if (whr < 0.70) faceShape = 'fire'; // 窄长尖 → 火
  else faceShape = 'wood'; // 长脸 → 木

  // === Eyes (眼睛) ===
  // Left eye: inner #133, outer #33; Right eye: inner #362, outer #263
  const leftEyeWidth = dist2d(lm[33], lm[133]);
  const rightEyeWidth = dist2d(lm[362], lm[263]);
  const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
  const eyeToFaceRatio = (avgEyeWidth / faceWidth).toFixed(3);

  // Eye height (openness): left #159 (upper) ↔ #145 (lower)
  const leftEyeHeight = dist2d(lm[159], lm[145]);
  const rightEyeHeight = dist2d(lm[386], lm[374]);
  const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
  const eyeAspect = (avgEyeHeight / avgEyeWidth).toFixed(2);

  // === Inter-eye distance (两眼间距) ===
  const interEyeDist = dist2d(lm[133], lm[362]);
  const interEyeToEye = (interEyeDist / avgEyeWidth).toFixed(2);

  // === Brow gap (眉间距) - inner brow points ===
  // #70 (left inner brow), #300 (right inner brow)
  const browGap = dist2d(lm[70], lm[300]);
  const browGapToEye = (browGap / avgEyeWidth).toFixed(2);

  // === Nose (鼻子) ===
  // Nose bridge: #6 (bridge top), nose tip: #1
  // Nose width: #98 (left alar) ↔ #327 (right alar)
  const noseWidth = dist2d(lm[98], lm[327]);
  const noseToFace = (noseWidth / faceWidth).toFixed(3);
  // Nose bridge height relative to face (z-depth of #6 vs cheeks)
  const noseBridgeDepth = ((lm[6].z - (lm[234].z + lm[454].z) / 2) * -1).toFixed(3);

  // === Mouth (嘴巴) ===
  // Mouth corners: #61 (left) ↔ #291 (right)
  const mouthWidth = dist2d(lm[61], lm[291]);
  const mouthToFace = (mouthWidth / faceWidth).toFixed(3);

  // Upper lip: #13 (top), Lower lip: #14 (bottom), mouth center: #0
  const upperLipThickness = dist2d(lm[0], lm[13]);
  const lowerLipThickness = dist2d(lm[0], lm[14]);
  const lipRatio = (upperLipThickness / (lowerLipThickness || 0.001)).toFixed(2);

  // === Chin (下巴) ===
  // Chin length: nose base (#2) to chin (#152)
  const chinLength = dist2d(lm[2], lm[152]);
  const chinToFace = (chinLength / faceHeight).toFixed(3);

  // === Yintang / 印堂 (space between brows) ===
  const yintangWidth = browGap;
  const yintangToFace = (yintangWidth / faceWidth).toFixed(3);

  // === Symmetry (对称性) ===
  // Compare left vs right distances from midline (#10 x-coordinate as midline)
  const midX = (lm[10].x + lm[152].x) / 2;
  const leftCheekDist = Math.abs(lm[234].x - midX);
  const rightCheekDist = Math.abs(lm[454].x - midX);
  const leftEyeDist = Math.abs(lm[33].x - midX);
  const rightEyeDist = Math.abs(lm[263].x - midX);
  const leftMouthDist = Math.abs(lm[61].x - midX);
  const rightMouthDist = Math.abs(lm[291].x - midX);

  const symmetryScores = [
    1 - Math.abs(leftCheekDist - rightCheekDist) / Math.max(leftCheekDist, rightCheekDist),
    1 - Math.abs(leftEyeDist - rightEyeDist) / Math.max(leftEyeDist, rightEyeDist),
    1 - Math.abs(leftMouthDist - rightMouthDist) / Math.max(leftMouthDist, rightMouthDist),
    1 - Math.abs(leftEyeWidth - rightEyeWidth) / Math.max(leftEyeWidth, rightEyeWidth),
  ];
  const symmetry = (symmetryScores.reduce((a, b) => a + b, 0) / symmetryScores.length * 100).toFixed(1);

  return {
    faceShape,
    widthHeightRatio: parseFloat(widthHeightRatio),
    jawCheekRatio: parseFloat(jawCheekRatio),
    threeStops: {
      upper: parseFloat(upperStop),
      middle: parseFloat(middleStop),
      lower: parseFloat(lowerStop),
    },
    eyes: {
      toFaceRatio: parseFloat(eyeToFaceRatio),
      aspect: parseFloat(eyeAspect),
      interEyeToEye: parseFloat(interEyeToEye),
    },
    brows: {
      gapToEye: parseFloat(browGapToEye),
    },
    nose: {
      toFaceRatio: parseFloat(noseToFace),
      bridgeDepth: parseFloat(noseBridgeDepth),
    },
    mouth: {
      toFaceRatio: parseFloat(mouthToFace),
      lipRatio: parseFloat(lipRatio),
    },
    chin: {
      toFaceRatio: parseFloat(chinToFace),
    },
    yintang: {
      toFaceRatio: parseFloat(yintangToFace),
    },
    symmetry: parseFloat(symmetry),
  };
}

// ========== Hand Feature Analysis (21 landmarks) ==========

/**
 * Analyze hand features from 21 hand landmarks.
 *
 * Landmark indices:
 * 0: Wrist
 * 1-4: Thumb (CMC, MCP, IP, TIP)
 * 5-8: Index (MCP, PIP, DIP, TIP)
 * 9-12: Middle (MCP, PIP, DIP, TIP)
 * 13-16: Ring (MCP, PIP, DIP, TIP)
 * 17-20: Pinky (MCP, PIP, DIP, TIP)
 *
 * @param {Array<{x:number, y:number, z:number}>} lm - 21 hand landmarks
 * @param {string} handedness - 'Left' or 'Right'
 * @returns {object} Extracted hand features
 */
export function analyzeHandFeatures(lm, handedness = 'Unknown') {
  // === Palm dimensions ===
  // Palm length: wrist (#0) to middle finger MCP (#9)
  const palmLength = dist(lm[0], lm[9]);
  // Palm width: index MCP (#5) to pinky MCP (#17)
  const palmWidth = dist(lm[5], lm[17]);
  const palmRatio = (palmLength / palmWidth).toFixed(2);

  // === Hand type (五行手型) ===
  const pr = parseFloat(palmRatio);
  let handType;
  if (pr > 1.2) handType = 'wood'; // 长掌指长
  else if (pr > 1.05) handType = 'fire'; // 掌长指尖
  else if (pr > 0.90) handType = 'metal'; // 方掌
  else if (pr > 0.80) handType = 'earth'; // 厚掌短粗
  else handType = 'water'; // 圆掌

  // === Finger lengths (relative to palm) ===
  const fingerLengths = {
    thumb: dist(lm[2], lm[4]) / palmLength,
    index: dist(lm[5], lm[8]) / palmLength,
    middle: dist(lm[9], lm[12]) / palmLength,
    ring: dist(lm[13], lm[16]) / palmLength,
    pinky: dist(lm[17], lm[20]) / palmLength,
  };

  // Round values
  for (const key of Object.keys(fingerLengths)) {
    fingerLengths[key] = parseFloat(fingerLengths[key].toFixed(3));
  }

  // === Index/Ring ratio (2D:4D) ===
  const indexLength = dist(lm[5], lm[8]);
  const ringLength = dist(lm[13], lm[16]);
  const indexRingRatio = parseFloat((indexLength / ringLength).toFixed(3));

  // === Finger gaps (spread) ===
  // Angle between adjacent finger tips
  const fingerGaps = {
    thumbIndex: angleBetween(lm[0], lm[4], lm[8]),
    indexMiddle: angleBetween(lm[0], lm[8], lm[12]),
    middleRing: angleBetween(lm[0], lm[12], lm[16]),
    ringPinky: angleBetween(lm[0], lm[16], lm[20]),
  };

  // === Mound estimates (掌丘) ===
  // Based on relative positions and z-depth of key areas
  const moundEstimates = {
    jupiter: estimateMoundProminence(lm[5], lm[6], lm[0]), // below index
    saturn: estimateMoundProminence(lm[9], lm[10], lm[0]), // below middle
    apollo: estimateMoundProminence(lm[13], lm[14], lm[0]), // below ring
    mercury: estimateMoundProminence(lm[17], lm[18], lm[0]), // below pinky
    venus: estimateMoundProminence(lm[1], lm[2], lm[0]), // thumb base
  };

  // Pinky length relative: does it reach ring finger first joint?
  const pinkyReachesRingJoint = lm[20].y < lm[14].y; // tip above ring DIP

  return {
    handType,
    palmRatio: parseFloat(palmRatio),
    fingerLengths,
    indexRingRatio,
    fingerGaps,
    moundEstimates,
    pinkyReachesRingJoint,
    handedness,
  };
}

/**
 * Calculate angle (in degrees) between two vectors from a common origin.
 */
function angleBetween(origin, p1, p2) {
  const v1 = { x: p1.x - origin.x, y: p1.y - origin.y };
  const v2 = { x: p2.x - origin.x, y: p2.y - origin.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  const angle = Math.atan2(Math.abs(cross), dot) * (180 / Math.PI);
  return parseFloat(angle.toFixed(1));
}

/**
 * Estimate mound prominence from z-depth of nearby landmarks.
 * Returns 'prominent' | 'normal' | 'flat'
 */
function estimateMoundProminence(mcp, pip, wrist) {
  // More negative z = closer to camera = more prominent
  const avgDepth = (mcp.z + pip.z) / 2;
  const wristDepth = wrist.z;
  const diff = wristDepth - avgDepth;
  if (diff > 0.02) return 'prominent';
  if (diff > 0.005) return 'normal';
  return 'flat';
}
