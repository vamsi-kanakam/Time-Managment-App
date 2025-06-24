import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image, File, Camera, X, Loader } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onCameraClick: () => void;
  isProcessing?: boolean;
  progress?: number;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  onCameraClick,
  isProcessing = false,
  progress = 0,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    'image/*': 'Images (JPG, PNG, GIF, etc.)',
    'application/pdf': 'PDF Documents',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Documents',
    'text/plain': 'Text Files'
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = useCallback((file: File) => {
    // Validate file type
    const isValidType = 
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain' ||
      file.name.endsWith('.docx');

    if (!isValidType) {
      setError('Unsupported file type. Please upload an image, PDF, Word document, or text file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (type === 'application/pdf') return <FileText className="w-8 h-8" />;
    if (type.includes('word')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
          ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onClick={!isProcessing ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Processing Document...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your files here or click to browse
              </h3>
              <p className="text-gray-600 mb-4">
                Upload homework diaries, assignments, or documents
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                <Image className="w-4 h-4" />
                Images
              </span>
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                <FileText className="w-4 h-4" />
                PDF
              </span>
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                <FileText className="w-4 h-4" />
                Word
              </span>
              <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
                <File className="w-4 h-4" />
                Text
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Button */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        
        <button
          onClick={onCameraClick}
          disabled={isProcessing}
          className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          <Camera size={20} />
          Use Camera Instead
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Upload Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Supported Formats */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📁 Supported File Types:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>Images: JPG, PNG, GIF, WebP</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Documents: PDF, Word (.docx)</span>
          </div>
          <div className="flex items-center gap-2">
            <File className="w-4 h-4" />
            <span>Text Files: .txt</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Max size: 10MB per file</span>
          </div>
        </div>
      </div>
    </div>
  );
};