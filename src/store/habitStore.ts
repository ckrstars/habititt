import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HabitCategory = 'health' | 'productivity' | 'learning' | 'mindfulness' | 'finance' | 'social' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  target: number;
  frequency: 'daily' | 'weekly' | 'custom';
  category: HabitCategory;
  customDays?: number[];
  progress: number;
  streak: number;
  reminderTime?: string;
  reminderEnabled: boolean;
  countType: 'completion' | 'count';
  countUnit: string;
  history: {
    date: string;
    count: number;
    completed: boolean;
    timeOfCompletion?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  addHabit: (habit: Omit<Habit, 'id' | 'history' | 'createdAt' | 'updatedAt' | 'progress' | 'streak'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  incrementProgress: (id: string) => void;
  decrementProgress: (id: string) => void;
  completeHabit: (id: string) => void;
  undoCompleteHabit: (id: string) => void;
  toggleReminder: (id: string, enabled: boolean) => void;
  setReminderTime: (id: string, time: string) => void;
  getCategoryStats: () => Record<HabitCategory, number>;
  getCompletionStats: () => { completed: number; total: number };
  getLongestStreak: () => number;
  getWeeklyCompletion: () => Array<{ day: string; completed: number; total: number }>;
  getHabitCalendarData: (habitId: string) => Array<{ date: string; completed: boolean; percentage?: number }>;
  isHabitCompletedToday: (habitId: string) => boolean;
  generateMockData: () => void;
}

// Default habit colors by category
const categoryColors = {
  health: '#4ade80', // green
  productivity: '#3b82f6', // blue
  learning: '#a855f7', // purple
  mindfulness: '#ec4899', // pink
  finance: '#eab308', // yellow
  social: '#f97316', // orange
  custom: '#64748b', // slate
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      loading: false,
      error: null,

      addHabit: (habit) => {
        const now = new Date().toISOString();
        const newHabit: Habit = {
          ...habit,
          id: crypto.randomUUID(),
          progress: 0,
          streak: 0,
          color: habit.color || categoryColors[habit.category],
          countType: habit.countType || 'completion',
          countUnit: habit.countUnit || '',
          history: [],
          reminderEnabled: habit.reminderEnabled || false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      updateHabit: (id, updatedHabit) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updatedHabit, updatedAt: new Date().toISOString() } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },

      incrementProgress: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const newProgress = Math.min(habit.progress + 1, habit.target);
              // If target reached, complete the habit
              if (newProgress === habit.target) {
                const today = new Date().toISOString().split('T')[0];
                const historyEntry = {
                  date: today,
                  count: habit.target,
                  completed: true,
                  timeOfCompletion: new Date().toISOString(),
                };
                
                return {
                  ...habit,
                  progress: newProgress,
                  streak: habit.streak + 1,
                  history: [...habit.history, historyEntry],
                  updatedAt: new Date().toISOString(),
                };
              }
              
              return {
                ...habit,
                progress: newProgress,
                updatedAt: new Date().toISOString(),
              };
            }
            return habit;
          }),
        }));
      },

      decrementProgress: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const newProgress = Math.max(habit.progress - 1, 0);
              return {
                ...habit,
                progress: newProgress,
                updatedAt: new Date().toISOString(),
              };
            }
            return habit;
          }),
        }));
      },

      completeHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const today = new Date().toISOString().split('T')[0];
              const historyEntry = {
                date: today,
                count: habit.progress || habit.target,
                completed: true,
                timeOfCompletion: new Date().toISOString(),
              };
              return {
                ...habit,
                progress: habit.target,
                streak: habit.streak + 1,
                history: [...habit.history, historyEntry],
                updatedAt: new Date().toISOString(),
              };
            }
            return habit;
          }),
        }));
      },

      undoCompleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === id) {
              const today = new Date().toISOString().split('T')[0];
              // Filter out today's history entry
              const updatedHistory = habit.history.filter(entry => entry.date !== today);
              
              return {
                ...habit,
                progress: 0, // Reset progress
                streak: Math.max(0, habit.streak - 1), // Decrement streak, but not below 0
                history: updatedHistory,
                updatedAt: new Date().toISOString(),
              };
            }
            return habit;
          }),
        }));
      },

      toggleReminder: (id, enabled) => {
        set((state) => ({
          habits: state.habits.map((habit) => 
            habit.id === id ? { ...habit, reminderEnabled: enabled } : habit
          ),
        }));
      },

      setReminderTime: (id, time) => {
        set((state) => ({
          habits: state.habits.map((habit) => 
            habit.id === id ? { ...habit, reminderTime: time } : habit
          ),
        }));
      },

      getCategoryStats: () => {
        const habits = get().habits;
        return habits.reduce((acc, habit) => {
          acc[habit.category] = (acc[habit.category] || 0) + 1;
          return acc;
        }, {} as Record<HabitCategory, number>);
      },

      getCompletionStats: () => {
        const habits = get().habits;
        const today = new Date().toISOString().split('T')[0];
        
        return habits.reduce((acc, habit) => {
          const completedToday = habit.history.some(
            entry => entry.date === today && entry.completed
          );
          
          return {
            completed: acc.completed + (completedToday ? 1 : 0),
            total: acc.total + 1
          };
        }, { completed: 0, total: 0 });
      },

      getLongestStreak: () => {
        const habits = get().habits;
        return habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
      },

      getWeeklyCompletion: () => {
        const habits = get().habits;
        
        return DAYS.map((day, index) => {
          const dayData = habits.reduce(
            (acc, habit) => {
              const todayHistory = habit.history.filter((h) => {
                const date = new Date(h.date);
                return date.getDay() === index;
              });
              
              return {
                day,
                completed: acc.completed + todayHistory.filter((h) => h.completed).length,
                total: acc.total + todayHistory.length,
              };
            },
            { day, completed: 0, total: 0 }
          );
          return dayData;
        });
      },

      getHabitCalendarData: (habitId) => {
        const habits = get().habits;
        const habit = habits.find(h => h.id === habitId);
        
        if (!habit) return [];
        
        // Generate data for last 365 days
        const calendarData = [];
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const historyEntry = habit.history.find(h => h.date === dateStr);
          
          // Calculate percentage for count-based habits
          let percentage = 0;
          if (historyEntry) {
            percentage = Math.min(historyEntry.count / habit.target, 1);
          }
          
          calendarData.unshift({
            date: dateStr,
            completed: !!historyEntry?.completed,
            percentage: historyEntry ? percentage : 0
          });
        }
        
        return calendarData;
      },

      isHabitCompletedToday: (habitId) => {
        const habits = get().habits;
        const habit = habits.find(h => h.id === habitId);
        
        if (!habit) return false;
        
        const today = new Date().toISOString().split('T')[0];
        return habit.history.some(h => h.date === today && h.completed);
      },
      
      // New function to generate mock data for the last 3 months
      generateMockData: () => {
        // First, clear existing habits
        set({ habits: [] });
        
        // Define mock habits with varying categories and frequencies
        const mockHabits = [
          {
            name: "Morning Run",
            description: "Run for 30 minutes every morning to boost energy levels",
            icon: "🏃",
            color: categoryColors.health,
            target: 1,
            frequency: "daily",
            category: "health",
            reminderTime: "07:00",
            reminderEnabled: true,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Drink Water",
            description: "Drink 8 glasses of water daily for better hydration",
            icon: "💧",
            color: categoryColors.health,
            target: 8,
            frequency: "daily",
            category: "health",
            reminderTime: "10:00",
            reminderEnabled: false,
            countType: "count",
            countUnit: "glasses",
          },
          {
            name: "Read Books",
            description: "Read for at least 30 minutes daily to expand knowledge",
            icon: "📚",
            color: categoryColors.learning,
            target: 1,
            frequency: "daily",
            category: "learning",
            reminderTime: "21:00",
            reminderEnabled: true,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Meditate",
            description: "Practice mindfulness for 10 minutes each day",
            icon: "🧘",
            color: categoryColors.mindfulness,
            target: 1,
            frequency: "daily",
            category: "mindfulness",
            reminderTime: "07:30",
            reminderEnabled: false,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Code Project",
            description: "Work on personal coding projects to improve skills",
            icon: "💻",
            color: categoryColors.productivity,
            target: 2,
            frequency: "weekly",
            category: "productivity",
            reminderTime: "18:00",
            reminderEnabled: true,
            countType: "count",
            countUnit: "hours",
          },
          {
            name: "Budget Review",
            description: "Review personal finances weekly",
            icon: "💰",
            color: categoryColors.finance,
            target: 1,
            frequency: "weekly",
            category: "finance",
            reminderTime: "20:00",
            reminderEnabled: true,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Call Family",
            description: "Call parents or siblings weekly to stay connected",
            icon: "👥",
            color: categoryColors.social,
            target: 1,
            frequency: "weekly",
            category: "social",
            reminderTime: "19:00",
            reminderEnabled: true,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Guitar Practice",
            description: "Practice guitar to improve musical skills",
            icon: "🎸",
            color: categoryColors.custom,
            target: 3,
            frequency: "weekly",
            category: "custom",
            reminderTime: "17:00",
            reminderEnabled: false,
            countType: "count",
            countUnit: "sessions",
          },
          {
            name: "Journaling",
            description: "Write in journal to reflect on thoughts and experiences",
            icon: "📝",
            color: categoryColors.mindfulness,
            target: 1,
            frequency: "daily",
            category: "mindfulness",
            reminderTime: "22:00",
            reminderEnabled: true,
            countType: "completion",
            countUnit: "",
          },
          {
            name: "Learn Language",
            description: "Practice new language skills with daily exercises",
            icon: "🗣️",
            color: categoryColors.learning,
            target: 1,
            frequency: "daily",
            category: "learning",
            reminderTime: "18:30",
            reminderEnabled: false,
            countType: "completion",
            countUnit: "",
          },
        ] as Omit<Habit, 'id' | 'history' | 'createdAt' | 'updatedAt' | 'progress' | 'streak'>[];
        
        const { addHabit, updateHabit } = get();
        
        // Add each habit and then generate history
        mockHabits.forEach(habit => {
          // Add the habit first
          addHabit(habit);
        });
        
        // Now get all habits and add history
        const habits = get().habits;
        
        // Generate history for the last 3 months
        habits.forEach(habit => {
          const today = new Date();
          const history = [];
          let streak = 0;
          
          // Generate consistency percentages based on habit
          // Higher number means more consistent
          const consistency = {
            "Morning Run": 0.7,
            "Drink Water": 0.85,
            "Read Books": 0.65,
            "Meditate": 0.5,
            "Code Project": 0.8,
            "Budget Review": 0.9,
            "Call Family": 0.95,
            "Guitar Practice": 0.6,
            "Journaling": 0.75,
            "Learn Language": 0.55,
          };
          
          // Generate realistic streaks
          const maxStreak = {
            "Morning Run": 12,
            "Drink Water": 30,
            "Read Books": 8,
            "Meditate": 5,
            "Code Project": 6,
            "Budget Review": 10,
            "Call Family": 12,
            "Guitar Practice": 4,
            "Journaling": 15,
            "Learn Language": 7,
          };
          
          // Start 90 days ago
          for (let i = 90; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Determine if the habit should be completed on this date based on frequency
            let shouldComplete = false;
            
            if (habit.frequency === "daily") {
              // For daily habits, use consistency factor
              shouldComplete = Math.random() < (consistency[habit.name as keyof typeof consistency] || 0.7);
            } else if (habit.frequency === "weekly") {
              // For weekly habits, complete on specific days (e.g., weekends for some, weekdays for others)
              const day = date.getDay(); // 0 = Sunday, 6 = Saturday
              
              if (habit.name === "Code Project") {
                // More likely to code on weekends
                shouldComplete = (day === 0 || day === 6) && Math.random() < 0.8;
              } else if (habit.name === "Budget Review") {
                // Budget review on Sundays
                shouldComplete = day === 0 && Math.random() < 0.9;
              } else if (habit.name === "Call Family") {
                // Call family on weekends
                shouldComplete = (day === 0 || day === 6) && Math.random() < 0.95;
              } else if (habit.name === "Guitar Practice") {
                // Guitar practice few times a week
                shouldComplete = Math.random() < 0.4;
              }
            }
            
            // For the count-based habits, generate realistic counts
            let count = 0;
            if (shouldComplete) {
              if (habit.countType === "count") {
                // Generate a random count that makes sense
                if (habit.name === "Drink Water") {
                  count = Math.floor(Math.random() * 3) + 6; // 6-8 glasses
                } else if (habit.name === "Code Project") {
                  count = Math.floor(Math.random() * 3) + 1; // 1-3 hours
                } else if (habit.name === "Guitar Practice") {
                  count = Math.floor(Math.random() * 2) + 1; // 1-2 sessions
                } else {
                  count = habit.target;
                }
              } else {
                count = 1;
              }
              
              // Add to streak counter for consecutive days
              streak++;
            } else {
              // Reset streak on missed days
              streak = 0;
            }
            
            if (shouldComplete) {
              // Create a history entry for completed days
              const timeOfCompletion = new Date(date);
              // Set a random time during the day
              timeOfCompletion.setHours(Math.floor(Math.random() * 12) + 8); // Between 8 AM and 8 PM
              timeOfCompletion.setMinutes(Math.floor(Math.random() * 60));
              
              history.push({
                date: dateStr,
                count: count,
                completed: true,
                timeOfCompletion: timeOfCompletion.toISOString()
              });
            }
          }
          
          // Set a realistic streak value based on recent history
          // Use the last streak value calculated, or a predefined max value
          const calculatedStreak = Math.min(streak, maxStreak[habit.name as keyof typeof maxStreak] || 10);
          
          // Update the habit with history and streak
          updateHabit(habit.id, {
            history: history,
            streak: calculatedStreak
          });
        });
      }
    }),
    {
      name: 'habit-storage',
    }
  )
);

export default useHabitStore; 