import { Task } from '../types';

interface ParsedTaskInfo {
  subject?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: number;
  taskType?: string;
}

export class TaskParser {
  private subjects = [
    'mathematics', 'math', 'maths', 'algebra', 'geometry', 'calculus',
    'science', 'physics', 'chemistry', 'biology', 'bio',
    'english', 'literature', 'writing', 'essay', 'reading',
    'history', 'social studies', 'geography', 'civics',
    'art', 'drawing', 'painting', 'music',
    'computer science', 'programming', 'coding',
    'physical education', 'pe', 'sports',
    'french', 'spanish', 'german', 'language'
  ];

  private timeKeywords = {
    'today': 0,
    'tomorrow': 1,
    'day after tomorrow': 2,
    'next week': 7,
    'next monday': this.getDaysUntilWeekday(1),
    'next tuesday': this.getDaysUntilWeekday(2),
    'next wednesday': this.getDaysUntilWeekday(3),
    'next thursday': this.getDaysUntilWeekday(4),
    'next friday': this.getDaysUntilWeekday(5),
    'next saturday': this.getDaysUntilWeekday(6),
    'next sunday': this.getDaysUntilWeekday(0),
  };

  private priorityKeywords = {
    high: ['urgent', 'important', 'asap', 'priority', 'due tomorrow', 'test', 'exam', 'quiz'],
    medium: ['assignment', 'homework', 'project', 'essay', 'report'],
    low: ['read', 'review', 'practice', 'optional', 'extra credit']
  };

  private taskTypeKeywords = {
    'test': ['test', 'exam', 'quiz', 'assessment'],
    'essay': ['essay', 'paper', 'composition', 'writing'],
    'project': ['project', 'presentation', 'research'],
    'homework': ['homework', 'assignment', 'exercises', 'problems'],
    'reading': ['read', 'chapter', 'pages', 'book'],
    'lab': ['lab', 'experiment', 'practical']
  };

  private static getDaysUntilWeekday(targetDay: number): number {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntil = (targetDay - currentDay + 7) % 7;
    return daysUntil === 0 ? 7 : daysUntil;
  }

  private getDaysUntilWeekday(targetDay: number): number {
    return TaskParser.getDaysUntilWeekday(targetDay);
  }

  public parseText(text: string): Task[] {
    const tasks: Task[] = [];
    const lines = this.preprocessText(text);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.isTaskLine(line)) {
        const task = this.parseTaskLine(line, i);
        if (task) {
          tasks.push(task);
        }
      }
    }

    return tasks;
  }

  private preprocessText(text: string): string[] {
    // Clean and normalize the text
    const cleaned = text
      .replace(/[^\w\s\-.,!?:;()[\]{}'"]/g, ' ') // Remove special characters except common punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Split into lines and filter out empty ones
    return cleaned
      .split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 3); // Filter out very short lines
  }

  private isTaskLine(line: string): boolean {
    const lowerLine = line.toLowerCase();
    
    // Check for task indicators
    const taskIndicators = [
      'homework', 'assignment', 'due', 'test', 'exam', 'quiz',
      'essay', 'project', 'read', 'study', 'complete', 'finish',
      'chapter', 'page', 'exercise', 'problem', 'lab', 'report'
    ];

    return taskIndicators.some(indicator => lowerLine.includes(indicator));
  }

  private parseTaskLine(line: string, index: number): Task | null {
    const lowerLine = line.toLowerCase();
    
    // Extract task information
    const taskInfo = this.extractTaskInfo(lowerLine);
    
    // Generate task title and description
    const { title, description } = this.generateTitleAndDescription(line, taskInfo);
    
    if (!title) return null;

    return {
      id: `ocr_${Date.now()}_${index}`,
      title,
      subject: taskInfo.subject || 'General',
      description,
      dueDate: taskInfo.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: taskInfo.priority || 'medium',
      estimatedTime: taskInfo.estimatedTime || 60,
      completed: false,
      createdFrom: 'diary'
    };
  }

  private extractTaskInfo(line: string): ParsedTaskInfo {
    const info: ParsedTaskInfo = {};

    // Extract subject
    info.subject = this.extractSubject(line);
    
    // Extract due date
    info.dueDate = this.extractDueDate(line);
    
    // Extract priority
    info.priority = this.extractPriority(line);
    
    // Extract estimated time
    info.estimatedTime = this.extractEstimatedTime(line);
    
    // Extract task type
    info.taskType = this.extractTaskType(line);

    return info;
  }

  private extractSubject(line: string): string {
    for (const subject of this.subjects) {
      if (line.includes(subject)) {
        // Capitalize first letter of each word
        return subject.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    return 'General';
  }

  private extractDueDate(line: string): Date {
    const now = new Date();
    
    // Check for specific time keywords
    for (const [keyword, days] of Object.entries(this.timeKeywords)) {
      if (line.includes(keyword)) {
        return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }
    }

    // Check for "in X days" pattern
    const inDaysMatch = line.match(/in (\d+) days?/);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1]);
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    // Check for date patterns (MM/DD, DD/MM, etc.)
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // MM/DD or MM/DD/YY
      /(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/,   // MM-DD or MM-DD-YY
      /(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/  // MM.DD or MM.DD.YY
    ];

    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const month = parseInt(match[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();
        
        const date = new Date(year, month, day);
        if (date > now) {
          return date;
        }
      }
    }

    // Default: 1 week from now
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  private extractPriority(line: string): 'low' | 'medium' | 'high' {
    for (const [priority, keywords] of Object.entries(this.priorityKeywords)) {
      if (keywords.some(keyword => line.includes(keyword))) {
        return priority as 'low' | 'medium' | 'high';
      }
    }
    return 'medium';
  }

  private extractEstimatedTime(line: string): number {
    // Look for explicit time mentions
    const timeMatch = line.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      
      if (unit.startsWith('hour') || unit.startsWith('hr')) {
        return value * 60;
      }
      return value;
    }

    // Estimate based on task type
    if (line.includes('test') || line.includes('exam')) return 120;
    if (line.includes('essay') || line.includes('project')) return 180;
    if (line.includes('read')) return 45;
    if (line.includes('homework') || line.includes('assignment')) return 60;
    if (line.includes('lab') || line.includes('experiment')) return 90;

    return 60; // Default
  }

  private extractTaskType(line: string): string {
    for (const [type, keywords] of Object.entries(this.taskTypeKeywords)) {
      if (keywords.some(keyword => line.includes(keyword))) {
        return type;
      }
    }
    return 'homework';
  }

  private generateTitleAndDescription(line: string, taskInfo: ParsedTaskInfo): { title: string; description: string } {
    const taskType = taskInfo.taskType || 'assignment';
    const subject = taskInfo.subject || 'General';
    
    // Extract chapter/page numbers
    const chapterMatch = line.match(/chapter\s*(\d+(?:-\d+)?)/i);
    const pageMatch = line.match(/pages?\s*(\d+(?:-\d+)?)/i);
    const problemMatch = line.match(/problems?\s*(\d+(?:-\d+)?)/i);
    const exerciseMatch = line.match(/exercises?\s*(\d+(?:-\d+)?)/i);

    let title = '';
    let description = line;

    // Generate contextual titles
    switch (taskType) {
      case 'test':
        title = `${subject} ${taskType}`;
        if (chapterMatch) {
          title += ` - Chapter ${chapterMatch[1]}`;
          description = `Study for ${subject.toLowerCase()} test covering chapter ${chapterMatch[1]}`;
        }
        break;
        
      case 'essay':
        title = `${subject} Essay`;
        description = `Write essay for ${subject.toLowerCase()}`;
        break;
        
      case 'reading':
        title = `Read ${subject}`;
        if (chapterMatch) {
          title += ` Chapter ${chapterMatch[1]}`;
          description = `Read chapter ${chapterMatch[1]} for ${subject.toLowerCase()}`;
        } else if (pageMatch) {
          title += ` Pages ${pageMatch[1]}`;
          description = `Read pages ${pageMatch[1]} for ${subject.toLowerCase()}`;
        }
        break;
        
      case 'homework':
        title = `${subject} Homework`;
        if (problemMatch) {
          title += ` - Problems ${problemMatch[1]}`;
          description = `Complete problems ${problemMatch[1]} for ${subject.toLowerCase()}`;
        } else if (exerciseMatch) {
          title += ` - Exercises ${exerciseMatch[1]}`;
          description = `Complete exercises ${exerciseMatch[1]} for ${subject.toLowerCase()}`;
        }
        break;
        
      default:
        // Extract the main action and object
        const words = line.split(' ');
        const meaningfulWords = words.filter(word => 
          word.length > 2 && 
          !['the', 'and', 'for', 'due', 'on'].includes(word.toLowerCase())
        );
        
        title = meaningfulWords.slice(0, 6).join(' ');
        if (title.length > 50) {
          title = title.substring(0, 47) + '...';
        }
    }

    // Ensure title is not empty
    if (!title.trim()) {
      title = line.length > 50 ? line.substring(0, 47) + '...' : line;
    }

    return { title: title.trim(), description: description.trim() };
  }
}