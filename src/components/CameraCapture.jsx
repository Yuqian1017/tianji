import { useState, useRef, useCallback, useEffect } from 'react';
import { openCamera, captureFrame, stopCamera } from '../lib/camera.js';

/**
 * Camera capture component for taking photos.
 * Supports live preview, capture, and retake.
 *
 * Also supports file upload as fallback (e.g., existing photos).
 */
export default function CameraCapture({ onCapture, onCancel, facingMode = 'user' }) {
  const [state, setState] = useState('idle'); // idle | requesting | streaming | captured | error
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null); // base64
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setState('requesting');
    setError('');
    try {
      const stream = await openCamera(facingMode);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState('streaming');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const base64 = captureFrame(videoRef.current);
    setCapturedImage(base64);
    setState('captured');
    // Stop camera after capture
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
  }, []);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const handleCancel = useCallback(() => {
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    setCapturedImage(null);
    setState('idle');
    if (onCancel) onCancel();
  }, [onCancel]);

  // File upload handler
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Strip data:image/xxx;base64, prefix
      const base64 = reader.result.split(',')[1];
      setCapturedImage(base64);
      setState('captured');
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="space-y-3">
      {/* Idle state: show open camera + upload buttons */}
      {state === 'idle' && (
        <div className="flex gap-2">
          <button
            onClick={startCamera}
            className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
              hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body text-sm flex items-center justify-center gap-2"
          >
            <span className="text-lg">📷</span> 打开摄像头
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-[var(--color-surface-dim)] text-[var(--color-text)] py-3 rounded-lg
              border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)] transition-colors font-body text-sm flex items-center justify-center gap-2"
          >
            <span className="text-lg">🖼</span> 上传照片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Requesting permission */}
      {state === 'requesting' && (
        <div className="text-center py-8 text-[var(--color-text-dim)] font-body text-sm">
          <div className="text-2xl mb-2 animate-pulse">📷</div>
          正在请求摄像头权限...
        </div>
      )}

      {/* Live video preview */}
      {state === 'streaming' && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-[var(--color-gold-border)]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl"
              style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="border-2 border-dashed border-white/30 rounded-2xl w-3/4 h-3/4" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCapture}
              className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
            >
              拍照
            </button>
            <button
              onClick={handleCancel}
              className="px-4 text-[var(--color-text-dim)] border border-[var(--color-surface-border)] rounded-lg
                hover:text-[var(--color-text)] transition-colors font-body text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Captured image preview */}
      {state === 'captured' && capturedImage && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-[var(--color-gold-border)]">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="拍摄预览"
              className="w-full rounded-xl"
              style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body"
            >
              使用此照片
            </button>
            <button
              onClick={handleRetake}
              className="px-4 text-[var(--color-text-dim)] border border-[var(--color-surface-border)] rounded-lg
                hover:text-[var(--color-text)] transition-colors font-body text-sm"
            >
              重拍
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="space-y-3">
          <div className="text-center py-6 text-[var(--color-text-dim)] font-body">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm text-red-400">{error}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startCamera}
              className="flex-1 bg-[var(--color-gold-bg)] text-[var(--color-gold)] font-medium py-3 rounded-lg
                hover:bg-[var(--color-gold-bg-hover)] btn-glow font-body text-sm"
            >
              重试
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[var(--color-surface-dim)] text-[var(--color-text)] py-3 rounded-lg
                border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)] transition-colors font-body text-sm"
            >
              改为上传照片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Error message from file upload */}
      {error && state !== 'error' && (
        <div className="text-xs text-red-400 font-body">{error}</div>
      )}
    </div>
  );
}
