import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  subjects: Array<{ id: string; name: string; color: string }>;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onBack: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  subjects,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onAddTask,
  onBack
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'subject'>('dueDate');

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'subject') {
        return a.subject.localeCompare(b.subject);
      }
      return 0;
    });

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 mb-2 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-900">All Tasks</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="subject">Subject</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'Add your first task to get started!' : `No ${filter} tasks at the moment.`}
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow-lg p-6 border transition-all hover:shadow-xl ${
                task.completed ? 'border-green-200 bg-green-50' : 
                isOverdue(task.dueDate) ? 'border-red-200 bg-red-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className={`mt-1 transition-colors ${
                    task.completed ? 'text-green-600' : 'text-gray-400 hover:text-blue-600'
                  }`}
                >
                  {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-xl font-semibold ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.createdFrom === 'diary' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          From Diary
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span className={isOverdue(task.dueDate) && !task.completed ? 'text-red-600 font-medium' : ''}>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{task.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subjects.find(s => s.name === task.subject)?.color }}
                      />
                      <span>{task.subject}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Form Modal */}
      {showAddForm && (
        <TaskFormModal
          task={null}
          subjects={subjects}
          onSave={(taskData) => {
            onAddTask(taskData);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Task Form Modal */}
      {editingTask && (
        <TaskFormModal
          task={editingTask}
          subjects={subjects}
          onSave={(taskData) => {
            onUpdateTask(editingTask.id, taskData);
            setEditingTask(null);
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

interface TaskFormModalProps {
  task: Task | null;
  subjects: Array<{ id: string; name: string; color: string }>;
  onSave: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, subjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    subject: task?.subject || subjects[0]?.name || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium' as const,
    estimatedTime: task?.estimatedTime || 60,
    completed: task?.completed || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dueDate: new Date(formData.dueDate),
      createdFrom: 'manual'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {task ? 'Edit Task' : 'Add New Task'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
            <input
              type="number"
              min="15"
              step="15"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update' : 'Add'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};