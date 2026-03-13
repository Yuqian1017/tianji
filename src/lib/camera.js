/**
 * Camera utility functions for 望诊 (visual diagnosis).
 * Pure functions, no React dependency.
 */

/**
 * Open the camera and return a MediaStream.
 * Prefers user-facing camera (selfie mode for face/tongue photos).
 */
export async function openCamera(facingMode = 'user') {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('此浏览器不支持摄像头功能');
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
      audio: false,
    });
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头');
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('未检测到摄像头设备');
    }
    throw new Error(`摄像头打开失败: ${err.message}`);
  }
}

/**
 * Capture the current frame from a video element as base64 JPEG.
 * @param {HTMLVideoElement} videoEl
 * @returns {string} base64-encoded JPEG data (without data: prefix)
 */
export function captureFrame(videoEl) {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);

  // Get base64 without the data:image/jpeg;base64, prefix
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return dataUrl.split(',')[1];
}

/**
 * Stop all tracks on a MediaStream.
 */
export function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
