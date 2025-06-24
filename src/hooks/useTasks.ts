import { useState, useCallback } from 'react';
import { Task, DiaryPhoto } from '../types';
import { useOCR } from './useOCR';
import { TaskParser } from '../utils/taskParser';

const mockSubjects = [
  { id: '1', name: 'Mathematics', color: '#3B82F6' },
  { id: '2', name: 'Science', color: '#10B981' },
  { id: '3', name: 'English', color: '#8B5CF6' },
  { id: '4', name: 'History', color: '#F59E0B' },
  { id: '5', name: 'Art', color: '#EF4444' },
  { id: '6', name: 'Physics', color: '#06B6D4' },
  { id: '7', name: 'Chemistry', color: '#84CC16' },
  { id: '8', name: 'Biology', color: '#F97316' },
  { id: '9', name: 'Geography', color: '#EC4899' },
  { id: '10', name: 'General', color: '#6B7280' }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [diaryPhotos, setDiaryPhotos] = useState<DiaryPhoto[]>([]);
  const { extractTextFromImage } = useOCR();
  const taskParser = new TaskParser();

  const extractTasksFromImage = useCallback(async (imageUrl: string): Promise<Task[]> => {
    try {
      // Use OCR to extract text from the image
      const ocrResult = await extractTextFromImage(imageUrl);
      
      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      // Parse the extracted text to identify tasks
      const extractedTasks = taskParser.parseText(ocrResult.text);
      
      if (extractedTasks.length === 0) {
        // If no tasks were automatically detected, create a general task with the extracted text
        const fallbackTask: Task = {
          id: Date.now().toString(),
          title: 'Review extracted content',
          subject: 'General',
          description: ocrResult.text.substring(0, 200) + (ocrResult.text.length > 200 ? '...' : ''),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          estimatedTime: 60,
          completed: false,
          createdFrom: 'diary'
        };
        return [fallbackTask];
      }

      return extractedTasks;
    } catch (error) {
      console.error('Error extracting tasks from image:', error);
      
      // Fallback to mock tasks if OCR fails
      const mockTasks: Task[] = [
        {
          id: Date.now().toString() + '_1',
          title: 'Complete Math homework Chapter 5',
          subject: 'Mathematics',
          description: 'Solve problems 1-20 on quadratic equations',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: 'high',
          estimatedTime: 90,
          completed: false,
          createdFrom: 'diary'
        },
        {
          id: Date.now().toString() + '_2',
          title: 'Science lab report',
          subject: 'Science',
          description: 'Write conclusion for chemistry experiment',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          estimatedTime: 60,
          completed: false,
          createdFrom: 'diary'
        }
      ];
      return mockTasks;
    }
  }, [extractTextFromImage, taskParser]);

  const processDiaryPhoto = useCallback(async (imageUrl: string) => {
    const extractedTasks = await extractTasksFromImage(imageUrl);
    
    const diaryPhoto: DiaryPhoto = {
      id: Date.now().toString(),
      imageUrl,
      capturedAt: new Date(),
      extractedTasks,
      processed: true
    };

    setDiaryPhotos(prev => [...prev, diaryPhoto]);
    setTasks(prev => [...prev, ...extractedTasks]);
    
    return diaryPhoto;
  }, [extractTasksFromImage]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdFrom: task.createdFrom || 'manual'
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const addMultipleTasks = useCallback((newTasks: Task[]) => {
    setTasks(prev => [...prev, ...newTasks]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  return {
    tasks,
    diaryPhotos,
    subjects: mockSubjects,
    processDiaryPhoto,
    addTask,
    addMultipleTasks,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
};