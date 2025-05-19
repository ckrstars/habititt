import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaBell, FaTimes, FaPlusCircle, FaFileExport, FaFileImport } from 'react-icons/fa';
import { useThemeStore } from '../store/themeStore';
import useHabitStore from '../store/habitStore';
import { AnimatePresence, motion } from 'framer-motion';

// Same widget types as in Analytics.tsx
type WidgetType = 'weeklyProgress' | 'categoryStats' | 'streak' | 'habitCalendar' | 'timeAnalysis' | 'consistencyScore';

interface Widget {
  id: string;
  type: WidgetType;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  pinned: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: '1', type: 'weeklyProgress', size: 'large', visible: true, pinned: false },
  { id: '2', type: 'categoryStats', size: 'medium', visible: true, pinned: false },
  { id: '3', type: 'streak', size: 'small', visible: true, pinned: false },
  { id: '4', type: 'habitCalendar', size: 'large', visible: true, pinned: false },
  { id: '5', type: 'timeAnalysis', size: 'medium', visible: true, pinned: false },
  { id: '6', type: 'consistencyScore', size: 'medium', visible: true, pinned: false },
];

const WIDGET_INFO = {
  weeklyProgress: { name: 'Weekly Progress', description: 'Bar chart showing your weekly progress' },
  categoryStats: { name: 'Category Stats', description: 'Pie chart showing distribution of habits by category' },
  streak: { name: 'Streak Tracker', description: 'Track your longest streaks' },
  habitCalendar: { name: 'Habit Calendar', description: 'Visualize your habits in a calendar view' },
  timeAnalysis: { name: 'Time Analysis', description: 'Analyze when you complete your habits' },
  consistencyScore: { name: 'Consistency Score', description: 'See your overall consistency' }
};

const Settings = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { habits, deleteHabit } = useHabitStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true';
  });
  
  // Load widgets from localStorage or use defaults
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    try {
      const savedWidgets = localStorage.getItem('widgets');
      if (savedWidgets) {
        // Try to parse the saved widgets
        const parsed = JSON.parse(savedWidgets);
        
        // Validate the widget data
        if (Array.isArray(parsed) && parsed.length > 0 && 
            parsed.every(w => 
              w.id && 
              ['weeklyProgress', 'categoryStats', 'streak', 'habitCalendar', 'timeAnalysis', 'consistencyScore'].includes(w.type) &&
              ['small', 'medium', 'large'].includes(w.size) &&
              typeof w.visible === 'boolean'
            )) {
          return parsed;
        }
      }
      return DEFAULT_WIDGETS;
    } catch (error) {
      console.error('Error loading widgets:', error);
      return DEFAULT_WIDGETS;
    }
  });

  const [backgroundTheme, setBackgroundTheme] = useState(() => {
    return localStorage.getItem('backgroundTheme') || 'default';
  });

  const [showWidgetModal, setShowWidgetModal] = useState(false);

  // Apply the background theme when component mounts or theme changes
  useEffect(() => {
    document.body.className = document.body.className
      .replace(/bg-theme-\w+/g, '')
      .concat(` bg-theme-${backgroundTheme}`);
    
    return () => {
      // Apply the saved background theme on component unmount
      const savedTheme = localStorage.getItem('backgroundTheme') || 'default';
      document.body.className = document.body.className
        .replace(/bg-theme-\w+/g, '')
        .concat(` bg-theme-${savedTheme}`);
    };
  }, [backgroundTheme, theme]);

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
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
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
  
  const addWidget = (type: WidgetType) => {
    const newId = (Math.max(0, ...widgets.map(w => parseInt(w.id))) + 1).toString();
    const updatedWidgets = [...widgets, {
      id: newId,
      type,
      size: 'medium' as 'small' | 'medium' | 'large',
      visible: true,
      pinned: false
    }];
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
    setShowWidgetModal(false);
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

  // Just before the handleImportData function, add this helper function
  const validateWidgetData = (widgetData: any): Widget => {
    // Ensure the widget has a valid id
    const id = typeof widgetData.id === 'string' ? widgetData.id : crypto.randomUUID();
    
    // Ensure the widget has a valid type
    const validTypes: WidgetType[] = ['weeklyProgress', 'categoryStats', 'streak', 'habitCalendar', 'timeAnalysis', 'consistencyScore'];
    const type: WidgetType = validTypes.includes(widgetData.type) ? widgetData.type : 'weeklyProgress';
    
    // Ensure the widget has a valid size
    const size = (widgetData.size === 'small' || widgetData.size === 'medium' || widgetData.size === 'large') 
      ? widgetData.size 
      : 'medium';
    
    // Ensure the widget has valid visibility and pinned states
    const visible = typeof widgetData.visible === 'boolean' ? widgetData.visible : true;
    const pinned = typeof widgetData.pinned === 'boolean' ? widgetData.pinned : false;
    
    return { 
      id, 
      type, 
      size: size as 'small' | 'medium' | 'large', // Force the type to be what we need
      visible, 
      pinned 
    };
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    fileReader.readAsText(files[0], 'UTF-8');
    fileReader.onload = e => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsedData = JSON.parse(content);
          
          // Import widgets if available
          if (parsedData.widgets && Array.isArray(parsedData.widgets)) {
            // Validate each widget to ensure it has the correct properties
            const validatedWidgets = parsedData.widgets.map((widgetData: any) => validateWidgetData(widgetData));
            
            setWidgets(validatedWidgets);
            localStorage.setItem('widgets', JSON.stringify(validatedWidgets));
          }
          
          // Import background theme if available
          if (parsedData.backgroundTheme) {
            setBackgroundTheme(parsedData.backgroundTheme);
            localStorage.setItem('backgroundTheme', parsedData.backgroundTheme);
          }
          
          // Import notifications setting if available
          if (parsedData.notifications !== undefined) {
            setNotifications(parsedData.notifications);
            localStorage.setItem('notifications', String(parsedData.notifications));
          }
          
          alert('Data imported successfully!');
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please make sure the file is a valid JSON export.');
      }
    };
    
    // Reset the file input
    event.target.value = '';
  };

  // Widget Add Modal Component
  const WidgetAddModal = () => (
    <AnimatePresence>
      {showWidgetModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Widget</h2>
              <button 
                onClick={() => setShowWidgetModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => addWidget('weeklyProgress')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <span className="text-sm font-medium">Weekly Progress</span>
              </button>
              <button 
                onClick={() => addWidget('categoryStats')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📋</div>
                <span className="text-sm font-medium">Categories</span>
              </button>
              <button 
                onClick={() => addWidget('streak')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">🔥</div>
                <span className="text-sm font-medium">Streak</span>
              </button>
              <button 
                onClick={() => addWidget('habitCalendar')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📆</div>
                <span className="text-sm font-medium">Calendar</span>
              </button>
              <button 
                onClick={() => addWidget('timeAnalysis')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">⏰</div>
                <span className="text-sm font-medium">Time Analysis</span>
              </button>
              <button 
                onClick={() => addWidget('consistencyScore')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📈</div>
                <span className="text-sm font-medium">Consistency</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Render the add widget modal */}
      <WidgetAddModal />
    
      <header className="flex items-center space-x-4 mb-8">
        <Link to="/" className="btn-secondary p-2">
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
              {theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'System Mode'}
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
                      checked={widget.visible}
                      onChange={() => handleWidgetToggle(widget.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/20 dark:peer-focus:ring-primary-dark/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark" />
                  </label>
                  <button
                    onClick={() => handleWidgetRemove(widget.id)}
                    className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 dark:hover:text-red-400 rounded"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setShowWidgetModal(true)}
              className="btn-secondary w-full flex items-center justify-center"
            >
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
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleImportData}
                />
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
            <p>HABITIT - Daily Habit Tracker</p>
            <p>Version 1.0.0</p>
            <p>Built with React + Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 