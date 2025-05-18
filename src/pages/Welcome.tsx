import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';

export default function Welcome() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome to HABITIT
          </h1>
          <p className="text-xl text-white/80">
            Track your habits, achieve your goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white"
          >
            <h2 className="text-2xl font-semibold mb-4">Why HABITIT?</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="mr-2">✨</span>
                Track multiple habits with ease
              </li>
              <li className="flex items-center">
                <span className="mr-2">📊</span>
                Visualize your progress
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎯</span>
                Set custom goals and reminders
              </li>
              <li className="flex items-center">
                <span className="mr-2">📱</span>
                Access anywhere, anytime
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AuthForm mode={authMode} />
            <div className="mt-4 text-center text-white">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm hover:underline"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 