import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, Check, Loader, AlertCircle, Upload } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const { stream, isStreaming, startCamera, stopCamera, capturePhoto } = useCamera();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Effect to attach the camera stream to the video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsCameraLoading(false);
    }
  }, [stream]);

  const handleStartCamera = useCallback(async () => {
    setCapturedImage(null);
    setCameraError(null);
    setIsCameraLoading(true);
    try {
      await startCamera();
    } catch (err) {
      setCameraError('Could not access the camera. Please check your device and browser settings.');
      setIsCameraLoading(false);
    }
  }, [startCamera]);

  // This effect handles starting the camera on mount and cleaning up on unmount.
  // The cleanup is a fallback for robust resource management.
  useEffect(() => {
    handleStartCamera();
    return () => {
      // This will run when the component unmounts, ensuring the camera is off.
      stopCamera();
    };
  }, [handleStartCamera, stopCamera]);

  const handleCapture = () => {
    const imageUrl = capturePhoto(videoRef.current);
    if (imageUrl) {
      setCapturedImage(imageUrl);
      stopCamera(); // Stop the stream immediately after capture
    }
  };
  
  // --- THIS IS THE KEY FIX ---
  // Create a new handler for the back button that guarantees camera cleanup.
  const handleBack = () => {
    stopCamera(); // Explicitly stop the camera
    onBack();     // Then call the parent's onBack function
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCapture(capturedImage);
      // The camera is already stopped by handleCapture, and the unmount
      // effect will handle final cleanup, so no action is needed here.
    }
  };

  const handleRetake = () => {
    handleStartCamera(); // This will request a new stream
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setUploadedImage(result);
          setCapturedImage(result);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setUploadError('PDF upload is not supported yet. Please upload an image.');
    } else {
      setUploadError('Unsupported file type. Please upload an image.');
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[500px]">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scan Homework Diary</h2>
          <p className="text-gray-600">Capture your diary page to extract tasks automatically</p>
        </div>
        {/* Use the new handleBack function here */}
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <X size={20} /> Close
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Upload File Feature */}
        <div className="flex items-center justify-center gap-4 p-4 border-b border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Upload size={18} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {uploadError && <span className="text-red-500 text-sm ml-2">{uploadError}</span>}
        </div>
        <div className="relative w-full h-96 bg-black flex items-center justify-center">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured diary" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
              />
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gray-800 bg-opacity-75">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Camera Error</h3>
                  <p className="text-gray-300 mb-6">{cameraError}</p>
                  <button onClick={handleStartCamera} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Try Again</button>
                </div>
              )}
              {isCameraLoading && !cameraError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Starting Camera...</h3>
                  <p className="text-gray-300">Please grant camera permission if prompted.</p>
                </div>
              )}
              {isStreaming && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white border-dashed rounded-lg w-11/12 max-w-md h-5/6 flex items-center justify-center">
                      <p className="text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded">
                        Position your homework diary within this frame
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button onClick={handleCapture} className="bg-white text-gray-900 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100" aria-label="Capture photo">
                      <Camera size={24} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {capturedImage && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-4 justify-center">
              <button onClick={handleRetake} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                <X size={16} /> Retake
              </button>
              <button onClick={handleConfirm} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Check size={16} /> Process Diary
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
          <li>Ensure good lighting for clear text visibility.</li>
          <li>Keep the diary page flat and avoid shadows.</li>
          <li>Make sure all text is within the frame.</li>
          <li>Hold the camera steady for a sharp image.</li>
        </ul>
      </div>
    </div>
  );
};