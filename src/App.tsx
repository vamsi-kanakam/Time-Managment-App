import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CameraCapture } from './components/CameraCapture';
import { TaskList } from './components/TaskList';
import { Calendar } from './components/Calendar';
import { StudyTimer } from './components/StudyTimer';
import { Navigation } from './components/Navigation';
import { DeadlinePrompt } from './components/DeadlinePrompt';
import { useTasks } from './hooks/useTasks';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const {
    tasks,
    diaryPhotos,
    subjects,
    processDiaryPhoto,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addMultipleTasks
  } = useTasks();

  const handleCameraCapture = async (imageUrl: string) => {
    try {
      await processDiaryPhoto(imageUrl);
      setCurrentView('tasks');
    } catch (error) {
      console.error('Error processing diary photo:', error);
      // Still navigate to tasks view even if processing fails
      setCurrentView('tasks');
    }
  };

  const handleDeadlineTasksGenerated = (generatedTasks: any[]) => {
    addMultipleTasks(generatedTasks);
    setCurrentView('tasks');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'camera':
        return (
          <CameraCapture
            onCapture={handleCameraCapture}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'deadline-prompt':
        return (
          <DeadlinePrompt
            subjects={subjects}
            onTasksGenerated={handleDeadlineTasksGenerated}
            onClose={() => setCurrentView('dashboard')}
          />
        );
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            subjects={subjects}
            onToggleComplete={toggleTaskCompletion}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddTask={addTask}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'calendar':
        return (
          <Calendar
            tasks={tasks}
            subjects={subjects}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'timer':
        return (
          <StudyTimer
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return (
          <Dashboard
            tasks={tasks}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {renderCurrentView()}
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}

export default App;