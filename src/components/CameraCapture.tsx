import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, Check, Loader, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useOCR } from '../hooks/useOCR';
import { useDocumentProcessor } from '../hooks/useDocumentProcessor';
import { FileUploadZone } from './FileUploadZone';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onBack: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onBack }) => {
  const { stream, isStreaming, startCamera, stopCamera, capturePhoto } = useCamera();
  const { extractTextFromImage, isProcessing: isOCRProcessing, progress } = useOCR();
  const { processDocument, isProcessing: isDocProcessing, progress: docProgress } = useDocumentProcessor();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    setShowUploadZone(false);
    try {
      await startCamera();
    } catch (err) {
      setCameraError('Could not access the camera. Please check your device and browser settings.');
      setIsCameraLoading(false);
      setShowUploadZone(true);
    }
  }, [startCamera]);

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

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    
    try {
      const result = await processDocument(file);
      
      if (result.fileType === 'image') {
        // For images, set as captured image for OCR processing
        setCapturedImage(result.text); // result.text contains the data URL for images
        setShowUploadZone(false);
      } else {
        // For documents, show the extracted text directly
        setExtractedText(result.text);
        setShowTextPreview(true);
        setShowUploadZone(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setExtractedText(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowTextPreview(true);
      setShowUploadZone(false);
    }
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
      await new Promise(resolve => setTimeout(resolve, 500));
      onCapture(capturedImage);
    } else if (uploadedFile && extractedText) {
      // For non-image files, we need to create a mock image or handle differently
      // For now, we'll pass the extracted text through the normal flow
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      // Create a data URL with the text content for processing
      const textDataUrl = `data:text/plain;base64,${btoa(extractedText)}`;
      onCapture(textDataUrl);
    }
  };

  const handleRetake = () => {
    setExtractedText('');
    setShowTextPreview(false);
    setCapturedImage(null);
    setUploadedFile(null);
    setShowUploadZone(true);
    stopCamera();
  };

  const isAnyProcessing = isProcessing || isOCRProcessing || isDocProcessing;

  if (isProcessing && !isOCRProcessing && !isDocProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Document</h3>
          <p className="text-gray-600">AI is extracting tasks from your document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scan or Upload Documents</h2>
          <p className="text-gray-600">Upload homework diaries, assignments, or use camera to capture</p>
        </div>
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <X size={20} /> Close
        </button>
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <div className="mb-6">
          <FileUploadZone
            onFileSelect={handleFileSelect}
            onCameraClick={handleStartCamera}
            isProcessing={isDocProcessing}
            progress={docProgress}
          />
        </div>
      )}

      {/* Camera View */}
      {!showUploadZone && !capturedImage && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Camera View</h3>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back to Upload
            </button>
          </div>

          <div className="relative w-full h-96 bg-black flex items-center justify-center">
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
                      Position your document within this frame
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
          </div>
        </div>
      )}

      {/* Captured Image or Document Preview */}
      {(capturedImage || (uploadedFile && showTextPreview)) && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {capturedImage && (
            <div className="relative w-full h-96 bg-black flex items-center justify-center">
              <img src={capturedImage} alt="Captured document" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-4 justify-center mb-4">
              {capturedImage && (
                <button 
                  onClick={handlePreviewText} 
                  disabled={isAnyProcessing}
                  className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOCRProcessing ? <Loader size={16} className="animate-spin" /> : <Eye size={16} />}
                  Preview Text
                </button>
              )}
              <button onClick={handleRetake} className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                <X size={16} /> {capturedImage ? 'Retake' : 'Upload Different File'}
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={isAnyProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={16} /> Process Document
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
                  <Eye className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">
                    {uploadedFile ? `Content from ${uploadedFile.name}:` : 'Extracted Text:'}
                  </h4>
                </div>
                <div className="max-h-32 overflow-y-auto text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                  {extractedText || 'No text could be extracted.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for best results:</h4>
        <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
          <li><strong>Images:</strong> Ensure good lighting and clear text visibility</li>
          <li><strong>Camera:</strong> Hold steady and keep document flat</li>
          <li><strong>Handwriting:</strong> Clear, non-cursive writing works best</li>
          <li><strong>Documents:</strong> PDF and Word files are processed for text content</li>
          <li><strong>File Size:</strong> Keep files under 10MB for faster processing</li>
        </ul>
      </div>
    </div>
  );
};