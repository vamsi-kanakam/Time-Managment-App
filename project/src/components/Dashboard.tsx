import React from 'react';
import { Clock, CheckCircle, AlertCircle, BookOpen, Camera } from 'lucide-react';
import { Task } from '../types';

interface DashboardProps {
  tasks: Task[];
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onNavigate }) => {
  const today = new Date();
  const todaysTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < today && !task.completed;
  });

  const completedTasks = tasks.filter(task => task.completed);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">StudyFlow</h1>
        <p className="text-xl text-gray-600">Your AI-powered study companion</p>
        
        <button
          onClick={() => onNavigate('camera')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Camera size={20} />
          Scan Homework Diary
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <BookOpen className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-3xl font-bold text-orange-600">{todaysTasks.length}</p>
            </div>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Today's Tasks</h3>
        </div>
        <div className="p-6">
          {todaysTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks due today! 🎉</p>
          ) : (
            <div className="space-y-4">
              {todaysTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600">{task.subject} • {task.estimatedTime} min</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('tasks')}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">View All Tasks</h3>
          <p className="text-blue-100">Manage and organize your assignments</p>
        </button>
        
        <button
          onClick={() => onNavigate('calendar')}
          className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
          <p className="text-green-100">See your schedule at a glance</p>
        </button>
        
        <button
          onClick={() => onNavigate('timer')}
          className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Study Timer</h3>
          <p className="text-purple-100">Focus with Pomodoro technique</p>
        </button>
      </div>
    </div>
  );
};