import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaMinus, FaPlus, FaCheck, FaBell, FaEllipsisH, FaUndo, FaFire, FaTrash } from 'react-icons/fa';
import { Habit } from '../store/habitStore';
import ConfirmationDialog from './ConfirmationDialog';
import confetti from 'canvas-confetti';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const progress = (habit.progress / habit.target) * 100;
  const isComplete = habit.progress >= habit.target;
  const streakControls = useAnimation();
  const prevStreak = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Function to trigger confetti
  const triggerConfetti = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Get the viewport width and height
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Convert to normalized coordinates (0-1)
      const normalizedX = x / viewportWidth;
      const normalizedY = y / viewportHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: normalizedX, y: normalizedY },
        colors: [habit.color, '#ffffff', '#ffeb3b'],
        zIndex: 9999,
      });
  }
  };

  // Animate streak increases
  useEffect(() => {
    if (habit.streak > prevStreak.current) {
      streakControls.start({ scale: [1, 1.2, 1] });
    }
    prevStreak.current = habit.streak;
  }, [habit.streak, streakControls]);

  // Calendar grid for last 35 days
  const gridCells = [];
  const now = new Date();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = habit.history.find(h => h.date === dateStr);
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

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle complete with confetti
  const handleComplete = () => {
    triggerConfetti();
    onComplete();
  };

  return (
    <>
    <motion.div
        ref={cardRef}
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
          <motion.button
            className="ml-2 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
              onClick={handleDeleteClick}
            aria-label="Delete habit"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
              <FaTrash size={14} />
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
            <span className="text-xl mr-1">{habit.progress}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">/ {habit.target} {habit.countUnit}</span>
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
                  onClick={handleComplete}
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
            <div className="flex items-center space-x-4">
            {isComplete ? (
              <motion.button
                onClick={onUndoComplete}
                  className="btn-primary py-2 px-3 group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: '#10b981' }}
              >
                  <span className="inline-flex items-center">
                    <FaCheck className="w-4 h-4 mr-2 group-hover:opacity-0 transition-opacity" />
                    <FaUndo className="w-4 h-4 mr-2 absolute left-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:opacity-0 transition-opacity">Done</span>
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Undo</span>
                  </span>
              </motion.button>
            ) : (
              <motion.button
                  onClick={handleComplete}
                  className="btn-primary py-2 px-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: habit.color }}
              >
                  <span className="inline-flex items-center">
                    <FaCheck className="w-4 h-4 mr-2" />
                    Mark as done
                  </span>
              </motion.button>
            )}
          </div>
        )}
          
      {/* Streak indicator */}
          <motion.div 
            className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-3 py-1 text-gray-700 dark:text-gray-200"
            animate={streakControls}
          >
            <FaFire className="w-4 h-4 mr-1 text-orange-500" />
            <span className="text-sm font-medium">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
      </motion.div>
        </div>

        {/* Last 7 days mini calendar */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400">Last 7 days</h4>
          </div>
          <div className="flex justify-between">
            {gridCells.slice(-7).map((cell, i) => (
          <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition ${
                  cell.filled 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                } ${cell.isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
              >
                {new Date(cell.date).getDate()}
              </div>
        ))}
      </div>
        </div>
    </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </>
  );
};

export default HabitCard; 