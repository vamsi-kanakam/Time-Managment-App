import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, Check, Loader, AlertCircle, Upload, FileText, Eye } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useOCR } from '../hooks/useOCR';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const { stream, isStreaming, startCamera, stopCamera, capturePhoto } = useCamera();
  const { extractTextFromImage, isProcessing: isOCRProcessing, progress } = useOCR();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showTextPreview, setShowTextPreview] = useState(false);

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
    setExtractedText('');
    setShowTextPreview(false);
    try {
      await startCamera();
    } catch (err) {
      setCameraError('Could not access the camera. Please check your device and browser settings.');
      setIsCameraLoading(false);
    }
  }, [startCamera]);

  useEffect(() => {
    handleStartCamera();
    return () => {
      stopCamera();
    };
  }, [handleStartCamera, stopCamera]);

  const handleCapture = () => {
    const imageUrl = capturePhoto(videoRef.current);
    if (imageUrl) {
      setCapturedImage(imageUrl);
      stopCamera();
    }
  };
  
  const handleBack = () => {
    stopCamera();
    onBack();
  };

  const handlePreviewText = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    try {
      const result = await extractTextFromImage(capturedImage);
      setExtractedText(result.text);
      setShowTextPreview(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractedText('Failed to extract text from image. Please try again with better lighting or a clearer image.');
      setShowTextPreview(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      setIsProcessing(true);
      // Small delay to show processing state
      await new Promise(resolve => setTimeout(resolve, 500));
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setExtractedText('');
    setShowTextPreview(false);
    handleStartCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setCapturedImage(result);
          setExtractedText('');
          setShowTextPreview(false);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setUploadError('PDF upload is not supported yet. Please upload an image.');
    } else {
      setUploadError('Unsupported file type. Please upload an image.');
    }
  };

  if (isProcessing && !isOCRProcessing) {
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
              accept="image/*"
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
            <div className="flex gap-4 justify-center mb-4">
              <button 
                onClick={handlePreviewText} 
                disabled={isOCRProcessing}
                className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOCRProcessing ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />}
                Preview Text
              </button>
              <button onClick={handleRetake} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                <X size={16} /> Retake
              </button>
              <button onClick={handleConfirm} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Check size={16} /> Process Diary
              </button>
            </div>

            {/* OCR Progress */}
            {isOCRProcessing && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-900">{progress.status}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Text Preview */}
            {showTextPreview && extractedText && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Extracted Text:</h4>
                </div>
                <div className="max-h-32 overflow-y-auto text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                  {extractedText || 'No text could be extracted from the image.'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for best OCR results:</h4>
        <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
          <li>Ensure good lighting for clear text visibility</li>
          <li>Keep the diary page flat and avoid shadows</li>
          <li>Make sure all text is within the frame</li>
          <li>Hold the camera steady for a sharp image</li>
          <li>For handwritten text, write clearly and avoid cursive when possible</li>
          <li>Use the "Preview Text" button to check if text was extracted correctly</li>
        </ul>
      </div>
    </div>
  );
};