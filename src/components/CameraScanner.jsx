import React, { useEffect, useImperativeHandle, useRef, forwardRef, useState } from 'react';

// CameraScanner handles:
// - Requesting camera via getUserMedia
// - Displaying the stream
// - Capturing a frame to Blob or DataURL
// Props:
// - facingMode: 'environment' | 'user'
// - onReady: callback when camera is ready
// - className: tailwind classes
// Exposes via ref:
// - capture(): Promise<Blob>
// - stop(): void
const CameraScanner = forwardRef(function CameraScanner(
  { facingMode = 'environment', onReady, className = '' },
  ref
) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (!active) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          onReady?.();
        }
      } catch (e) {
        console.error('Camera error:', e);
        setReady(false);
      }
    }
    init();
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, onReady]);

  useImperativeHandle(ref, () => ({
    async capture() {
      const video = videoRef.current;
      if (!video) throw new Error('Video not ready');
      const canvas = document.createElement('canvas');
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9));
    },
    stop() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    },
  }));

  return (
    <div className={"w-full aspect-video bg-black rounded-lg overflow-hidden " + className}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
        aria-label="Camera preview"
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-white bg-black/50">
          <span className="text-lg">Activating camera…</span>
        </div>
      )}
    </div>
  );
});

export default CameraScanner;
