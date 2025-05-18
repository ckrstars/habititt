import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMoon, FaSun, FaPalette, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import HabitCard from '../components/HabitCard';
import useHabitStore from '../store/habitStore';
import { useThemeStore } from '../store/themeStore';
import NewHabitModal from '../components/NewHabitModal';
import ReminderMessage from '../components/ReminderMessage';
import ThemeCustomizer from '../components/ThemeCustomizer';

// Logo component with enhanced animation
const Logo = () => (
  <motion.div 
    className="flex items-center mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div 
      className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-light dark:bg-primary-dark text-white mr-4 shadow-md"
      whileHover={{ rotate: 10, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <FaCheckCircle className="w-8 h-8" />
    </motion.div>
    <div>
      <motion.h1 
        className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark bg-clip-text text-transparent"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        HABITIT
      </motion.h1>
      <motion.p 
        className="text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Your Daily Habit Tracker
      </motion.p>
    </div>
  </motion.div>
);

// Animated header for "My Habits" section
const AnimatedHeader = () => (
  <header className="flex items-center justify-between mb-8 sticky top-0 bg-surface-light dark:bg-surface-dark z-10 py-4 px-4 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark bg-clip-text text-transparent">
        My Habits
      </h2>
    </motion.div>
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Link 
        to="/analytics" 
        className="btn-secondary"
      >
        <motion.span 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Analytics
        </motion.span>
      </Link>
      <Link
        to="/settings"
        className="btn-secondary"
      >
        <motion.span 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Settings
        </motion.span>
      </Link>
      <motion.button
        whileHover={{ rotate: 15, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="btn-secondary p-2"
        aria-label="Toggle theme"
      >
        <ThemeToggleIcon />
      </motion.button>
    </motion.div>
  </header>
);

// Separate ThemeToggleIcon component with animations
const ThemeToggleIcon = () => {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <motion.div
      onClick={toggleTheme}
      whileHover={{ rotate: 15 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <FaSun className="w-5 h-5" />
          </motion.div>
        ) : theme === 'light' ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <FaMoon className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <FaPalette className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<{ id: string; message: string; icon: string }[]>([]);
  
  const { 
    habits, 
    incrementProgress, 
    decrementProgress, 
    completeHabit,
    undoCompleteHabit,
    isHabitCompletedToday
  } = useHabitStore();
  
  const { theme, toggleTheme } = useThemeStore();

  // Check for reminders on component mount and when habits change
  useEffect(() => {
    const checkReminders = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      const dueReminders = habits
        .filter(habit => habit.reminderEnabled && habit.reminderTime)
        .filter(habit => {
          if (!habit.reminderTime) return false;
          
          const [hour, minute] = habit.reminderTime.split(':').map(Number);
          // For demo purposes, we're showing reminders that would be due in the last hour
          // In a real app, you'd want to be more precise and use a background service
          return hour === currentHour && Math.abs(minute - currentMinute) < 60;
        })
        .map(habit => ({
          id: habit.id,
          message: `Time to work on "${habit.name}"!`,
          icon: habit.icon
        }));
        
      setReminders(dueReminders);
    };
    
    checkReminders();
    
    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [habits]);

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabitId(null);
  };
  
  const handleDismissReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* HABITIT logo header */}
      <Logo />

      {/* My Habits section header */}
      <AnimatedHeader />
      
      {/* Reminder messages */}
      <div className="space-y-2 mb-6">
        <AnimatePresence>
          {reminders.map(reminder => (
            <ReminderMessage
              key={reminder.id}
              message={reminder.message}
              icon={reminder.icon}
              onDismiss={() => handleDismissReminder(reminder.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Habit cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {habits.map((habit, index) => (
            <motion.div 
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <HabitCard
                habit={habit}
                onIncrement={() => incrementProgress(habit.id)}
                onDecrement={() => decrementProgress(habit.id)}
                onComplete={() => completeHabit(habit.id)}
                onUndoComplete={() => undoCompleteHabit(habit.id)}
                onEdit={() => handleEditHabit(habit.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add habit button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 btn-primary rounded-full p-4 shadow-lg"
        aria-label="Add new habit"
      >
        <FaPlus className="w-6 h-6" />
      </motion.button>
      
      {/* Theme customizer */}
      <ThemeCustomizer />

      {/* Habit modal (create or edit) */}
      {isModalOpen && (
        <NewHabitModal
          onClose={handleCloseModal}
          editHabit={editingHabitId || undefined}
        />
      )}
    </div>
  );
};

export default Dashboard; 