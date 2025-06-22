import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  subjects: Array<{ id: string; name: string; color: string }>;
  onBack: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, subjects, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-2 text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-medium text-gray-600 border-r border-gray-100 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-32 border-r border-b border-gray-100 last:border-r-0" />;
            }

            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayTasks = getTasksForDate(cellDate);
            const isToday = cellDate.toDateString() === today.toDateString();
            const isPast = cellDate < today && !isToday;

            return (
              <div
                key={day}
                className={`h-32 border-r border-b border-gray-100 last:border-r-0 p-2 overflow-hidden ${
                  isPast ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 
                  isPast ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => {
                    const subject = subjects.find(s => s.name === task.subject);
                    return (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.completed ? 'bg-green-100 text-green-800 line-through' : 'text-white'
                        }`}
                        style={{
                          backgroundColor: task.completed ? undefined : subject?.color,
                        }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4">Subjects</h4>
        <div className="flex flex-wrap gap-4">
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-sm text-gray-700">{subject.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-semibold text-gray-900">Upcoming Deadlines</h4>
        </div>
        <div className="p-6">
          {tasks
            .filter(task => !task.completed && new Date(task.dueDate) >= today)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5)
            .map(task => {
              const subject = subjects.find(s => s.name === task.subject);
              const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject?.color }}
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                    <p className="text-sm text-gray-600">{task.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {task.estimatedTime} min
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};