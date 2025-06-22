import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CameraCapture } from './components/CameraCapture';
import { TaskList } from './components/TaskList';
import { Calendar } from './components/Calendar';
import { StudyTimer } from './components/StudyTimer';
import { Navigation } from './components/Navigation';
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
    toggleTaskCompletion
  } = useTasks();

  const handleCameraCapture = (imageUrl: string) => {
    processDiaryPhoto(imageUrl);
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