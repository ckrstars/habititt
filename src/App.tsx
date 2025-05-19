import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  
  useEffect(() => {
    initTheme();
    
    // Apply background theme from localStorage
    const backgroundTheme = localStorage.getItem('backgroundTheme') || 'default';
    document.body.className = document.body.className
      .replace(/bg-theme-\w+/g, '')
      .concat(` bg-theme-${backgroundTheme}`);
  }, [initTheme]);
  
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App; 