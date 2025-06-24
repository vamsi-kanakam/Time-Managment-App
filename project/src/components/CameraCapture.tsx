import React, { useState, useEffect } from 'react';
import { Camera, X, Check, Loader, AlertCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const { videoRef, isStreaming, hasPermission, startCamera, stopCamera, capturePhoto } = useCamera();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleCapture = () => {
    const imageUrl = capturePhoto();
    if (imageUrl) {
      setCapturedImage(imageUrl);
      stopCamera();
    }
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      setIsProcessing(true);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      onCapture(capturedImage);
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Diary</h3>
          <p className="text-gray-600">AI is extracting tasks from your homework diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scan Homework Diary</h2>
          <p className="text-gray-600">Capture your diary page to extract tasks automatically</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
          Close
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Camera Permission */}
        {hasPermission === null && (
          <div className="p-12 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Camera Access Required</h3>
            <p className="text-gray-600 mb-6">We need access to your camera to scan your homework diary</p>
            <button
              onClick={handleStartCamera}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Camera Permission Denied */}
        {hasPermission === false && (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Camera Access Denied</h3>
            <p className="text-gray-600 mb-6">Please enable camera access in your browser settings to continue</p>
            <button
              onClick={handleStartCamera}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Camera Stream */}
        {isStreaming && !capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-96 object-cover bg-black"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-80 h-60 flex items-center justify-center">
                <p className="text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded">
                  Position your homework diary within this frame
                </p>
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                onClick={handleCapture}
                className="bg-white text-gray-900 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured diary"
              className="w-full h-96 object-cover"
            />
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  <X size={16} />
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check size={16} />
                  Process Diary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Ensure good lighting for clear text visibility</li>
          <li>• Keep the diary page flat and avoid shadows</li>
          <li>• Make sure all text is within the frame</li>
          <li>• Hold the camera steady for a sharp image</li>
        </ul>
      </div>
    </div>
  );
};