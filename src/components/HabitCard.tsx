import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaMinus, FaPlus, FaCheck, FaBell, FaEllipsisH, FaUndo, FaFire, FaTrophy } from 'react-icons/fa';
import { Habit, HabitHistory } from '../lib/supabase';
import useSupabaseStore from '../store/supabaseStore';

interface HabitCardProps {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onComplete: () => void;
  onUndoComplete: () => void;
}

const HabitCard = ({ habit, onEdit, onDelete, onIncrement, onDecrement, onComplete, onUndoComplete }: HabitCardProps) => {
  const progress = (habit.progress / habit.target) * 100;
  const isComplete = habit.progress >= habit.target;
  const [history, setHistory] = useState<HabitHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const getHabitHistory = useSupabaseStore(s => s.getHabitHistory);
  const streakControls = useAnimation();
  const prevStreak = useRef(0);

  useEffect(() => {
    let mounted = true;
    setLoadingHistory(true);
    getHabitHistory(habit.id).then(data => {
      if (mounted) setHistory(data);
      setLoadingHistory(false);
    });
    return () => { mounted = false; };
  }, [habit.id, getHabitHistory]);

  // Streak calculation (consecutive days with completed=true)
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let date = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = date.toISOString().split('T')[0];
    const entry = history.find(h => h.date === dateStr && h.completed);
    if (entry) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak calculation
  let longestStreak = 0;
  let currentStreak = 0;
  let streakDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = streakDate.toISOString().split('T')[0];
    const entry = history.find(h => h.date === dateStr && h.completed);
    if (entry) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
    streakDate.setDate(streakDate.getDate() - 1);
  }

  // Animate streak increases
  useEffect(() => {
    if (streak > prevStreak.current) {
      streakControls.start({ scale: [1, 1.2, 1] });
    }
    prevStreak.current = streak;
  }, [streak, streakControls]);

  // Calendar grid for last 35 days
  const gridCells = [];
  const now = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = history.find(h => h.date === dateStr);
    const filled = entry && entry.completed;
    const isToday = dateStr === today;
    gridCells.push({ date: dateStr, filled, isToday, count: entry?.count });
  }

  // Get category badge style based on category
  const getCategoryBadgeClass = () => {
    switch (habit.category) {
      case 'health':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'productivity':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'learning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'mindfulness':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'finance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'social':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="card relative border border-gray-100 dark:border-gray-800"
      style={habit.color ? { borderLeft: `4px solid ${habit.color}` } : {}}
    >
      {/* Top section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <motion.div 
            className="text-2xl mr-3"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {habit.icon}
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold">{habit.name}</h3>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass()}`}>
                {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
              </span>
              <span className="mx-1.5 text-gray-300 dark:text-gray-700">•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass()}`}>
                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {habit.reminder_enabled && (
            <motion.span 
              className="mr-2 text-gray-500 dark:text-gray-400"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ duration: 0.2 }}
              title={`Reminder: ${habit.reminder_time || 'enabled'}`}
            >
              <FaBell size={14} />
            </motion.span>
          )}
          
          <motion.button 
            className="ml-2 p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" 
            onClick={onEdit}
            aria-label="Edit habit"
            whileHover={{ rotate: 90, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <FaEllipsisH size={14} />
          </motion.button>
          <motion.button
            className="ml-2 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
            onClick={onDelete}
            aria-label="Delete habit"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <FaUndo size={14} />
          </motion.button>
        </div>
      </div>

      {/* Description if available */}
      {habit.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {habit.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="progress-bar-container mb-4 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="h-full"
          style={{ 
            background: isComplete 
              ? 'linear-gradient(to right, #10b981, #059669)' 
              : `linear-gradient(to right, ${habit.color}, ${habit.color}dd)`
          }}
        />
      </div>

      {/* Count-based or completion-based controls */}
      <div className="flex items-center justify-between">
        {habit.count_type === 'count' ? (
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={onDecrement}
              disabled={habit.progress === 0}
              className="btn-secondary p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ 
                borderColor: habit.color, 
                color: habit.color, 
                opacity: habit.progress === 0 ? 0.5 : 1
              }}
            >
              <FaMinus className="w-4 h-4" />
            </motion.button>
            <span className="text-xl mr-1">{habit.progress}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">/ {habit.target} {habit.count_unit}</span>
            <motion.button
              onClick={onIncrement}
              disabled={isComplete}
              className="btn-secondary p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ 
                borderColor: habit.color, 
                color: habit.color, 
                opacity: isComplete ? 0.5 : 1
              }}
            >
              <FaPlus className="w-4 h-4" />
            </motion.button>
            {isComplete ? (
              <motion.button
                onClick={onUndoComplete}
                className="btn-primary p-2.5 group relative rounded-full"
                title="Undo completion"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ backgroundColor: '#10b981' }}
              >
                <FaCheck className="w-4 h-4 group-hover:opacity-0 transition-opacity" />
                <FaUndo className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ) : (
              <motion.button
                onClick={onComplete}
                className="btn-primary p-2.5 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ backgroundColor: habit.color }}
              >
                <FaCheck className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-xl mr-1">{habit.progress}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">/ {habit.target}</span>
            {isComplete ? (
              <motion.button
                onClick={onUndoComplete}
                className="btn-primary p-2.5 group relative rounded-full"
                title="Undo completion"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ backgroundColor: '#10b981' }}
              >
                <FaCheck className="w-4 h-4 group-hover:opacity-0 transition-opacity" />
                <FaUndo className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ) : (
              <motion.button
                onClick={onComplete}
                className="btn-primary p-2.5 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ backgroundColor: habit.color }}
              >
                <FaCheck className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
      {/* Streak indicator */}
      <motion.div animate={streakControls} className="mt-3 flex items-center gap-2 text-sm text-orange-500 dark:text-orange-300">
        <FaFire className="inline-block" />
        <span>{streak} day streak</span>
        {longestStreak > 0 && (
          <span className="ml-2 flex items-center gap-1 text-yellow-500 dark:text-yellow-300"><FaTrophy /> {longestStreak} best</span>
        )}
      </motion.div>
      {/* Calendar grid visualization */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {gridCells.map((cell) => (
          <div
            key={cell.date}
            title={`${cell.date}${cell.filled ? ' ✔' : ''}${habit.count_type === 'count' && cell.count ? ` (${cell.count})` : ''}${cell.isToday ? ' (Today)' : ''}`}
            className={`w-4 h-4 rounded ${cell.filled ? 'bg-primary-light dark:bg-primary-dark' : 'bg-gray-200 dark:bg-gray-700'} ${cell.isToday ? 'ring-2 ring-accent-light dark:ring-accent-dark' : ''}`}
            style={cell.filled ? { backgroundColor: habit.color } : {}}
          />
        ))}
      </div>
      {loadingHistory && <div className="text-xs text-gray-400 mt-2">Loading history...</div>}
    </motion.div>
  );
};

export default HabitCard; 