import { useState, useCallback } from 'react';
import { createWorker, Worker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

interface OCRProgress {
  status: string;
  progress: number;
}

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [worker, setWorker] = useState<Worker | null>(null);

  const initializeWorker = useCallback(async () => {
    if (worker) return worker;

    const newWorker = await createWorker('eng', 1, {
      logger: (m) => {
        setProgress({
          status: m.status,
          progress: m.progress || 0
        });
      }
    });

    // Configure for better handwriting recognition
    await newWorker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;-()[]{}"\' ',
      tessedit_pageseg_mode: '6', // Uniform block of text
      preserve_interword_spaces: '1',
    });

    setWorker(newWorker);
    return newWorker;
  }, [worker]);

  const extractTextFromImage = useCallback(async (imageUrl: string): Promise<OCRResult> => {
    setIsProcessing(true);
    setProgress({ status: 'Initializing OCR...', progress: 0 });

    try {
      const ocrWorker = await initializeWorker();
      
      setProgress({ status: 'Processing image...', progress: 20 });
      
      const { data } = await ocrWorker.recognize(imageUrl);
      
      setProgress({ status: 'Extracting text...', progress: 80 });

      // Process the results to get word-level information
      const words = data.words?.map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      })) || [];

      const result: OCRResult = {
        text: data.text.trim(),
        confidence: data.confidence,
        words
      };

      setProgress({ status: 'Complete', progress: 100 });
      return result;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress({ status: '', progress: 0 });
      }, 1000);
    }
  }, [initializeWorker]);

  const cleanup = useCallback(async () => {
    if (worker) {
      await worker.terminate();
      setWorker(null);
    }
  }, [worker]);

  return {
    extractTextFromImage,
    isProcessing,
    progress,
    cleanup
  };
};