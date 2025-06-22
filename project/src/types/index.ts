export interface Task {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
  completed: boolean;
  scheduledTime?: Date;
  createdFrom?: 'diary' | 'manual' | 'prompt';
}

export interface DiaryPhoto {
  id: string;
  imageUrl: string;
  capturedAt: Date;
  extractedTasks: Task[];
  processed: boolean;
}

export interface StudySession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}