import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaBell, FaTimes, FaPlusCircle, FaDesktop, FaFileExport, FaFileImport } from 'react-icons/fa';
import { useThemeStore } from '../store/themeStore';
import useHabitStore from '../store/habitStore';

type WidgetType = 'streak' | 'calendar' | 'weeklyProgress' | 'categoryStats' | 'timeAnalysis' | 'habitComparison';

interface WidgetConfig {
  id: string;
  type: WidgetType;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: '1', type: 'weeklyProgress', enabled: true, size: 'large' },
  { id: '2', type: 'streak', enabled: true, size: 'small' },
  { id: '3', type: 'categoryStats', enabled: true, size: 'medium' },
  { id: '4', type: 'calendar', enabled: true, size: 'large' },
  { id: '5', type: 'timeAnalysis', enabled: true, size: 'medium' },
  { id: '6', type: 'habitComparison', enabled: true, size: 'medium' },
];

const WIDGET_INFO = {
  streak: { name: 'Streak Tracker', description: 'Track your longest streaks' },
  calendar: { name: 'Habit Calendar', description: 'Visualize your habits in a calendar view' },
  weeklyProgress: { name: 'Weekly Progress', description: 'Bar chart showing your weekly progress' },
  categoryStats: { name: 'Category Stats', description: 'Pie chart showing distribution of habits by category' },
  timeAnalysis: { name: 'Time Analysis', description: 'Analyze when you complete your habits' },
  habitComparison: { name: 'Habit Comparison', description: 'Compare different habits' }
};

const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { habits, deleteHabit } = useHabitStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true';
  });
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const savedWidgets = localStorage.getItem('widgets');
    return savedWidgets ? JSON.parse(savedWidgets) : DEFAULT_WIDGETS;
  });
  const [backgroundTheme, setBackgroundTheme] = useState(() => {
    return localStorage.getItem('backgroundTheme') || 'default';
  });

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', String(newValue));
  };

  const handleResetHabits = () => {
    habits.forEach((habit) => deleteHabit(habit.id));
    setShowResetConfirm(false);
  };
  
  const handleWidgetToggle = (id: string) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    );
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };
  
  const handleWidgetSizeChange = (id: string, size: 'small' | 'medium' | 'large') => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    );
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };
  
  const handleWidgetRemove = (id: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== id);
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };
  
  const handleBackgroundChange = (theme: string) => {
    setBackgroundTheme(theme);
    localStorage.setItem('backgroundTheme', theme);
    
    // Apply the background theme to the body
    document.body.className = document.body.className
      .replace(/bg-theme-\w+/g, '')
      .concat(` bg-theme-${theme}`);
  };
  
  const handleExportData = () => {
    try {
      const data = {
        habits: habits,
        widgets: widgets,
        theme: theme,
        backgroundTheme: backgroundTheme,
        notifications: notifications
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `habitit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="flex items-center space-x-4 mb-8">
        <Link to="/dashboard" className="btn-secondary p-2">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
      </header>

      <div className="space-y-6 max-w-2xl">
        {/* Theme */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between mb-4">
            <span>Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="btn-secondary"
            >
              {theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'Custom Mode'}
            </button>
          </div>
          
          <h3 className="font-medium text-lg mb-3">Background Theme</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {['default', 'gradient', 'waves', 'confetti', 'dots', 'geometric', 'circuit'].map(bgTheme => (
              <button
                key={bgTheme}
                onClick={() => handleBackgroundChange(bgTheme)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  backgroundTheme === bgTheme 
                    ? 'border-primary-light dark:border-primary-dark' 
                    : 'border-transparent'
                }`}
              >
                <div className={`w-full h-full bg-theme-${bgTheme}`}>
                  <span className="sr-only">{bgTheme} theme</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Widgets */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Dashboard Widgets</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure which widgets appear on your analytics dashboard.
          </p>
          <div className="space-y-3">
            {widgets.map(widget => (
              <div 
                key={widget.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{WIDGET_INFO[widget.type].name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {WIDGET_INFO[widget.type].description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={widget.size}
                    onChange={(e) => handleWidgetSizeChange(widget.id, e.target.value as any)}
                    className="input py-1 px-2 text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={widget.enabled}
                      onChange={() => handleWidgetToggle(widget.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/20 dark:peer-focus:ring-primary-dark/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark" />
                  </label>
                  <button
                    onClick={() => handleWidgetRemove(widget.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-secondary w-full flex items-center justify-center">
              <FaPlusCircle className="mr-2" /> Add Widget
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <span>Daily Reminders</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/20 dark:peer-focus:ring-primary-dark/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark" />
            </label>
          </div>
          {notifications && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center text-blue-800 dark:text-blue-300">
                <FaBell className="mr-2" />
                <p className="text-sm">Configure reminders for individual habits from the habit edit panel</p>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Data</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save a backup of your habits and settings
                </p>
              </div>
              <button 
                onClick={handleExportData}
                className="btn-secondary flex items-center"
              >
                <FaFileExport className="mr-2" /> Export
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-medium">Import Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restore from a previous backup
                </p>
              </div>
              <label className="btn-secondary flex items-center cursor-pointer">
                <FaFileImport className="mr-2" /> Import
                <input type="file" className="hidden" accept=".json" />
              </label>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="btn-secondary text-red-500 dark:text-red-400 border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Reset All Habits
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-500 dark:text-red-400">
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleResetHabits}
                      className="btn-secondary bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>Daily Habit Checklist</p>
            <p>Version 1.0.0</p>
            <p>Built with React + Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 