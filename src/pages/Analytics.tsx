import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaFire, FaTimes, FaMoon, FaSun, FaGripVertical, FaEye, FaEyeSlash, FaThumbtack, FaCalendarDay, FaCalendarWeek, FaCalendar, FaCheck, FaEdit, FaUndo, FaTrash, FaChartLine, FaLightbulb, FaLink } from 'react-icons/fa';
import useHabitStore, { Habit, HabitCategory } from '../store/habitStore';
import { useThemeStore } from '../store/themeStore';
import { AnimatePresence, motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { useConfetti } from '../hooks/useConfetti';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Updated interface for history items to match habitStore
type HabitHistory = {
  date: string;
  count: number;
  completed: boolean;
  timeOfCompletion?: string;
};

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
                  {habit.countType === 'count' && (
                    <p className="text-sm text-gray-500">
                      {habit.count} {habit.countUnit}
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
  onEndDateChange,
  onShowAnalysis
}: { 
  startDate: string; 
  endDate: string; 
  onStartDateChange: (date: string) => void; 
  onEndDateChange: (date: string) => void; 
  onShowAnalysis: () => void;
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

  const setYearRange = (offset: number = 0) => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() + offset);
    start.setMonth(0);
    start.setDate(1);
    if (offset === 0) {
      end.setDate(end.getDate());
    } else {
      end.setFullYear(end.getFullYear() + offset + 1);
      end.setMonth(0);
      end.setDate(0);
    }
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const quickRanges = [
    { label: 'Last 7 Days', icon: <FaCalendarDay />, onClick: () => setDateRange(7) },
    { label: 'Last 30 Days', icon: <FaCalendarWeek />, onClick: () => setDateRange(30) },
    { label: 'This Month', icon: <FaCalendar />, onClick: () => setMonthRange(0) },
    { label: 'Last Year', icon: <FaCalendar />, onClick: () => setYearRange(-1) },
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
      
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={e => onStartDateChange(e.target.value)}
            className="input px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-base font-medium text-opacity-100 dark:text-opacity-100"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={maxDate}
            onChange={e => onEndDateChange(e.target.value)}
            className="input px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-base font-medium text-opacity-100 dark:text-opacity-100"
            style={{ color: 'inherit', opacity: 1 }}
          />
        </div>
        <button
          onClick={onShowAnalysis}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <FaChartLine />
          Show Analysis
        </button>
      </div>
    </div>
  );
};

// Widget type definition
type WidgetType = 'weeklyProgress' | 'categoryStats' | 'streak' | 'habitCalendar' | 'timeAnalysis' | 'consistencyScore' | 'yearGrid' | 'circleProgress' | 'growthGraph' | 'habitsCorrelation' | 'yearProgressGrid';
type WidgetSize = 'small' | 'medium' | 'large';

interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  visible: boolean;
  pinned: boolean;
}

// Default widgets configuration
const DEFAULT_WIDGETS: Widget[] = [
  { id: '1', type: 'weeklyProgress', size: 'large', visible: true, pinned: false },
  { id: '2', type: 'categoryStats', size: 'medium', visible: true, pinned: false },
  { id: '3', type: 'streak', size: 'small', visible: true, pinned: false },
  { id: '4', type: 'habitCalendar', size: 'large', visible: true, pinned: false },
  { id: '5', type: 'timeAnalysis', size: 'medium', visible: true, pinned: false },
  { id: '6', type: 'consistencyScore', size: 'medium', visible: true, pinned: false },
  { id: '7', type: 'yearGrid', size: 'large', visible: true, pinned: false },
  { id: '8', type: 'circleProgress', size: 'medium', visible: true, pinned: false },
  { id: '9', type: 'growthGraph', size: 'large', visible: true, pinned: false },
  { id: '10', type: 'habitsCorrelation', size: 'large', visible: true, pinned: false },
  { id: '11', type: 'yearProgressGrid', size: 'large', visible: true, pinned: false },
];

// Customizable Widget Component
const CustomizableWidget = ({ 
  widget, 
  onResize, 
  onToggleVisibility, 
  onTogglePin,
  children 
}: { 
  widget: Widget; 
  onResize: (id: string, size: WidgetSize) => void;
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
          className={`card relative ${widget.pinned ? 'ring-2 ring-accent-light dark:ring-accent-dark' : ''} ${
            widget.size === 'small' ? 'col-span-1' : 
            widget.size === 'medium' ? 'col-span-1 md:col-span-1 lg:col-span-1' : 
            'col-span-1 md:col-span-2 lg:col-span-2'
          }`}
        >
          {/* Widget Controls */}
          <div 
            {...provided.dragHandleProps}
            className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-move opacity-30 hover:opacity-100"
            title="Drag to rearrange"
          >
            <FaGripVertical size={16} />
            </div>
          <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
              onClick={onTogglePin}
              className={`p-1 rounded-full ${widget.pinned ? 'text-accent-light dark:text-accent-dark' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              title={widget.pinned ? "Unpin widget" : "Pin widget"}
              >
              <FaThumbtack size={14} />
              </button>
              <button
              onClick={() => onResize(widget.id, widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Resize widget"
            >
              {widget.size === 'small' ? '▢' : widget.size === 'medium' ? '▣' : '◻'}
              </button>
            <button
              onClick={onToggleVisibility}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={widget.visible ? "Hide widget" : "Show widget"}
            >
              {widget.visible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
            </div>
          <div className="pt-8">
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Habit Detail Drawer Component
const HabitDetailDrawer = ({ 
  onClose, 
  habit, 
  history,
  onEdit,
  onDelete,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(habit.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <AnimatePresence>
      <motion.div
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      >
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Habit Details</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
            </button>
          </div>

            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
              >
                {habit.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{habit.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {habit.category}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {habit.frequency}
                  </span>
                </div>
              </div>
            <button
              onClick={() => onEdit(habit)}
                className="ml-auto btn-secondary p-2 rounded-full"
            >
                <FaEdit size={16} />
            </button>
          </div>

            {habit.description && (
              <p className="mb-6 text-gray-600 dark:text-gray-400">{habit.description}</p>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                <span className="font-semibold">{habit.streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Target</span>
                <span className="font-semibold">{habit.target} {habit.countType === 'count' ? habit.countUnit : 'times'}</span>
            </div>
          </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map(entry => (
                <div 
                    key={entry.date}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {entry.count > 0 && habit.countType === 'count' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {entry.count} {habit.countUnit}
                        </span>
                      )}
                      {entry.timeOfCompletion && (
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timeOfCompletion).toLocaleTimeString([], {
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      )}
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
              onClick={handleDeleteClick}
            className="btn-danger w-full mt-6 flex items-center justify-center gap-2"
          >
            <FaTrash /> Delete Habit
          </button>
        </div>
      </motion.div>
    </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </>
  );
};

const Analytics = () => {
  const { 
    habits, 
    deleteHabit, 
    completeHabit, 
    undoCompleteHabit, 
    getCategoryStats, 
    getWeeklyCompletion, 
    getLongestStreak,
    getCompletionStats
  } = useHabitStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [allHistory, setAllHistory] = useState<Record<string, HabitHistory[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | 'all'>('all');
  
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
              ['weeklyProgress', 'categoryStats', 'streak', 'habitCalendar', 'timeAnalysis', 'consistencyScore', 'yearGrid', 'circleProgress', 'growthGraph', 'habitsCorrelation', 'yearProgressGrid'].includes(w.type) &&
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
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

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

  const [showRangeAnalysis, setShowRangeAnalysis] = useState(false);

  // Helper: filter history by date range
  const filterHistory = (history: HabitHistory[]) =>
    history.filter(h => h.date >= rangeStart && h.date <= rangeEnd);

  // Load data from habit store
  useEffect(() => {
      const historyMap: Record<string, HabitHistory[]> = {};
  
      for (const habit of habits) {
      historyMap[habit.id] = habit.history;
      }
  
    setAllHistory(historyMap);
      setLoading(false);
  }, [habits]);

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
  const [_, setConsistencyScores] = useState<{ habit: Habit; score: number }[]>([]);

  // Update consistency scores whenever habits or date range changes
  useEffect(() => {
    const scores = habits.map(habit => {
      const history = filterHistory(habit.history || []);
    const completedDays = new Set(history.filter(h => h.completed).map(h => h.date)).size;
    const score = numDaysInRange > 0 ? Math.round((completedDays / numDaysInRange) * 100) : 0;
    return { habit, score };
  });
    setConsistencyScores(scores);

    // Trigger confetti if any habit's consistency score >= 90%
    if (scores.some(({ score }) => score >= 90)) {
      triggerConfetti({ particleCount: 150, spread: 100 });
    }
  }, [habits, rangeStart, rangeEnd, numDaysInRange, triggerConfetti, filterHistory]);

  // --- Consistency Analysis for Selected Range ---
  const getRangeAnalysis = () => {
    // For each habit, calculate consistency in the selected range
    const rangeDays = (() => {
      const start = new Date(rangeStart);
      const end = new Date(rangeEnd);
      let days = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days++;
      return days;
    })();
    return habits.map(habit => {
      const history = filterHistory(habit.history || []);
      const completedDays = new Set(history.filter(h => h.completed).map(h => h.date)).size;
      const score = rangeDays > 0 ? Math.round((completedDays / rangeDays) * 100) : 0;
      return { habit, score, completedDays, rangeDays };
    });
  };

  // Handle widget resize
  const handleWidgetResize = (id: string, size: WidgetSize) => {
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, size } : w);
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };

  const handleWidgetVisibility = (id: string) => {
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };

  const handleWidgetPin = (id: string) => {
    // Toggle pin status
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w);
    
    // Sort widgets so pinned ones are at the top
    updatedWidgets.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return parseInt(a.id) - parseInt(b.id);
    });
    
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Ensure pinned widgets stay at the top after drag
    const pinnedWidgets = items.filter(w => w.pinned);
    const unpinnedWidgets = items.filter(w => !w.pinned);
    
    const updatedWidgets = [...pinnedWidgets, ...unpinnedWidgets];
    setWidgets(updatedWidgets);
    localStorage.setItem('widgets', JSON.stringify(updatedWidgets));
  };

  const addWidget = (type: WidgetType) => {
    const newId = (Math.max(0, ...widgets.map(w => parseInt(w.id))) + 1).toString();
    setWidgets([...widgets, {
      id: newId,
      type,
      size: 'medium',
      visible: true,
      pinned: false
    }]);
    setShowWidgetModal(false);
  };

  // Handler for habit completion
  const handleCompleteHabit = (habitId: string) => {
    completeHabit(habitId);
    // The analytics will update automatically due to the effects watching habits
  };

  // Handler for undo habit completion
  const handleUndoHabit = (habitId: string) => {
    undoCompleteHabit(habitId);
    // The analytics will update automatically due to the effects watching habits
  };

  // Handler for habit editing
  const handleEditHabit = () => {
    setSelectedHabitForDetail(null);
    // You would typically show the edit modal here
  };

  // Handler for habit deletion
  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
    setSelectedHabitForDetail(null);
  };

  // Get today's data
  const [todaySummary, setTodaySummary] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    longestStreak: 0
  });

  // Update analytics data whenever habits change
  useEffect(() => {
    const stats = getCompletionStats();
    const longestStreakVal = getLongestStreak();
    const percentage = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;
    
    setTodaySummary({
      completed: stats.completed,
      total: stats.total,
      percentage,
      longestStreak: longestStreakVal
    });
  }, [habits, getCompletionStats, getLongestStreak]);

  // Category statistics for the chart
  const [statData, setStatData] = useState({
    categoryStats: {} as Record<HabitCategory, number>,
    weeklyCompletionData: [] as Array<{ day: string; completed: number; total: number }>
  });

  // Update widget data when habits change
  useEffect(() => {
    const catStats = getCategoryStats();
    const weeklyData = getWeeklyCompletion();
    
    setStatData({
      categoryStats: catStats,
      weeklyCompletionData: weeklyData
    });
  }, [habits, getCategoryStats, getWeeklyCompletion]);

  // Weekly completion data will be managed by statData
  
  // Longest streak
  const longestStreak = getLongestStreak();

  // Before the return statement of Analytics, add:
  let habitCalendarGrid: React.ReactNode = null;
  if (selectedHabit !== 'all') {
    const habit = habits.find(h => h.id === selectedHabit);
    if (habit) {
      const calendarData = habit.history
        .filter(h => h.date >= rangeStart && h.date <= rangeEnd)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const dateMap = new Map(
        calendarData.map(entry => [entry.date, entry.completed])
      );
      const days: any[] = [];
      const start = new Date(rangeStart);
      const end = new Date(rangeEnd);
      const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      for (let i = 0; i < 7; i++) {
        days.push({ type: 'label', text: dayLabels[i] });
      }
      const firstDay = start.getDay();
      for (let i = 0; i < firstDay; i++) {
        days.push({ type: 'spacer' });
      }
      for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dateStr = day.toISOString().split('T')[0];
        const dayOfWeek = day.getDay();
        const date = day.getDate();
        const completed = dateMap.get(dateStr) || false;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        days.push({ type: 'day', date: dateStr, dayOfWeek, day: date, completed, isToday });
      }
      habitCalendarGrid = (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Habit Calendar</h3>
          <div className="grid grid-cols-7 gap-1 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 p-3 rounded-xl shadow-inner">
            {days.map((item, idx) => {
              if (item.type === 'label') {
                return (
                  <div key={`label-${idx}`} className="text-xs font-bold text-center text-blue-500 dark:text-blue-300 pb-1">
                    {item.text}
                  </div>
                );
              }
              if (item.type === 'spacer') {
                return <div key={`spacer-${idx}`} />;
              }
              return (
                <div 
                  key={item.date}
                  onClick={() => item.date ? setSelectedDate(item.date) : null}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all duration-150
                    ${item.completed 
                      ? 'bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 font-bold shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-200'}
                  ${item.isToday ? 'ring-2 ring-blue-400 dark:ring-blue-300 scale-110 z-10' : ''}
                `}
                  style={{ minWidth: 28, minHeight: 28 }}
                  title={item.date}
                >
                  {item.day}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }

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

  // Widget Modal
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
              <button 
                onClick={() => addWidget('yearGrid')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">🗓️</div>
                <span className="text-sm font-medium">Year Grid</span>
              </button>
              <button 
                onClick={() => addWidget('circleProgress')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">⭕</div>
                <span className="text-sm font-medium">Circle Progress</span>
              </button>
              <button 
                onClick={() => addWidget('growthGraph')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <span className="text-sm font-medium">Growth Graph</span>
              </button>
              <button 
                onClick={() => addWidget('habitsCorrelation')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">🔗</div>
                <span className="text-sm font-medium">Habits Correlation</span>
              </button>
              <button 
                onClick={() => addWidget('yearProgressGrid')}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">📅</div>
                <span className="text-sm font-medium">Year Progress Grid</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
      <div className="min-h-screen p-4 md:p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="btn-secondary p-2">
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-secondary flex items-center gap-2">
              <FaArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
          <motion.button
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={toggleTheme}
              className="btn-secondary p-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FaSun className="w-5 h-5" />
            ) : (
              <FaMoon className="w-5 h-5" />
            )}
          </motion.button>

            {/* Habit Selector */}
            <select
              value={selectedHabit}
              onChange={(e) => {
                setSelectedHabit(e.target.value);
                if (e.target.value !== 'all') {
                  const habit = habits.find(h => h.id === e.target.value);
                  if (habit) setSelectedHabitForDetail(habit);
              } else {
                setSelectedHabitForDetail(null);
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

      {/* Today's Summary */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FaCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
              <p className="text-xl font-bold">{todaySummary.completed} / {todaySummary.total}</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FaFire className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
              <p className="text-xl font-bold">{todaySummary.longestStreak} days</p>
            </div>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="w-14 h-14 rounded-full mr-4 flex items-center justify-center border-4" 
                style={{ 
                  borderColor: todaySummary.percentage >= 75 ? '#4ade80' : 
                             todaySummary.percentage >= 50 ? '#eab308' : 
                             todaySummary.percentage > 0 ? '#ef4444' : '#d1d5db',
                  background: `conic-gradient(
                    ${todaySummary.percentage >= 75 ? '#4ade80' : 
                      todaySummary.percentage >= 50 ? '#eab308' : 
                      todaySummary.percentage > 0 ? '#ef4444' : '#d1d5db'} ${todaySummary.percentage * 3.6}deg, 
                    #e5e7eb ${todaySummary.percentage * 3.6}deg
                  )`
                }}
            >
              <span className="text-sm font-bold">{todaySummary.percentage}%</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-xl font-bold">{todaySummary.percentage}%</p>
            </div>
          </div>
        </div>
      </div>

        {/* Date Range Filter & Range Analysis Combined */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FaCalendarAlt /> Date Range & Analysis
          </h2>
          <DateRangePicker
            startDate={rangeStart}
            endDate={rangeEnd}
            onStartDateChange={setRangeStart}
            onEndDateChange={setRangeEnd}
            onShowAnalysis={() => setShowRangeAnalysis(true)}
          />

          {/* Range Analysis Section (inline) */}
          {showRangeAnalysis && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <FaChartLine /> Analysis for Selected Period
                </h2>
                <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setShowRangeAnalysis(false)}>
                  Close
                </button>
              </div>
              <div className="mb-4 text-gray-500 dark:text-gray-400 text-sm">
                Showing consistency and progress for the selected period: <b>{rangeStart}</b> to <b>{rangeEnd}</b>
              </div>
              <div className="space-y-4">
                {getRangeAnalysis().map(({ habit, score, completedDays, rangeDays }: { habit: Habit; score: number; completedDays: number; rangeDays: number }) => (
                  <div key={habit.id} className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-xs text-gray-500">{completedDays}/{rangeDays} days</span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-light to-green-400 dark:from-primary-dark dark:to-green-600 transition-all"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm font-semibold">{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customizable Dashboard */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
            <button 
              onClick={() => setShowWidgetModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" /> Add Widget
            </button>
          </div>
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <FaGripVertical className="w-4 h-4 text-blue-500/40 dark:text-blue-300/40" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Tip:</span> Drag and drop widgets to rearrange them. Use the controls in the top-right of each widget to customize your analytics view.
            </p>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {widgets
                  .filter(w => w.visible !== false) // Handle both undefined and false cases
                  .map((widget) => (
                  <CustomizableWidget
                    key={widget.id}
                    widget={widget}
                    onResize={handleWidgetResize}
                    onToggleVisibility={() => handleWidgetVisibility(widget.id)}
                    onTogglePin={() => handleWidgetPin(widget.id)}
                  >
                    {widget.type === 'weeklyProgress' && (
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
                          <div className="space-y-4">
                            {statData.weeklyCompletionData.map((day) => (
                              <div key={day.day} className="flex items-center">
                                <span className="w-10 text-sm text-gray-500">{day.day}</span>
                                <div className="flex-1 mx-2 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-primary-light dark:bg-primary-dark"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                  />
                                </div>
                                <span className="w-16 text-right text-sm">{day.completed}/{day.total}</span>
                              </div>
                            ))}
                          </div>
                      </div>
                    )}
                    
                    {widget.type === 'categoryStats' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Habit Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(statData.categoryStats).map(([category, count]) => (
                            <div key={category} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ 
                                  backgroundColor: 
                                    category === 'health' ? '#4ade80' : 
                                    category === 'productivity' ? '#3b82f6' : 
                                    category === 'learning' ? '#a855f7' : 
                                    category === 'mindfulness' ? '#ec4899' :
                                    category === 'finance' ? '#eab308' :
                                    category === 'social' ? '#f97316' : '#64748b'
                                }}
                              />
                              <span className="text-sm capitalize">{category}</span>
                              <span className="ml-auto text-sm font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'streak' && (
                      <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold mb-2">Longest Streak</h3>
                        <div className="flex items-center justify-center">
                          <FaFire className="text-orange-500 text-2xl mr-2" />
                          <span className="text-3xl font-bold">{longestStreak}</span>
                          <span className="text-lg ml-1">days</span>
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'consistencyScore' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Consistency Trends</h3>
                        {(() => {
                          // Get habits with their consistency scores
                          const habitScores = habits.map(habit => {
                            const history = filterHistory(habit.history || []);
                            const completedDays = new Set(history.filter(h => h.completed).map(h => h.date)).size;
                            const score = numDaysInRange > 0 ? Math.round((completedDays / numDaysInRange) * 100) : 0;
                            return { habit, score };
                          }).sort((a, b) => b.score - a.score);
                          
                          if (habitScores.length === 0) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No habits to display
                                </p>
                              </div>
                            );
                          }
                          
                          // Calculate dates for x-axis (last 7 days if range is longer than 7 days)
                          // const chartDates: string[] = []; // Unused
                          const endDate = new Date(rangeEnd);
                          let startPoint = new Date(rangeStart);
                          
                          // Use either the full date range or last 7 periods (days, weeks, or months depending on range length)
                          const daysInRange = Math.floor((endDate.getTime() - new Date(rangeStart).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          
                          // Determine appropriate interval based on date range length
                          let interval = 1; // days
                          let intervalLabel = 'day';
                          
                          if (daysInRange > 30) {
                            interval = 7; // weeks
                            intervalLabel = 'week';
                          } 
                          
                          if (daysInRange > 90) {
                            interval = 30; // months (approx)
                            intervalLabel = 'month';
                          }
                          
                                                     // Generate intervals
                           const intervals: {startDate: Date, endDate: Date}[] = [];
                           let currentDate = new Date(endDate);
                          for (let i = 0; i < 7; i++) {
                            if (currentDate < startPoint) break;
                            
                            intervals.unshift({
                              endDate: new Date(currentDate),
                              startDate: new Date(currentDate.setDate(currentDate.getDate() - interval))
                            });
                            
                            // Set up for next iteration
                            currentDate = new Date(intervals[0].startDate);
                            currentDate.setDate(currentDate.getDate() - 1);
                          }
                          
                          // Sort intervals chronologically
                          intervals.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
                          
                          // Calculate consistency score for each habit for each interval
                          const habitTrends = habitScores.slice(0, 5).map(({ habit }) => {
                            const dataPoints = intervals.map(interval => {
                              const daysInInterval = Math.floor((interval.endDate.getTime() - interval.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                              
                              const relevantHistory = habit.history.filter(entry => {
                                const entryDate = new Date(entry.date);
                                return entryDate >= interval.startDate && entryDate <= interval.endDate;
                              });
                              
                              const completedDays = new Set(relevantHistory.filter(h => h.completed).map(h => h.date)).size;
                              return daysInInterval > 0 ? Math.round((completedDays / daysInInterval) * 100) : 0;
                            });
                            
                            return {
                              habit,
                              dataPoints
                            };
                          });
                          
                          // Create labels for x-axis
                          const xLabels = intervals.map(interval => {
                            if (intervalLabel === 'day') {
                              return interval.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            } else if (intervalLabel === 'week') {
                              return `${interval.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                            } else {
                              return interval.startDate.toLocaleDateString('en-US', { month: 'short' });
                            }
                          });
                          
                          // Generate colors for each habit
                          const colors = [
                            { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)' }, // blue
                            { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)' }, // green
                            { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)' }, // yellow
                            { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }, // red
                            { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)' }, // purple
                          ];
                          
                          return (
                            <div>
                              {/* Line chart */}
                              <div className="relative h-52 mt-6 mb-8">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500 py-2">
                                  <div>100%</div>
                                  <div>75%</div>
                                  <div>50%</div>
                                  <div>25%</div>
                                  <div>0%</div>
                                </div>
                                
                                {/* Chart area */}
                                <div className="absolute left-8 right-0 top-0 bottom-0 border-l border-b border-gray-200 dark:border-gray-700">
                                  {/* Grid lines */}
                                  <div className="absolute left-0 right-0 h-full flex flex-col justify-between pointer-events-none">
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
                                  </div>
                                  
                                  {/* X-axis labels */}
                                  <div className="absolute left-0 right-0 bottom-0 translate-y-6 flex justify-between text-xs text-gray-500">
                                    {xLabels.map((label, i) => (
                                      <div key={i} className="text-center" style={{ width: `${100 / xLabels.length}%` }}>
                                        {label}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Line chart */}
                                  <svg className="w-full h-full overflow-visible">
                                    {habitTrends.map((trend, habitIndex) => {
                                      // Skip if no data points
                                      if (trend.dataPoints.length === 0) return null;
                                      
                                      const color = colors[habitIndex % colors.length];
                                      
                                      // Calculate path for the line
                                      const pathPoints = trend.dataPoints.map((point, i) => {
                                        const x = (i / (trend.dataPoints.length - 1)) * 100;
                                        const y = 100 - point;
                                        return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                                      }).join(' ');
                                      
                                      // Calculate area fill path
                                      const areaPath = `${pathPoints} L 100% 100% L 0% 100% Z`;
                                      
                                      return (
                                        <g key={trend.habit.id}>
                                          {/* Area fill */}
                                          <path 
                                            d={areaPath} 
                                            fill={color.fill}
                                            className="dark:opacity-50"
                                          />
                                          
                                          {/* Line */}
                                          <path 
                                            d={pathPoints} 
                                            stroke={color.stroke} 
                                            strokeWidth="2"
                                            fill="none"
                                            className="dark:opacity-80"
                                          />
                                          
                                          {/* Data points */}
                                          {trend.dataPoints.map((point, i) => {
                                            const x = (i / (trend.dataPoints.length - 1)) * 100;
                                            const y = 100 - point;
                                            return (
                                              <g key={i}>
                                                <circle 
                                                  cx={`${x}%`} 
                                                  cy={`${y}%`} 
                                                  r="3" 
                                                  fill={color.stroke}
                                                  className="dark:opacity-80"
                                                />
                                                <title>{point}%</title>
                                              </g>
                                            );
                                          })}
                                        </g>
                                      );
                                    })}
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Legend */}
                              <div className="flex flex-wrap gap-4 mt-12">
                                {habitTrends.map((trend, i) => (
                                  <div key={trend.habit.id} className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: colors[i % colors.length].stroke }}
                                    />
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm">{trend.habit.icon}</span>
                                      <span className="text-sm truncate max-w-[100px]">{trend.habit.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Current score display */}
                              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium mb-3">Current Consistency</h4>
                                <div className="space-y-3">
                                  {habitScores.slice(0, 5).map(({ habit, score }) => (
                                    <div key={habit.id} className="flex items-center">
                                      <span className="text-xl mr-2">{habit.icon}</span>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-sm font-medium truncate">{habit.name}</span>
                                          <span className="text-sm font-semibold">{score}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    
                    {widget.type === 'habitCalendar' && selectedHabit !== 'all' && habitCalendarGrid}
                    
                    {widget.type === 'habitCalendar' && selectedHabit === 'all' && (
                      <div className="p-4 flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-500 dark:text-gray-400 mb-2">
                            Select a specific habit to view calendar
                          </p>
                          <div className="inline-flex gap-2 flex-wrap justify-center">
                            {habits.slice(0, 3).map(habit => (
                              <button
                                key={habit.id}
                                onClick={() => setSelectedHabit(habit.id)}
                                className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1"
                              >
                                <span>{habit.icon}</span>
                                <span>{habit.name}</span>
                              </button>
                            ))}
                            {habits.length > 3 && (
                              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800">
                                +{habits.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'timeAnalysis' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Completion Time Analysis</h3>
                        <div className="space-y-4">
                          {(() => {
                            // Process time data from all habits' history
                            const timeData = {
                              morning: 0,
                              afternoon: 0,
                              evening: 0,
                              night: 0
                            };
                            
                            let totalCompletions = 0;
                            
                            habits.forEach(habit => {
                              habit.history.forEach(entry => {
                                if (entry.completed && entry.timeOfCompletion) {
                                  totalCompletions++;
                                  const hour = new Date(entry.timeOfCompletion).getHours();
                                  
                                  if (hour >= 5 && hour < 12) timeData.morning++;
                                  else if (hour >= 12 && hour < 17) timeData.afternoon++;
                                  else if (hour >= 17 && hour < 22) timeData.evening++;
                                  else timeData.night++;
                                }
                              });
                            });
                            
                            const timeSlots = [
                              { label: 'Morning (5am-12pm)', value: timeData.morning, color: '#3b82f6' },
                              { label: 'Afternoon (12pm-5pm)', value: timeData.afternoon, color: '#eab308' },
                              { label: 'Evening (5pm-10pm)', value: timeData.evening, color: '#ec4899' },
                              { label: 'Night (10pm-5am)', value: timeData.night, color: '#64748b' },
                            ];
                            
                            if (totalCompletions === 0) {
                              return (
                                <div className="text-center py-8">
                                  <p className="text-gray-500 dark:text-gray-400">
                                    No completion data available yet
                                  </p>
                                </div>
                              );
                            }
                            
                            return timeSlots.map(slot => {
                              const percentage = Math.round((slot.value / totalCompletions) * 100) || 0;
                              
                              return (
                                <div key={slot.label}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm">{slot.label}</span>
                                    <span className="text-sm font-semibold">{percentage}%</span>
                                  </div>
                                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                      className="h-full"
                                      style={{ backgroundColor: slot.color }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8 }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        
                        <div className="mt-4 text-center">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            You are most productive in the{' '}
                            {(() => {
                              // Find the time period with most completions
                              const timeData = {
                                morning: 0,
                                afternoon: 0,
                                evening: 0,
                                night: 0
                              };
                              
                              habits.forEach(habit => {
                                habit.history.forEach(entry => {
                                  if (entry.completed && entry.timeOfCompletion) {
                                    const hour = new Date(entry.timeOfCompletion).getHours();
                                    
                                    if (hour >= 5 && hour < 12) timeData.morning++;
                                    else if (hour >= 12 && hour < 17) timeData.afternoon++;
                                    else if (hour >= 17 && hour < 22) timeData.evening++;
                                    else timeData.night++;
                                  }
                                });
                              });
                              
                              const maxTime = Object.entries(timeData).reduce(
                                (max, [key, val]) => val > max.val ? { key, val } : max,
                                { key: 'morning', val: 0 }
                              );
                              
                              return maxTime.val === 0 ? 'morning' : maxTime.key;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}

                    {widget.type === 'yearGrid' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Year Streak Grid</h3>
                        <div className="flex flex-col space-y-2">
                          {(() => {
                            const habit = habits.find(h => h.id === selectedHabit);
                            if (!habit && selectedHabit !== 'all') {
                              return (
                                <div className="text-center py-4">
                                  <p className="text-gray-500 dark:text-gray-400">Please select a habit to view its yearly streak</p>
                                </div>
                              );
                            }
                            
                            // Determine which habits to show
                            const habitsToShow = selectedHabit === 'all' ? habits : [habit!];
                            
                            return habitsToShow.map(h => {
                              // Create a year grid of contributions
                              const today = new Date();
                              const oneYearAgo = new Date();
                              oneYearAgo.setFullYear(today.getFullYear() - 1);
                              
                              // Get all dates from the past year
                              const dates: string[] = [];
                              for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                                dates.push(new Date(d).toISOString().split('T')[0]);
                              }
                              
                              // Create a map of completed dates
                              const completedDatesMap = new Map<string, boolean>();
                              h.history.forEach(entry => {
                                if (entry.completed && dates.includes(entry.date)) {
                                  completedDatesMap.set(entry.date, true);
                                }
                              });
                              
                              // Calculate week rows and day columns
                              // weeks removed as unused
                              
                              return (
                                <div key={h.id} className="mb-6">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{h.icon}</span>
                                    <h4 className="font-medium">{h.name}</h4>
                                  </div>
                                  
                                  <div className="grid grid-cols-53 gap-1 overflow-x-auto pb-2">
                                    {Array.from({ length: dates.length }).map((_, index) => {
                                      const date = dates[index];
                                      const isCompleted = completedDatesMap.has(date);
                                      // const dayDate = new Date(date); // Unused variable
                                      // Unused variables removed
                                      // const month = dayDate.getMonth();
                                      // const dayOfMonth = dayDate.getDate();
                                      
                                      // Determine color intensity based on activity
                                      let cellClass = 'bg-gray-100 dark:bg-gray-800';
                                      if (isCompleted) {
                                        cellClass = 'bg-green-300 dark:bg-green-700';
                                      }
                                      
                                      return (
                                        <div 
                                          key={date} 
                                          className={`w-3 h-3 rounded-sm ${cellClass} hover:ring-1 hover:ring-blue-400`}
                                          title={`${date}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                                        />
                                      );
                                    })}
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{oneYearAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    <span>{today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {widget.type === 'circleProgress' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
                        {(() => {
                          const habit = habits.find(h => h.id === selectedHabit);
                          
                          // If no specific habit is selected or found
                          if (!habit && selectedHabit !== 'all') {
                            return (
                              <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">Please select a habit to view monthly progress</p>
                              </div>
                            );
                          }
                          
                          // Calculate monthly progress
                          const now = new Date();
                          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                          
                          const daysInMonth = monthEnd.getDate();
                          const habitsToShow = selectedHabit === 'all' ? habits : [habit!];
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {habitsToShow.map(h => {
                                // Count completed days this month
                                const completedDays = h.history.filter(entry => {
                                  const entryDate = new Date(entry.date);
                                  return entry.completed && 
                                         entryDate >= monthStart && 
                                         entryDate <= monthEnd;
                                }).length;
                                
                                // Calculate completion percentage
                                const completionPercentage = Math.round((completedDays / daysInMonth) * 100);
                                
                                // Calculate circle properties
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;
                                
                                return (
                                  <div key={h.id} className="flex flex-col items-center">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                      {/* Background circle */}
                                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle 
                                          cx="50" 
                                          cy="50" 
                                          r={radius} 
                                          fill="none" 
                                          stroke="currentColor" 
                                          strokeWidth="8"
                                          className="text-gray-200 dark:text-gray-700"
                                        />
                                        {/* Progress circle */}
                                        <circle 
                                          cx="50" 
                                          cy="50" 
                                          r={radius} 
                                          fill="none" 
                                          stroke="currentColor" 
                                          strokeWidth="8"
                                          strokeDasharray={circumference}
                                          strokeDashoffset={strokeDashoffset}
                                          strokeLinecap="round"
                                          className="text-primary-light dark:text-primary-dark transition-all duration-1000 ease-in-out"
                                          style={{ 
                                            transition: "stroke-dashoffset 1s ease-in-out",
                                          }}
                                        />
                                      </svg>
                                      <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold">{completionPercentage}%</span>
                                        <span className="text-xs text-gray-500">{completedDays}/{daysInMonth} days</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="text-xl">{h.icon}</span>
                                      <h4 className="font-medium text-sm">{h.name}</h4>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {widget.type === 'growthGraph' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaChartLine className="text-primary-light dark:text-primary-dark" />
                          Progress Over Time
                        </h3>
                        {(() => {
                          const habit = habits.find(h => h.id === selectedHabit);
                          
                          // If no specific habit is selected or found
                          if (!habit && selectedHabit !== 'all') {
                            return (
                              <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">Please select a habit to view progress graph</p>
                              </div>
                            );
                          }
                          
                          // Get start and end dates for analysis
                          const endDate = new Date(rangeEnd);
                          const startDate = new Date(rangeStart);
                          
                          // Number of days to analyze
                          const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          
                          const habitsToShow = selectedHabit === 'all' ? 
                            (habits.length > 3 ? habits.slice(0, 3) : habits) : [habit!];
                          
                          // Generate dates for the x-axis
                          const dates: string[] = [];
                          for (let i = 0; i < daysDiff; i++) {
                            const date = new Date(startDate);
                            date.setDate(startDate.getDate() + i);
                            dates.push(date.toISOString().split('T')[0]);
                          }
                          
                          // Chart height and width
                          const chartHeight = 200;
                          const chartWidth = Math.max(dates.length * 20, 300);
                          
                          return (
                            <div className="overflow-x-auto">
                              <div style={{ width: `${chartWidth}px`, minHeight: `${chartHeight + 50}px` }}>
                                <div className="relative" style={{ height: `${chartHeight}px` }}>
                                  {/* Y-axis labels */}
                                  <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
                                    <span>100%</span>
                                    <span>75%</span>
                                    <span>50%</span>
                                    <span>25%</span>
                                    <span>0%</span>
                                  </div>
                                  
                                  {/* Chart area */}
                                  <div className="absolute left-10 right-0 top-0 bottom-0 border-l border-b border-gray-300 dark:border-gray-700">
                                    {/* Horizontal grid lines */}
                                    <div className="absolute w-full h-1/4 border-t border-gray-200 dark:border-gray-800"></div>
                                    <div className="absolute w-full h-2/4 border-t border-gray-200 dark:border-gray-800"></div>
                                    <div className="absolute w-full h-3/4 border-t border-gray-200 dark:border-gray-800"></div>
                                    
                                    {/* Data lines for each habit */}
                                    {habitsToShow.map((h, habitIndex) => {
                                      const habitHistory = h.history;
                                      
                                      // Calculate completion rate for each date
                                      const dataPoints = dates.map(date => {
                                        const completed = habitHistory.find(entry => entry.date === date && entry.completed);
                                        return { 
                                          date,
                                          value: completed ? 1 : 0,
                                          tooltip: `${date}: ${completed ? 'Completed' : 'Missed'}`
                                        };
                                      });
                                      
                                      // Calculate rolling 7-day average
                                      const rollingAverage = [];
                                      for (let i = 0; i < dataPoints.length; i++) {
                                        const window = dataPoints.slice(Math.max(0, i - 6), i + 1);
                                        const avg = window.reduce((sum, dp) => sum + dp.value, 0) / window.length;
                                        rollingAverage.push({ 
                                          date: dataPoints[i].date, 
                                          value: avg, 
                                          tooltip: `${dataPoints[i].date}: ${Math.round(avg * 100)}% (7-day avg)`
                                        });
                                      }
                                      
                                      // Generate SVG path for the line
                                      const graphWidth = chartWidth - 10;
                                      const pointWidth = graphWidth / (dates.length - 1);
                                      
                                      const linePath = rollingAverage.map((point, i) => {
                                        const x = i * pointWidth;
                                        const y = chartHeight - (point.value * chartHeight);
                                        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                                      }).join(' ');
                                      
                                      // Color based on habit index
                                      const colors = [
                                        'text-blue-500 dark:text-blue-400',
                                        'text-green-500 dark:text-green-400',
                                        'text-purple-500 dark:text-purple-400',
                                      ];
                                      const color = colors[habitIndex % colors.length];
                                      
                                      return (
                                        <div key={h.id} className="absolute inset-0">
                                          {/* Line graph */}
                                          <svg width="100%" height="100%" className="overflow-visible">
                                            <path 
                                              d={linePath} 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="2"
                                              className={color}
                                            />
                                            
                                            {/* Data points */}
                                            {rollingAverage.map((point, i) => (
                                              <g key={i}>
                                                <circle 
                                                  cx={i * pointWidth} 
                                                  cy={chartHeight - (point.value * chartHeight)} 
                                                  r="3"
                                                  className={`${color} fill-white dark:fill-gray-800 cursor-pointer`}
                                                />
                                                <title>{point.tooltip}</title>
                                              </g>
                                            ))}
                                          </svg>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                {/* X-axis labels (dates) */}
                                <div className="ml-10 mt-2 flex justify-between text-xs text-gray-500">
                                  {dates.filter((_, i) => i % Math.ceil(dates.length / 5) === 0 || i === dates.length - 1).map(date => (
                                    <div key={date} className="text-center" style={{ width: '60px' }}>
                                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Legend */}
                                <div className="mt-4 flex flex-wrap gap-4">
                                  {habitsToShow.map((h, i) => {
                                    const colors = [
                                      'bg-blue-500 dark:bg-blue-400',
                                      'bg-green-500 dark:bg-green-400',
                                      'bg-purple-500 dark:bg-purple-400',
                                    ];
                                    return (
                                      <div key={h.id} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm">{h.icon}</span>
                                          <span className="text-sm">{h.name}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {widget.type === 'habitsCorrelation' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaLink className="text-primary-light dark:text-primary-dark" />
                          Habits Correlation
                        </h3>
                        {(() => {
                          // Need at least 2 habits to show correlations
                          if (habits.length < 2) {
                            return (
                              <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">Need at least 2 habits to show correlations</p>
                              </div>
                            );
                          }
                          
                          // Get date range for analysis
                          const startDate = new Date(rangeStart);
                          const endDate = new Date(rangeEnd);
                          
                          // Calculate correlations between habits
                          const correlations: {habit1: Habit, habit2: Habit, score: number, level: string, color: string}[] = [];
                          
                          // Process all habit pairs
                          for (let i = 0; i < habits.length; i++) {
                            for (let j = i + 1; j < habits.length; j++) {
                              const habit1 = habits[i];
                              const habit2 = habits[j];
                              
                              // Create date maps for both habits in range
                              const dates1: Record<string, boolean> = {};
                              const dates2: Record<string, boolean> = {};
                              
                              // Find all completion dates in range
                              habit1.history.forEach(entry => {
                                const date = new Date(entry.date);
                                if (date >= startDate && date <= endDate && entry.completed) {
                                  dates1[entry.date] = true;
                                }
                              });
                              
                              habit2.history.forEach(entry => {
                                const date = new Date(entry.date);
                                if (date >= startDate && date <= endDate && entry.completed) {
                                  dates2[entry.date] = true;
                                }
                              });
                              
                              // Get unique dates for each habit
                              const dates1Keys = Object.keys(dates1);
                              const dates2Keys = Object.keys(dates2);
                              
                              // Calculate intersection and union
                              const intersection = dates1Keys.filter(date => dates2Keys.includes(date));
                              const union = [...new Set([...dates1Keys, ...dates2Keys])];
                              
                              // Calculate Jaccard similarity index
                              const correlationScore = union.length > 0 ? intersection.length / union.length : 0;
                              
                              // Determine correlation level and color
                              let level: string;
                              let color: string;
                              
                              if (correlationScore >= 0.7) {
                                level = 'Strong';
                                color = 'text-green-600 dark:text-green-400';
                              } else if (correlationScore >= 0.4) {
                                level = 'Moderate';
                                color = 'text-blue-600 dark:text-blue-400';
                              } else if (correlationScore >= 0.2) {
                                level = 'Weak';
                                color = 'text-yellow-600 dark:text-yellow-400';
                              } else {
                                level = 'Very weak';
                                color = 'text-gray-600 dark:text-gray-400';
                              }
                              
                              // Only show correlations with at least some relationship
                              if (correlationScore > 0) {
                                correlations.push({
                                  habit1,
                                  habit2,
                                  score: Math.round(correlationScore * 100),
                                  level,
                                  color
                                });
                              }
                            }
                          }
                          
                          // Sort by correlation score (highest first)
                          correlations.sort((a, b) => b.score - a.score);
                          
                          if (correlations.length === 0) {
                            return (
                              <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">No correlations found in the selected date range</p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              {correlations.map((correlation, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <span className="text-xl">{correlation.habit1.icon}</span>
                                        <span className="mx-2">×</span>
                                        <span className="text-xl">{correlation.habit2.icon}</span>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${correlation.color}`}>
                                      {correlation.level} ({correlation.score}%)
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{correlation.habit1.name}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{correlation.habit2.name}</span>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <motion.div 
                                        className="h-full"
                                        style={{ backgroundColor: 
                                          correlation.score >= 70 ? '#10b981' : 
                                          correlation.score >= 40 ? '#3b82f6' : 
                                          correlation.score >= 20 ? '#eab308' : '#9ca3af'
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${correlation.score}%` }}
                                        transition={{ duration: 0.8 }}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {correlation.level === 'Strong' && 'These habits are often completed together'}
                                    {correlation.level === 'Moderate' && 'These habits are sometimes completed together'}
                                    {correlation.level === 'Weak' && 'These habits occasionally align'}
                                    {correlation.level === 'Very weak' && 'These habits rarely align'}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-4">
                                <div className="flex gap-2 items-start">
                                  <FaLightbulb className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Habits that show strong correlation may be complementary or part of the same routine. Consider grouping these habits together for better consistency.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {widget.type === 'yearProgressGrid' && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaCalendarAlt className="text-primary-light dark:text-primary-dark" />
                          Year Progress Grid
                        </h3>
                        {(() => {
                          const habit = habits.find(h => h.id === selectedHabit);
                          
                          if (!habit && selectedHabit !== 'all') {
                            return (
                              <div className="text-center py-4">
                                <p className="text-gray-500 dark:text-gray-400">Please select a habit to view yearly progress</p>
                              </div>
                            );
                          }
                          
                          // Generate dates for a full year
                          const now = new Date();
                          const oneYearAgo = new Date();
                          oneYearAgo.setFullYear(now.getFullYear() - 1);
                          oneYearAgo.setDate(now.getDate() + 1); // Start from tomorrow last year
                          
                          // Generate the full year of dates
                          const generateFullYear = () => {
                            const dates: string[] = [];
                            const startDate = new Date(oneYearAgo);
                            
                            // Generate 365 days (or 366 for leap year)
                            for (let i = 0; i < 366; i++) {
                              const currentDate = new Date(startDate);
                              currentDate.setDate(startDate.getDate() + i);
                              
                              // Stop if we reach tomorrow
                              if (currentDate > now) break;
                              
                              dates.push(currentDate.toISOString().split('T')[0]);
                            }
                            return dates;
                          };
                          
                          const yearDates = generateFullYear();
                          
                          // Organize dates into weeks (columns) and days (rows)
                          const generateCalendarGrid = (dates: string[]) => {
                            // Start with the day of week of the first date (0 = Sunday, 1 = Monday, etc.)
                            const firstDayOfWeek = new Date(dates[0]).getDay();
                            
                            // Create a 7×52 grid (7 days per week, 52 weeks per year, plus overflow)
                            const grid: (string | null)[][] = Array(7).fill(null).map(() => Array(54).fill(null));
                            
                            let week = 0;
                            let dayInWeek = firstDayOfWeek;
                            
                            // Fill in the grid with dates
                            dates.forEach(date => {
                              grid[dayInWeek][week] = date;
                              
                              // Move to the next day
                              dayInWeek = (dayInWeek + 1) % 7;
                              
                              // If we wrapped around to Sunday, move to the next week
                              if (dayInWeek === 0) {
                                week++;
                              }
                            });
                            
                            return grid;
                          };
                          
                          const calendarGrid = generateCalendarGrid(yearDates);
                          
                          // Get habits to display
                          const habitsToShow = selectedHabit === 'all' ? 
                            (habits.length > 3 ? habits.slice(0, 3) : habits) : [habit!];
                          
                          return (
                            <div className="space-y-6">
                              {habitsToShow.map(h => {
                                // Create a map of completed dates
                                const completionMap = new Map<string, boolean>();
                                h.history.forEach(entry => {
                                  if (entry.completed) {
                                    completionMap.set(entry.date, true);
                                  }
                                });
                                
                                // Calculate statistics
                                const totalDays = yearDates.length;
                                const completedDays = h.history.filter(entry => 
                                  yearDates.includes(entry.date) && entry.completed
                                ).length;
                                
                                const completionPercentage = Math.round((completedDays / totalDays) * 100);
                                
                                return (
                                  <div key={h.id}>
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{h.icon}</span>
                                        <h4 className="font-medium">{h.name}</h4>
                                      </div>
                                      <span className="text-sm font-medium">
                                        {completedDays} / {totalDays} days ({completionPercentage}%)
                                      </span>
                                    </div>
                                    
                                                      {/* Removed the redundant day labels since they're now part of the main grid */}
                                    
                                                      {/* Scrollable calendar grid with single scrollbar */}
                                     <div className="overflow-x-auto pb-3">
                                       <div style={{ minWidth: '770px' }}>
                                         {/* Month indicators that align with the columns below */}
                                         <div className="flex border-l border-gray-200 dark:border-gray-700 ml-8">
                                           {(() => {
                                             // Calculate months and their widths
                                             const monthLabels = [];
                                             let currentMonth = -1;
                                             let colSpan = 0;
                                             let monthsRendered = [];
                                             
                                             // Determine how many columns each month spans
                                             for (let i = 0; i < 53; i++) {
                                               // Get the first non-null date in each column
                                               let dateInColumn = null;
                                               for (let j = 0; j < 7; j++) {
                                                 if (calendarGrid[j][i]) {
                                                   dateInColumn = calendarGrid[j][i];
                                                   break;
                                                 }
                                               }
                                               
                                               if (!dateInColumn) continue;
                                               
                                               const month = new Date(dateInColumn).getMonth();
                                               
                                               if (month !== currentMonth) {
                                                 if (currentMonth !== -1) {
                                                   const date = new Date(oneYearAgo);
                                                   date.setMonth(currentMonth);
                                                   monthLabels.push(
                                                     <div 
                                                       key={currentMonth} 
                                                       className="text-xs font-medium text-gray-500 flex justify-center items-center h-6 border-r border-gray-200 dark:border-gray-700"
                                                       style={{ width: `${colSpan * 16}px` }}
                                                     >
                                                       {date.toLocaleDateString('en-US', { month: 'short' })}
                                                     </div>
                                                   );
                                                   monthsRendered.push(currentMonth);
                                                 }
                                                 currentMonth = month;
                                                 colSpan = 1;
                                               } else {
                                                 colSpan++;
                                               }
                                             }
                                             
                                             // Add the last month
                                             if (currentMonth !== -1 && !monthsRendered.includes(currentMonth)) {
                                               const date = new Date(oneYearAgo);
                                               date.setMonth(currentMonth);
                                               monthLabels.push(
                                                 <div 
                                                   key={currentMonth} 
                                                   className="text-xs font-medium text-gray-500 flex justify-center items-center h-6 border-r border-gray-200 dark:border-gray-700"
                                                   style={{ width: `${colSpan * 16}px` }}
                                                 >
                                                   {date.toLocaleDateString('en-US', { month: 'short' })}
                                                 </div>
                                               );
                                             }
                                             
                                             return monthLabels;
                                           })()}
                                         </div>
                                         
                                         {/* Main grid with day indicators + calendar cells */}
                                         <div className="flex">
                                           {/* Weekday labels column */}
                                           <div className="w-8 flex flex-col">
                                             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                               <div 
                                                 key={day} 
                                                 className="text-xs text-gray-500 h-4 flex items-center justify-end pr-2 my-0.5"
                                                 style={{ height: '16px' }}
                                               >
                                                 {day}
                                               </div>
                                             ))}
                                           </div>
                                           
                                           {/* Calendar grid */}
                                           <div className="grid grid-rows-7 grid-flow-col gap-1">
                                             {calendarGrid.flatMap((row, rowIndex) => 
                                               row.map((date, colIndex) => {
                                                 if (!date) return (
                                                   <div 
                                                     key={`empty-${rowIndex}-${colIndex}`}
                                                     className="w-3 h-3 opacity-0" 
                                                   />
                                                 );
                                                 
                                                 const isCompleted = completionMap.get(date) || false;
                                                 // const dayDate = new Date(date); // Unused
                                                 
                                                 // Determine intensity based on completion
                                                 let cellClass = "bg-gray-100 dark:bg-gray-800";
                                                 if (isCompleted) {
                                                   cellClass = "bg-green-300 dark:bg-green-700";
                                                 }
                                                 
                                                 // Today's date should have a special style
                                                 const isToday = new Date(date).toDateString() === new Date().toDateString();
                                                 if (isToday) {
                                                   cellClass += " ring-2 ring-blue-500";
                                                 }
                                                 
                                                 return (
                                                   <div 
                                                     key={`${rowIndex}-${colIndex}`}
                                                     className={`w-3 h-3 rounded-sm ${cellClass} hover:ring-1 hover:ring-blue-400`}
                                                     title={`${date}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                                                   />
                                                 );
                                               })
                                             )}
                                           </div>
                                         </div>
                                       </div>
                                     </div>
                                    
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                                          <span>Not completed</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
                                          <span>Completed</span>
                                        </div>
                                      </div>
                                      <span>{oneYearAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </CustomizableWidget>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Widget Button */}
      <motion.button 
        className="fixed bottom-20 right-6 btn-primary rounded-full p-4 shadow-lg"
        aria-label="Add widget"
        onClick={() => setShowWidgetModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
          <FaPlus className="w-6 h-6" />
      </motion.button>

      {/* Add Widget Modal */}
      <WidgetAddModal />

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
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
            onComplete={handleCompleteHabit}
            onUndo={handleUndoHabit}
          />
        )}
      </div>
  );
};

export default Analytics; 