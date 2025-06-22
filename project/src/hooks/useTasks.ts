import { useState, useCallback } from 'react';
import { Task, DiaryPhoto } from '../types';

const mockSubjects = [
  { id: '1', name: 'Mathematics', color: '#3B82F6' },
  { id: '2', name: 'Science', color: '#10B981' },
  { id: '3', name: 'English', color: '#8B5CF6' },
  { id: '4', name: 'History', color: '#F59E0B' },
  { id: '5', name: 'Art', color: '#EF4444' }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [diaryPhotos, setDiaryPhotos] = useState<DiaryPhoto[]>([]);

  const extractTasksFromImage = useCallback((imageUrl: string): Task[] => {
    // Simulate AI task extraction - in a real app, this would call an OCR/AI service
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
      },
      {
        id: Date.now().toString() + '_3',
        title: 'Read English novel chapters 3-5',
        subject: 'English',
        description: 'Read and prepare summary notes',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'low',
        estimatedTime: 120,
        completed: false,
        createdFrom: 'diary'
      }
    ];
    return mockTasks;
  }, []);

  const processDiaryPhoto = useCallback((imageUrl: string) => {
    const extractedTasks = extractTasksFromImage(imageUrl);
    
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
      createdFrom: 'manual'
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
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
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
};