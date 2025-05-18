import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="flex flex-col items-center"
      >
        <FaCheckCircle className="text-8xl text-primary-light dark:text-primary-dark mb-6" />
        <h1 className="text-4xl font-bold mb-2 text-center">
          Daily Habit Checklist
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center">
          Track your habits, achieve your goals
        </p>
      </motion.div>

      <motion.button
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/dashboard')}
        className="btn-primary text-lg px-8 py-3"
      >
        Get Started
      </motion.button>
    </div>
  );
};

export default Welcome; 