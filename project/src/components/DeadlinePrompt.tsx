import React, { useState } from 'react';
import { MessageSquare, Calendar, Clock, Sparkles, Send, X } from 'lucide-react';
import { Task } from '../types';

interface DeadlinePromptProps {
  subjects: Array<{ id: string; name: string; color: string }>;
  onTasksGenerated: (tasks: Task[]) => void;
  onClose: () => void;
}

export const DeadlinePrompt: React.FC<DeadlinePromptProps> = ({
  subjects,
  onTasksGenerated,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [examples] = useState([
    "I have a math test next Friday and need to study chapters 1-5",
    "English essay due in 3 days about Shakespeare, 1500 words",
    "Science project presentation next week, need to prepare slides",
    "History assignment due tomorrow, read chapter 8 and answer questions"
  ]);

  const parseDeadlinePrompt = (text: string): Task[] => {
    // Simulate AI parsing of natural language deadlines
    const tasks: Task[] = [];
    const now = new Date();
    
    // Simple keyword-based parsing (in production, this would use actual NLP/AI)
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      
      // Extract subject
      let subject = 'General';
      subjects.forEach(sub => {
        if (lowerLine.includes(sub.name.toLowerCase())) {
          subject = sub.name;
        }
      });
      
      // Extract due date
      let dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: 1 week
      
      if (lowerLine.includes('tomorrow')) {
        dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else if (lowerLine.includes('today')) {
        dueDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      } else if (lowerLine.includes('next week')) {
        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (lowerLine.includes('in 3 days') || lowerLine.includes('3 days')) {
        dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      } else if (lowerLine.includes('next friday')) {
        const nextFriday = new Date(now);
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        dueDate = nextFriday;
      } else if (lowerLine.includes('next monday')) {
        const nextMonday = new Date(now);
        const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        dueDate = nextMonday;
      }
      
      // Extract priority
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (lowerLine.includes('urgent') || lowerLine.includes('important') || lowerLine.includes('tomorrow')) {
        priority = 'high';
      } else if (lowerLine.includes('easy') || lowerLine.includes('simple')) {
        priority = 'low';
      }
      
      // Extract estimated time
      let estimatedTime = 60; // Default: 1 hour
      if (lowerLine.includes('test') || lowerLine.includes('exam')) {
        estimatedTime = 120; // 2 hours for test prep
      } else if (lowerLine.includes('essay') || lowerLine.includes('project')) {
        estimatedTime = 180; // 3 hours for essays/projects
      } else if (lowerLine.includes('read')) {
        estimatedTime = 45; // 45 minutes for reading
      } else if (lowerLine.includes('presentation')) {
        estimatedTime = 90; // 1.5 hours for presentations
      }
      
      // Generate task title and description
      let title = line.trim();
      let description = '';
      
      if (lowerLine.includes('test') || lowerLine.includes('exam')) {
        const match = line.match(/chapters? ([\d\-,\s]+)/i);
        if (match) {
          title = `Study for ${subject} test`;
          description = `Review chapters ${match[1]} and prepare for exam`;
        }
      } else if (lowerLine.includes('essay')) {
        const wordMatch = line.match(/(\d+)\s*words?/i);
        title = `Write ${subject} essay`;
        description = wordMatch ? `Complete essay (${wordMatch[1]} words)` : 'Complete essay assignment';
      } else if (lowerLine.includes('project')) {
        title = `Complete ${subject} project`;
        description = line.includes('presentation') ? 'Prepare project presentation and slides' : 'Work on project assignment';
      } else if (lowerLine.includes('assignment')) {
        title = `${subject} assignment`;
        description = line.includes('read') ? 'Complete reading and answer questions' : 'Complete assignment tasks';
      }
      
      tasks.push({
        id: `prompt_${Date.now()}_${index}`,
        title,
        subject,
        description,
        dueDate,
        priority,
        estimatedTime,
        completed: false,
        createdFrom: 'prompt'
      });
    });
    
    return tasks;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedTasks = parseDeadlinePrompt(prompt);
    onTasksGenerated(generatedTasks);
    setIsProcessing(false);
    setPrompt('');
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Deadlines</h3>
          <p className="text-gray-600">AI is understanding your schedule and creating tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Deadline Assistant</h3>
              <p className="text-sm text-gray-600">Describe your deadlines in natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Examples */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Try these examples:</h4>
            <div className="grid grid-cols-1 gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your deadlines and assignments:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: I have a math test next Friday covering chapters 1-5, and an English essay due in 3 days about Romeo and Juliet (1500 words). Also need to prepare a science presentation for next week."
                className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mention specific subjects (Math, English, Science, etc.)</li>
                <li>• Include time references (tomorrow, next week, in 3 days)</li>
                <li>• Describe the type of work (test, essay, project, assignment)</li>
                <li>• Add details like chapter numbers or word counts</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
              Generate Tasks from Deadlines
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};