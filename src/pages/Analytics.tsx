import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaFire, FaTimes, FaMoon, FaGripVertical, FaEye, FaEyeSlash, FaThumbtack, FaCalendarDay, FaCalendarWeek, FaCalendar, FaCheck, FaEdit, FaUndo, FaTrash } from 'react-icons/fa';
import useSupabaseStore from '../store/supabaseStore';
import { Habit, HabitHistory } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { createContext } from 'react';
import { useConfetti } from '../hooks/useConfetti';
import confetti from 'canvas-confetti';

// Daily Details Modal Component
const DailyDetailsModal = ({ 
  isOpen, 
  onClose, 
  date, 
  habits, 
  history 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  date: string; 
  habits: Habit[]; 
  history: Record<string, HabitHistory[]>;
}) => {
  if (!isOpen) return null;

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const habitsForDate = habits.map(habit => {
    const habitHistory = history[habit.id] || [];
    const entry = habitHistory.find(h => h.date === date);
    return {
      ...habit,
      completed: entry?.completed || false,
      count: entry?.count || 0
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{formattedDate}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {habitsForDate.map(habit => (
            <div 
              key={habit.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon}</span>
                <div>
                  <h3 className="font-medium">{habit.name}</h3>
                  {habit.count_type === 'count' && (
                    <p className="text-sm text-gray-500">
                      {habit.count} {habit.count_unit}
                    </p>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                habit.completed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {habit.completed ? 'Completed' : 'Not Completed'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Date Range Picker Component
const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: { 
  startDate: string; 
  endDate: string; 
  onStartDateChange: (date: string) => void; 
  onEndDateChange: (date: string) => void; 
}) => {
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];

  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const setMonthRange = (offset: number = 0) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() + offset);
    start.setDate(1);
    if (offset === 0) {
      end.setDate(end.getDate());
    } else {
      end.setMonth(end.getMonth() + offset + 1);
      end.setDate(0);
    }
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const quickRanges = [
    { label: 'Last 7 Days', icon: <FaCalendarDay />, onClick: () => setDateRange(7) },
    { label: 'Last 30 Days', icon: <FaCalendarWeek />, onClick: () => setDateRange(30) },
    { label: 'This Month', icon: <FaCalendar />, onClick: () => setMonthRange(0) },
    { label: 'Last Month', icon: <FaCalendar />, onClick: () => setMonthRange(-1) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <button
            key={range.label}
            onClick={range.onClick}
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            {range.icon}
            {range.label}
          </button>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={e => onStartDateChange(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={maxDate}
            onChange={e => onEndDateChange(e.target.value)}
            className="input"
          />
        </div>
      </div>
    </div>
  );
};

// Widget type definition
type WidgetType = 'weeklyProgress' | 'categoryStats' | 'streak' | 'habitCalendar' | 'timeAnalysis' | 'consistencyScore';
type WidgetSize = 'small' | 'medium' | 'large';

interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  visible: boolean;
  pinned: boolean;
}

// Theme context
const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  accentColor: '#3B82F6',
  setAccentColor: () => {},
});

// Theme Provider Component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || '#3B82F6';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode), accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Customizable Widget Component
const CustomizableWidget = ({ 
  widget, 
  onResize, 
  onToggleVisibility, 
  onTogglePin,
  children 
}: { 
  widget: Widget; 
  onResize: (size: WidgetSize) => void;
  onToggleVisibility: () => void;
  onTogglePin: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Draggable draggableId={widget.id} index={parseInt(widget.id)}>
      {(provided: DraggableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card relative ${widget.pinned ? 'ring-2 ring-accent-light dark:ring-accent-dark' : ''}`}
        >
          {/* Widget Header */}
          <div className="flex items-center justify-between mb-4">
            <div {...provided.dragHandleProps} className="cursor-move">
              <FaGripVertical className="text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleVisibility}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {widget.visible ? <FaEye /> : <FaEyeSlash />}
              </button>
              <button
                onClick={onTogglePin}
                className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                  widget.pinned ? 'text-accent-light dark:text-accent-dark' : ''
                }`}
              >
                <FaThumbtack />
              </button>
              <select
                value={widget.size}
                onChange={(e) => onResize(e.target.value as WidgetSize)}
                className="input text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Widget Content */}
          {widget.visible && children}
        </div>
      )}
    </Draggable>
  );
};

// Habit Detail Drawer Component
const HabitDetailDrawer = ({ 
  isOpen, 
  onClose, 
  habit, 
  history,
  onEdit,
  onDelete,
  onComplete,
  onUndo
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  habit: Habit; 
  history: HabitHistory[];
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onComplete: (habitId: string) => void;
  onUndo: (habitId: string, date: string) => void;
}) => {
  if (!isOpen) return null;

  // Calculate streak and stats
  const currentStreak = habit.streak;
  const bestStreak = Math.max(...history.map(h => h.streak || 0));
  const completionRate = history.length > 0 
    ? Math.round((history.filter(h => h.completed).length / history.length) * 100)
    : 0;

  // Check for milestones
  const milestones = [
    { value: 7, label: '1 Week' },
    { value: 30, label: '1 Month' },
    { value: 100, label: '100 Days' },
    { value: 365, label: '1 Year' }
  ];

  const nextMilestone = milestones.find(m => currentStreak < m.value);
  const progressToNextMilestone = nextMilestone 
    ? (currentStreak / nextMilestone.value) * 100 
    : 100;

  // Trigger confetti for milestones
  useEffect(() => {
    if (milestones.some(m => currentStreak === m.value)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentStreak]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{habit.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{habit.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{habit.description}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => onComplete(habit.id)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <FaCheck /> Complete Today
            </button>
            <button
              onClick={() => onEdit(habit)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <FaEdit /> Edit Habit
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Current Streak</h3>
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <FaFire className="text-orange-500" />
                {currentStreak}
              </div>
            </div>
            <div className="card text-center">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Best Streak</h3>
              <div className="text-2xl font-bold">{bestStreak}</div>
            </div>
            <div className="card text-center">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</h3>
              <div className="text-2xl font-bold">{completionRate}%</div>
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="card mb-6">
              <h3 className="text-sm font-medium mb-2">Next Milestone: {nextMilestone.label}</h3>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextMilestone}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {currentStreak} / {nextMilestone.value} days
              </p>
            </div>
          )}

          {/* Recent History */}
          <div className="card">
            <h3 className="font-medium mb-4">Recent History</h3>
            <div className="space-y-3">
              {history.slice(0, 7).map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{habit.icon}</span>
                    <div>
                      <p className="font-medium">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {entry.completed_at && (
                        <p className="text-sm text-gray-500">
                          {new Date(entry.completed_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.completed ? (
                      <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => onUndo(habit.id, entry.date)}
                        className="btn-secondary p-1"
                      >
                        <FaUndo className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(habit.id)}
            className="btn-danger w-full mt-6 flex items-center justify-center gap-2"
          >
            <FaTrash /> Delete Habit
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Analytics = () => {
  const { habits, fetchHabits, getHabitHistory } = useSupabaseStore();
  const [allHistory, setAllHistory] = useState<Record<string, HabitHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<string | 'all'>('all');
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: 'weeklyProgress', size: 'large', visible: true, pinned: false },
    { id: '2', type: 'categoryStats', size: 'medium', visible: true, pinned: false },
    { id: '3', type: 'streak', size: 'small', visible: true, pinned: false },
    { id: '4', type: 'habitCalendar', size: 'large', visible: true, pinned: false },
    { id: '5', type: 'timeAnalysis', size: 'medium', visible: true, pinned: false },
    { id: '6', type: 'consistencyScore', size: 'medium', visible: true, pinned: false },
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  // Date range state
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [rangeEnd, setRangeEnd] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Helper: filter history by date range
  const filterHistory = (history: HabitHistory[]) =>
    history.filter(h => h.date >= rangeStart && h.date <= rangeEnd);

  useEffect(() => {
    fetchHabits();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchAllHistory = async () => {
      setLoading(true);
      const historyMap: Record<string, HabitHistory[]> = {};
      for (const habit of habits) {
        historyMap[habit.id] = await getHabitHistory(habit.id);
      }
      if (mounted) setAllHistory(historyMap);
      setLoading(false);
    };
    if (habits.length > 0) fetchAllHistory();
    return () => { mounted = false; };
  }, [habits, getHabitHistory]);

  const triggerConfetti = useConfetti();

  // --- Consistency Score Data ---
  const getNumDaysInRange = () => {
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days++;
    }
    return days;
  };
  const numDaysInRange = getNumDaysInRange();
  const consistencyScores = habits.map(habit => {
    const history = filterHistory(allHistory[habit.id] || []);
    const completedDays = new Set(history.filter(h => h.completed).map(h => h.date)).size;
    const score = numDaysInRange > 0 ? Math.round((completedDays / numDaysInRange) * 100) : 0;
    return { habit, score };
  });

  useEffect(() => {
    // Trigger confetti if any habit's consistency score >= 90%
    if (consistencyScores.some(({ score }) => score >= 90)) {
      triggerConfetti({ particleCount: 150, spread: 100 });
    }
  }, [consistencyScores]);

  if (loading) {
    // Show skeleton loaders for widgets
    return (
      <div className="min-h-screen p-4 md:p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </header>
        <div className="card mb-6 animate-pulse h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Handle widget resize
  const handleWidgetResize = (id: string, size: WidgetSize) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, size } : w));
  };

  const handleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleWidgetPin = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const { toggleDarkMode, accentColor, setAccentColor } = useContext(ThemeContext);

  return (
    <ThemeProvider>
      <div className="min-h-screen p-4 md:p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="btn-secondary p-2">
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="btn-secondary p-2"
            >
              <FaMoon />
            </button>

            {/* Accent Color Picker */}
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Choose Accent Color"
            />

            {/* Habit Selector */}
            <select
              value={selectedHabit}
              onChange={(e) => {
                setSelectedHabit(e.target.value);
                if (e.target.value !== 'all') {
                  const habit = habits.find(h => h.id === e.target.value);
                  if (habit) setSelectedHabitForDetail(habit);
                }
              }}
              className="input max-w-xs"
            >
              <option value="all">All Habits</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.icon} {habit.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FaCalendarAlt /> Date Range
          </h2>
          <DateRangePicker
            startDate={rangeStart}
            endDate={rangeEnd}
            onStartDateChange={setRangeStart}
            onEndDateChange={setRangeEnd}
          />
        </div>

        {/* Customizable Dashboard */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {widgets.map((widget) => (
                  <CustomizableWidget
                    key={widget.id}
                    widget={widget}
                    onResize={(size) => handleWidgetResize(widget.id, size)}
                    onToggleVisibility={() => handleWidgetVisibility(widget.id)}
                    onTogglePin={() => handleWidgetPin(widget.id)}
                  >
                    {widget.type === 'weeklyProgress' && (
                      <div className={`h-${widget.size === 'large' ? '64' : widget.size === 'medium' ? '48' : '32'}`}>
                        {/* Weekly Progress Chart */}
                      </div>
                    )}
                    {/* Add other widget types here */}
                  </CustomizableWidget>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Widget Button */}
        <button className="fixed bottom-20 right-6 btn-primary rounded-full p-4 shadow-lg">
          <FaPlus className="w-6 h-6" />
        </button>

        {/* Add DailyDetailsModal */}
        <DailyDetailsModal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate || ''}
          habits={habits}
          history={allHistory}
        />

        {/* Add HabitDetailDrawer */}
        {selectedHabitForDetail && (
          <HabitDetailDrawer
            isOpen={!!selectedHabitForDetail}
            onClose={() => setSelectedHabitForDetail(null)}
            habit={selectedHabitForDetail}
            history={allHistory[selectedHabitForDetail.id] || []}
            onEdit={() => {}}
            onDelete={() => {}}
            onComplete={() => {}}
            onUndo={() => {}}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default Analytics; 