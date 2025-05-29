import React, { useRef, useEffect, useState } from 'react';
import { useWebcam } from '../hooks/useWebcam';

interface WebcamComponentProps {
  isActive: boolean;
  onImageCapture: (imageDataUrl: string) => void;
  captureInterval?: number;
  triggerCapture: boolean;
}

export const WebcamComponent: React.FC<WebcamComponentProps> = ({
  isActive,
  onImageCapture,
  captureInterval = 10000,
  triggerCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastCaptureTime, setLastCaptureTime] = useState<number>(0);
  
  const { stream, error, startCamera, stopCamera } = useWebcam();

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isActive && triggerCapture) {
      // Capture immediately when voice input starts
      captureImage();
      
      // Set up interval for periodic captures
      intervalId = setInterval(() => {
        captureImage();
      }, captureInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, triggerCapture, captureInterval]);

  const captureImage = () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    
    const now = Date.now();
    if (now - lastCaptureTime < 2000) return; // Prevent too frequent captures
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get data URL from canvas
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Send to parent component
    onImageCapture(imageDataUrl);
    setLastCaptureTime(now);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-2 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-500"
            >
              <path d="M18 6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h12" />
              <circle cx="17" cy="17" r="3" />
              <path d="m22 22-1.5-1.5" />
            </svg>
            <p className="text-gray-400">Camera is off</p>
            {error && (
              <p className="text-red-400 text-sm mt-2">
                Error: {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};