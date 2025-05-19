import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import { useThemeStore } from './store/themeStore';
import useHabitStore from './store/habitStore';

// App-level initialization function
const initializeAppSettings = () => {
  console.log("Initializing app settings...");

  // Set user profile
  localStorage.setItem('userFullName', 'C. Kuldeep Reddy');
  localStorage.setItem('username', 'first_user');
  
  // Set avatar (1st column, 5th row)
  localStorage.setItem('profileImage', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix&backgroundColor=b6e3f4');
  
  // Generate mock habits data if not already generated
  const habitStore = useHabitStore.getState();
  const currentHabits = habitStore.habits;
  console.log(`Current habit count: ${currentHabits.length}`);
  
  if (currentHabits.length === 0) {
    console.log("Generating mock data...");
    habitStore.generateMockData();
    console.log(`After generation: ${habitStore.habits.length} habits`);
    return true; // Data was generated
  }
  
  return false; // No new data generated
};

function App() {
  const { initTheme } = useThemeStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize app settings after component mounts
  useEffect(() => {
    // Initialize theme
    initTheme();
    
    // Set dark theme explicitly
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    
    // Set background theme (gradient - 2nd option)
    localStorage.setItem('backgroundTheme', 'gradient');
    document.body.className = document.body.className
      .replace(/bg-theme-\w+/g, '')
      .concat(' bg-theme-gradient');
    
    // Initialize other app settings and track if anything was changed
    const dataWasGenerated = initializeAppSettings();
    
    // Mark as initialized after a short delay to ensure all changes are applied
    setTimeout(() => {
      setInitialized(true);
      console.log("App initialization complete");
      
      // If we generated data, force a refresh to show the mock data
      if (dataWasGenerated) {
        window.location.reload();
      }
    }, 500);
  }, [initTheme]);

  // If not yet initialized, show a simple loading screen
  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading HabitIT...</h1>
          <p>Initializing your personalized experience</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App; 