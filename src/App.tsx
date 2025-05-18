import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useThemeStore } from './store/themeStore';

function App() {
  const { theme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 