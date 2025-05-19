import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { useThemeStore } from './store/themeStore';
import useHabitStore from './store/habitStore';

// Initialize app with specific settings
const initializeAppSettings = () => {
  // Set user profile
  localStorage.setItem('userFullName', 'C. Kuldeep Reddy');
  localStorage.setItem('username', 'first_user');
  
  // Set avatar (1st column, 5th row)
  localStorage.setItem('profileImage', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix&backgroundColor=b6e3f4');
  
  // Set dark theme
  localStorage.setItem('theme', 'dark');
  
  // Set background theme (2nd one - gradient)
  localStorage.setItem('backgroundTheme', 'gradient');
  
  // Generate mock habits data if not already generated
  const habitStore = useHabitStore.getState();
  if (habitStore.habits.length === 0) {
    habitStore.generateMockData();
  }
};

// Run initialization
initializeAppSettings();

// Apply background theme to body
document.body.className = document.body.className
  .replace(/bg-theme-\w+/g, '')
  .concat(` bg-theme-gradient`);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize theme immediately (don't wait for components to mount)
useThemeStore.getState().initTheme(); 