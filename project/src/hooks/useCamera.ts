import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      console.log('[useCamera] Camera already started');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      console.log('[useCamera] Got stream:', mediaStream);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
    } catch (error) {
      console.error('[useCamera] Error accessing camera:', error);
      setHasPermission(false);
      throw error;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('[useCamera] Stopping camera stream.');
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const isStreaming = !!stream;

  const capturePhoto = useCallback(
    (videoEl: HTMLVideoElement | null) => {
      if (!videoEl || !isStreaming) {
        console.error('[useCamera] Capture failed: Video element not available or not streaming.');
        return null;
      }
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[useCamera] Capture failed: Could not get canvas context.');
        return null;
      }
      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    [isStreaming]
  );

  return {
    stream,
    isStreaming,
    hasPermission,
    startCamera,
    stopCamera,
    capturePhoto,
  };
};