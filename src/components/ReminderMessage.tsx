import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes } from 'react-icons/fa';

interface ReminderMessageProps {
  message: string;
  icon?: string;
  onDismiss: () => void;
}

// Cute motivational messages for random selection
const MOTIVATIONAL_MESSAGES = [
  "You're doing great! Keep the streak going!",
  "Consistency is key! You're building excellent habits!",
  "Another day, another win! You're unstoppable!",
  "You're making progress every day!",
  "Small steps lead to big changes. You've got this!",
  "Your future self will thank you for being consistent!",
  "Habit streaks are like superpowers - they compound over time!",
  "You're showing up for yourself, and that's what matters most!",
  "Great habits lead to great results!",
  "Progress happens one day at a time. Keep going!"
];

// Cute emoji characters for random selection
const CUTE_EMOJIS = [
  "🐶", "🦊", "🐱", "🐼", "🐨", "🦁", "🐰", "🦄", "🐯", "🐻"
];

const ReminderMessage = ({ message, icon, onDismiss }: ReminderMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Get a random motivational message if none provided
  const displayMessage = message || MOTIVATIONAL_MESSAGES[
    Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  ];
  
  // Get a random emoji if none provided
  const displayIcon = icon || CUTE_EMOJIS[
    Math.floor(Math.random() * CUTE_EMOJIS.length)
  ];

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation to complete
  };
  
  // Random background color for the message
  const colors = [
    'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800',
    'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
    'bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:border-pink-800',
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`reminder-message ${randomColor} border rounded-2xl shadow-sm`}
        >
          <div className="reminder-message-icon">
            {displayIcon}
          </div>
          <div className="reminder-message-content">
            <div className="flex items-center space-x-2 mb-1">
              <FaBell className="text-sm text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-sm text-gray-500 dark:text-gray-400">
                Reminder
              </span>
            </div>
            <p className="font-medium">{displayMessage}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
          >
            <FaTimes size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReminderMessage; 