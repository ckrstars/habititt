import { motion } from 'framer-motion';
import { FaMinus, FaPlus, FaCheck, FaBell, FaEllipsisH, FaUndo } from 'react-icons/fa';
import { Habit } from '../store/habitStore';

interface HabitCardProps {
  habit: Habit;
  onIncrement: () => void;
  onDecrement: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onUndoComplete?: () => void;
}

// Function to calculate gradient color based on percentage
const getGradientColor = (baseColor: string, percentage: number): string => {
  if (percentage <= 0) return '';
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  const rgb = hexToRgb(baseColor);
  
  // Create a gradient effect
  const intensity = Math.max(0.2, percentage);
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
};

const HabitCard = ({ habit, onIncrement, onDecrement, onComplete, onEdit, onUndoComplete }: HabitCardProps) => {
  const progress = (habit.progress / habit.target) * 100;
  const isComplete = habit.progress >= habit.target;
  
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

  // Get recent habit history for the grid visualization
  const getRecentHistoryGrid = () => {
    // Get last 35 days (5 weeks * 7 days) for the grid
    const cells = [];
    const today = new Date();
    
    for (let i = 34; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if we have history for this date
      const historyEntry = habit.history.find(h => h.date === dateStr);
      const percentage = historyEntry ? Math.min(historyEntry.count / habit.target, 1) : 0;
      const hasActivity = percentage > 0;
      
      cells.push({
        date: dateStr,
        hasActivity,
        percentage
      });
    }
    
    return cells;
  };

  // Get compact grid visualization data
  const gridData = getRecentHistoryGrid();

  // Check if completed today
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habit.history.some(entry => 
    entry.date === today && entry.completed
  );

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
          {habit.reminderEnabled && (
            <motion.span 
              className="mr-2 text-gray-500 dark:text-gray-400"
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ duration: 0.2 }}
              title={`Reminder: ${habit.reminderTime || 'enabled'}`}
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
        {habit.countType === 'count' ? (
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
            
            <motion.div 
              className="flex items-center font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, type: 'spring' }}
            >
              <span className="text-xl mr-1">{habit.progress}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">/ {habit.target} {habit.countUnit}</span>
            </motion.div>
            
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
          </div>
        ) : (
          <div className="flex items-center">
            <span className="font-medium">
              Complete Today
            </span>
          </div>
        )}

        {completedToday && onUndoComplete ? (
          <motion.button
            onClick={onUndoComplete}
            className="btn-primary p-2.5 group relative rounded-full"
            title="Undo completion"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ 
              backgroundColor: '#10b981',
            }}
          >
            <FaCheck className="w-4 h-4 group-hover:opacity-0 transition-opacity" />
            <FaUndo className="w-4 h-4 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ) : (
          <motion.button
            onClick={onComplete}
            disabled={isComplete && !onUndoComplete}
            className="btn-primary p-2.5 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ 
              backgroundColor: isComplete ? '#10b981' : habit.color,
              opacity: isComplete ? 0.8 : 1
            }}
          >
            <FaCheck className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Streak indicator */}
      {habit.streak > 0 && (
        <motion.div 
          className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <span className="mr-1">🔥</span>
          <span>{habit.streak} day streak!</span>
        </motion.div>
      )}
      
      {/* HabitKit-style grid preview */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="habit-grid">
          {gridData.map((cell, i) => (
            <div 
              key={i}
              className={`calendar-grid-cell ${cell.hasActivity ? 'filled' : 'empty'}`}
              style={cell.hasActivity ? { 
                backgroundColor: getGradientColor(habit.color, cell.percentage),
                transform: cell.percentage >= 0.9 ? 'scale(1.1)' : 'scale(1)'
              } : {}}
              title={`${cell.date}: ${
                habit.history.find(h => h.date === cell.date)?.count || 0
              }/${habit.target} ${habit.countUnit || ''}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard; 