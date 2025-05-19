import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMoon, FaSun, FaPalette, FaCheckCircle, FaList, FaThLarge, FaCalendarAlt, FaSort, FaGripVertical, FaFire, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import HabitCard from '../components/HabitCard';
import useHabitStore, { Habit } from '../store/habitStore';
import { useThemeStore } from '../store/themeStore';
import NewHabitModal from '../components/NewHabitModal';
import ReminderMessage from '../components/ReminderMessage';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

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

// Animated header for "My Habits" section
const AnimatedHeader = () => {
  const currentHour = new Date().getHours();
  let greeting = 'Hello';
  
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  // Get full name from localStorage
  const fullName = localStorage.getItem('userFullName');
  const displayName = fullName && fullName.trim() !== '' ? fullName : 'friend';

  return (
  <header className="flex items-center justify-between mb-8 sticky top-0 bg-surface-light dark:bg-surface-dark z-10 py-4 px-4 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark bg-clip-text text-transparent">
          {greeting}, {displayName}!
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
        to="/profile"
        className="btn-secondary"
      >
        <motion.span 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Profile
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
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<{ id: string; message: string; icon: string }[]>([]);
  const [viewMode, setViewMode] = useState<'default' | 'category' | 'iconGrid'>(() => 
    localStorage.getItem('dashboardViewMode') as 'default' | 'category' | 'iconGrid' || 'default'
  );
  
  // Use stores
  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    incrementProgress,
    decrementProgress,
    completeHabit,
    undoCompleteHabit,
    habits: storeHabits // Add this to get real-time streak values
  } = useHabitStore();
  
  const { theme, toggleTheme } = useThemeStore();

  // Store ordered habits
  const [orderedHabits, setOrderedHabits] = useState<Habit[]>(() => {
    const savedOrder = localStorage.getItem('habitOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as string[];
        // Construct ordered habits array
        const ordered = [...habits]; // Clone the habits array
        ordered.sort((a, b) => {
          const indexA = orderIds.indexOf(a.id);
          const indexB = orderIds.indexOf(b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        return ordered;
      } catch (e) {
        console.error("Error parsing habit order:", e);
        return habits;
      }
    }
    return habits;
  });

  // Update orderedHabits when habits change
  useEffect(() => {
    // Always update orderedHabits when habits change to ensure UI reflects latest state
    const savedOrder = localStorage.getItem('habitOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder) as string[];
        const newOrderedHabits = [...habits];
        newOrderedHabits.sort((a, b) => {
          const indexA = orderIds.indexOf(a.id);
          const indexB = orderIds.indexOf(b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setOrderedHabits(newOrderedHabits);
      } catch (e) {
        setOrderedHabits(habits);
      }
    } else {
      setOrderedHabits(habits);
    }
  }, [habits]);
  
  // Function to reset streak values for specific habits (for development/testing)
  const resetStreaks = () => {
    // Find habits by name (assuming they're named "Jogging" and "Reading")
    const joggingHabit = habits.find(h => 
      h.name.toLowerCase().includes('jogging') || 
      h.name.toLowerCase().includes('run') || 
      h.name.toLowerCase().includes('morning run'));
    
    const readingHabit = habits.find(h => 
      h.name.toLowerCase().includes('reading') || 
      h.name.toLowerCase().includes('read') ||
      h.name.toLowerCase().includes('read books'));
    
    if (joggingHabit) {
      updateHabit(joggingHabit.id, { streak: 1 });
    }
    
    if (readingHabit) {
      updateHabit(readingHabit.id, { streak: 1 });
    }
  };

  // Reset streaks on component mount
  useEffect(() => {
    resetStreaks();
  }, []);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('dashboardViewMode', viewMode);
  }, [viewMode]);

  // Handle drag end for habit reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedHabits);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedHabits(items);
    
    // Save the new order to localStorage
    const orderIds = items.map(habit => habit.id);
    localStorage.setItem('habitOrder', JSON.stringify(orderIds));
  };

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

  const hasHabits = habits.length > 0;

  // Replace YearGridView with IconGridView
  const IconGridView = ({ habits }: { habits: Habit[] }) => {
    // Make sure to use the functions from the outer scope
    const {
      incrementProgress,
      decrementProgress,
      completeHabit,
      undoCompleteHabit,
      habits: storeHabits // Add this to get real-time streak values
    } = useHabitStore();

    // Force re-render when actions are performed
    const [forceUpdate, setForceUpdate] = useState(0);
    
    // Create local state copy of habits to show immediate updates
    const [localHabits, setLocalHabits] = useState(habits);
    
    // Update local habits when props change or when store data changes
    useEffect(() => {
      // For updates from props
      setLocalHabits(habits.map(habit => {
        // Try to get latest streak data from store
        const storeHabit = storeHabits.find(h => h.id === habit.id);
        if (storeHabit) {
          return {
            ...habit,
            streak: storeHabit.streak
          };
        }
        return habit;
      }));
    }, [habits, storeHabits]);
    
    // Wrapper functions that update both store and local state
    const handleIncrement = (id: string) => {
      incrementProgress(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            const newProgress = Math.min(habit.progress + 1, habit.target);
            return {
              ...habit, 
              progress: newProgress,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleDecrement = (id: string) => {
      decrementProgress(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            const newProgress = Math.max(habit.progress - 1, 0);
            return {
              ...habit, 
              progress: newProgress,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleComplete = (id: string) => {
      // Get the current streak value
      const habit = localHabits.find(h => h.id === id);
      if (habit) {
        // Manually set the streak to 1 and then call complete
        // This ensures the streak will be exactly 1 when first completed
        if (habit.streak === 0) {
          updateHabit(id, { streak: 1 });
          completeHabit(id);
        } else {
          completeHabit(id);
        }
      } else {
        completeHabit(id);
      }
      
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            return {
              ...habit, 
              progress: habit.target,
              streak: storeHabit ? storeHabit.streak : habit.streak + 1
            }; 
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleUndoComplete = (id: string) => {
      undoCompleteHabit(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            return {
              ...habit, 
              progress: 0,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {localHabits.map((habit, index) => {
          const isCompleted = habit.progress >= habit.target;
          const progress = habit.countType === 'count' ? `${habit.progress}/${habit.target}` : '';
          
          return (
            <Draggable key={habit.id} draggableId={habit.id} index={index}>
              {(provided: DraggableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="relative"
                >
                  {/* Drag handle */}
                  <div 
                    {...provided.dragHandleProps}
                    className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-move opacity-20 hover:opacity-100"
                    title="Drag to reorder"
                  >
                    <FaGripVertical className="w-4 h-4" />
                  </div>
                  <motion.div 
                    key={`${habit.id}-${forceUpdate}`}
                    className="flex flex-col items-center justify-center p-4 pt-10 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative mb-3">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                      >
                        {habit.icon}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700">
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        ) : habit.countType === 'count' && habit.progress > 0 ? (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: habit.color, color: 'white' }}
                          >
                            {Math.round((habit.progress / habit.target) * 100)}%
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FaTimes className="text-gray-500 dark:text-gray-400 text-xs" />
                          </div>
                        )}
          </div>
        </div>
                    <h3 className="text-sm font-medium text-center">{habit.name}</h3>
                    {progress && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}</span>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <FaFire className="text-orange-500 mr-1" />
                      <span>{habit.streak} days</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {habit.countType === 'count' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecrement(habit.id);
                            }}
                            disabled={habit.progress === 0}
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncrement(habit.id);
                            }}
                            disabled={isCompleted}
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          isCompleted ? handleUndoComplete(habit.id) : handleComplete(habit.id);
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {isCompleted ? 'Done' : 'Complete'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditHabit(habit.id);
                        }}
                        className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <FaPalette className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                      </button>
        </div>
                  </motion.div>
        </div>
              )}
            </Draggable>
          );
        })}
      </div>
    );
  };
  
  // Category Icon View Component
  const CategoryIconView = ({ habits, onEdit }: { habits: Habit[]; onEdit: (habitId: string) => void }) => {
    // Get functions from the store
    const {
      incrementProgress,
      decrementProgress,
      completeHabit,
      undoCompleteHabit,
      habits: storeHabits // Add this to get real-time streak values
    } = useHabitStore();
    
    // Force re-render when actions are performed
    const [forceUpdate, setForceUpdate] = useState(0);
    
    // Create local state copy of habits to show immediate updates
    const [localHabits, setLocalHabits] = useState(habits);
    
    // Update local habits when props change or when store data changes
    useEffect(() => {
      // For updates from props
      setLocalHabits(habits.map(habit => {
        // Try to get latest streak data from store
        const storeHabit = storeHabits.find(h => h.id === habit.id);
        if (storeHabit) {
          return {
            ...habit,
            streak: storeHabit.streak
          };
        }
        return habit;
      }));
    }, [habits, storeHabits]);
    
    // Wrapper functions that update both store and local state
    const handleIncrement = (id: string) => {
      incrementProgress(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            const newProgress = Math.min(habit.progress + 1, habit.target);
            return {
              ...habit, 
              progress: newProgress,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleDecrement = (id: string) => {
      decrementProgress(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            const newProgress = Math.max(habit.progress - 1, 0);
            return {
              ...habit, 
              progress: newProgress,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleComplete = (id: string) => {
      // Get the current streak value
      const habit = localHabits.find(h => h.id === id);
      if (habit) {
        // Manually set the streak to 1 and then call complete
        // This ensures the streak will be exactly 1 when first completed
        if (habit.streak === 0) {
          updateHabit(id, { streak: 1 });
          completeHabit(id);
        } else {
          completeHabit(id);
        }
      } else {
        completeHabit(id);
      }
      
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            return {
              ...habit, 
              progress: habit.target,
              streak: storeHabit ? storeHabit.streak : habit.streak + 1
            }; 
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    const handleUndoComplete = (id: string) => {
      undoCompleteHabit(id);
      // Also update local state for immediate UI feedback
      setLocalHabits(prev => 
        prev.map(habit => {
          if (habit.id === id) {
            // Get latest state from store after update
            const storeHabit = storeHabits.find(h => h.id === id);
            return {
              ...habit, 
              progress: 0,
              streak: storeHabit ? storeHabit.streak : habit.streak
            };
          }
          return habit;
        })
      );
      setForceUpdate(prev => prev + 1);
    };
    
    // Group habits by category
    const habitsByCategory: Record<string, Habit[]> = {};
    localHabits.forEach(habit => {
      if (!habitsByCategory[habit.category]) {
        habitsByCategory[habit.category] = [];
      }
      habitsByCategory[habit.category].push(habit);
    });

    return (
      <div className="space-y-8">
        {Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
          <div key={`${category}-${forceUpdate}`} className="card">
            <h3 className="text-lg font-medium capitalize mb-4">{category}</h3>
            <div className="space-y-3">
              {categoryHabits.map((habit, index) => {
                const isCompleted = habit.progress >= habit.target;
                return (
                  <Draggable key={habit.id} draggableId={habit.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative"
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-move opacity-20 hover:opacity-100"
                          title="Drag to reorder"
                        >
                          <FaGripVertical className="w-4 h-4" />
                        </div>
                        <div key={`${habit.id}-${forceUpdate}`} className="flex items-center justify-between p-3 pl-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                            >
                              {habit.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{habit.name}</h4>
                              {habit.countType === 'count' && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {habit.progress} / {habit.target} {habit.countUnit}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {habit.countType === 'count' && (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDecrement(habit.id);
                                  }}
                                  disabled={habit.progress === 0}
                                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIncrement(habit.id);
                                  }}
                                  disabled={isCompleted}
                                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                isCompleted ? handleUndoComplete(habit.id) : handleComplete(habit.id);
                              }}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {isCompleted ? 'Done' : 'Complete'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(habit.id);
                              }}
                              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <FaEdit className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Empty state or Habit cards
  const renderHabits = () => {
    if (!hasHabits) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
          <FaCheckCircle className="text-6xl mb-4 opacity-30" />
          <h3 className="text-2xl font-semibold mb-2">No habits yet</h3>
          <p className="mb-4">Start by adding your first habit to begin your journey!</p>
          <button
            className="btn-primary flex items-center gap-2 mx-auto"
            onClick={() => { setIsModalOpen(true); setEditingHabitId(null); }}
          >
            <FaPlus /> Add Habit
          </button>
        </div>
      );
    }

    // Always use drag-and-drop instead of conditional reorder mode
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="habits">
          {(provided: DroppableProvided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {orderedHabits.map((habit, index) => (
                  <Draggable key={habit.id} draggableId={habit.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative"
                      >
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          className="relative"
                        >
                          {/* Subtle drag handle */}
                          <div 
                            {...provided.dragHandleProps}
                            className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-move opacity-20 hover:opacity-100"
                            title="Drag to reorder"
                          >
                            <FaGripVertical className="w-4 h-4" />
                          </div>
                          
                          <HabitCard
                            habit={habit}
                            onEdit={() => handleEditHabit(habit.id)}
                            onDelete={() => deleteHabit(habit.id)}
                            onIncrement={() => incrementProgress(habit.id)}
                            onDecrement={() => decrementProgress(habit.id)}
                            onComplete={() => completeHabit(habit.id)}
                            onUndoComplete={() => undoCompleteHabit(habit.id)}
                          />
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* HABITIT logo header */}
      <Logo />

      {/* My Habits section header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">My Habits</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {hasHabits && (
            <>
              {/* Remove reorder toggle button - drag and drop is always available */}
              
              {/* View mode buttons */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                <button
                  className={`p-2 rounded ${viewMode === 'default' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  onClick={() => setViewMode('default')}
                  title="Card View"
                >
                  <FaThLarge className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded ${viewMode === 'category' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  onClick={() => setViewMode('category')}
                  title="Category View"
                >
                  <FaList className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded ${viewMode === 'iconGrid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                  onClick={() => setViewMode('iconGrid')}
                  title="Icon Grid View"
                >
                  <FaCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
          
          <Link 
            to="/analytics" 
            className="btn-secondary"
          >
            Analytics
          </Link>
          <Link
            to="/profile"
            className="btn-secondary"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className="btn-secondary"
          >
            Settings
          </Link>
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
        </div>
      </header>
      
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

      {/* Render habits based on view mode */}
      {viewMode === 'iconGrid' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="habits-icon-grid">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <IconGridView habits={orderedHabits} />
                {provided.placeholder}
        </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : viewMode === 'category' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="habits-category">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <CategoryIconView habits={orderedHabits} onEdit={handleEditHabit} />
                {provided.placeholder}
        </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        renderHabits()
      )}

      {/* Add habit button (floating) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsModalOpen(true); setEditingHabitId(null); }}
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
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          habitId={editingHabitId}
          onAdd={addHabit}
          onUpdate={updateHabit}
          habits={habits}
        />
      )}
    </div>
  );
};

export default Dashboard; 