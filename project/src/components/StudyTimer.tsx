import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

interface StudyTimerProps {
  onBack: () => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotificationSound();
            if (!isBreak) {
              setCompletedSessions(count => count + 1);
              // Auto-start break
              setIsBreak(true);
              return 5 * 60; // 5 minute break
            } else {
              setIsBreak(false);
              return selectedDuration * 60; // Back to work session
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, isBreak, selectedDuration]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(selectedDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  const durations = [15, 25, 30, 45, 60];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-2 text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Study Timer</h2>
        <p className="text-gray-600">Focus with the Pomodoro Technique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isBreak ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isBreak ? <Coffee size={16} /> : <BookOpen size={16} />}
              {isBreak ? 'Break Time' : 'Focus Time'}
            </div>

            {/* Circular Progress */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 ${
                    isBreak ? 'text-green-500' : 'text-blue-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium transition-colors ${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : isBreak 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            {/* Duration Selector */}
            {!isRunning && !isBreak && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">Focus Duration</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {durations.map(duration => (
                    <button
                      key={duration}
                      onClick={() => {
                        setSelectedDuration(duration);
                        setTimeLeft(duration * 60);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDuration === duration
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Tips */}
        <div className="space-y-6">
          {/* Session Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Sessions</span>
                <span className="text-2xl font-bold text-blue-600">{completedSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Focus Time</span>
                <span className="text-lg font-semibold text-gray-900">
                  {Math.floor(completedSessions * selectedDuration / 60)}h {(completedSessions * selectedDuration) % 60}m
                </span>
              </div>
            </div>
            
            {completedSessions >= 4 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Great job! You've completed 4+ focus sessions today!
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Remove distractions from your workspace
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Keep a glass of water nearby
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Take notes of what you accomplish
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Use breaks to stretch or walk around
              </li>
            </ul>
          </div>

          {/* Pomodoro Info */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">The Pomodoro Technique</h3>
            <p className="text-sm text-gray-600">
              Work in focused 25-minute intervals followed by 5-minute breaks. 
              After 4 sessions, take a longer 15-30 minute break.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};