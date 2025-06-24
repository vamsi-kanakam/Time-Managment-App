import { useState, useCallback } from 'react';

interface DocumentProcessorResult {
  text: string;
  fileName: string;
  fileType: string;
}

export const useDocumentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processDocument = useCallback(async (file: File): Promise<DocumentProcessorResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      let text = '';
      const fileName = file.name;
      const fileType = file.type;

      setProgress(25);

      if (file.type.startsWith('image/')) {
        // For images, we'll use OCR (handled by the existing OCR hook)
        const imageUrl = await fileToDataURL(file);
        return {
          text: imageUrl, // Return the data URL for OCR processing
          fileName,
          fileType: 'image'
        };
      } else if (file.type === 'application/pdf') {
        setProgress(50);
        text = await processPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.name.endsWith('.docx')) {
        setProgress(50);
        text = await processWord(file);
      } else if (file.type === 'text/plain') {
        setProgress(50);
        text = await processText(file);
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      setProgress(100);
      
      return {
        text,
        fileName,
        fileType
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processPDF = async (file: File): Promise<string> => {
    try {
      // For now, we'll show a message that PDF processing requires server-side implementation
      // In a real app, you'd send this to a backend service
      return `PDF file "${file.name}" uploaded. PDF text extraction requires server-side processing. Please convert to image format or use the camera to capture pages for OCR processing.`;
    } catch (error) {
      throw new Error('Failed to process PDF file');
    }
  };

  const processWord = async (file: File): Promise<string> => {
    try {
      // For now, we'll show a message that Word processing requires server-side implementation
      // In a real app, you'd use mammoth.js or send to backend
      return `Word document "${file.name}" uploaded. Word document processing requires server-side implementation. Please save as text file or convert to image format for processing.`;
    } catch (error) {
      throw new Error('Failed to process Word document');
    }
  };

  const processText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return {
    processDocument,
    isProcessing,
    progress
  };
};