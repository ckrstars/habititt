import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPalette, FaTimes, FaCheck, FaSun, FaMoon, FaPaintBrush } from 'react-icons/fa';
import { useThemeStore, CustomTheme, Theme } from '../store/themeStore';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker = ({ color, onChange, label }: ColorPickerProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border-0 p-0 rounded-md cursor-pointer"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="input flex-1"
        />
      </div>
    </div>
  );
};

interface ThemePresetProps {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  onClick: () => void;
  isSelected?: boolean;
  targetMode: Theme;
}

const ThemePreset = ({ 
  name, 
  primaryColor, 
  backgroundColor, 
  accentColor, 
  onClick,
  isSelected = false,
  targetMode
}: ThemePresetProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'ring-2 ring-primary-light dark:ring-primary-dark' : ''
      }`}
    >
      <div className="w-full h-20 rounded-md mb-2 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-1/2" style={{ backgroundColor }}>
          <div className="w-1/3 h-full" style={{ backgroundColor: primaryColor }} />
        </div>
        <div className="h-1/2 bg-white dark:bg-gray-800">
          <div className="w-1/3 h-full" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-sm mr-1">{name}</span>
        <small className="text-xs text-gray-500">({targetMode})</small>
        {isSelected && <FaCheck className="ml-1 text-xs text-green-500" />}
      </div>
    </button>
  );
};

// Light theme presets
const LIGHT_THEME_PRESETS = [
  {
    name: 'Ocean',
    theme: {
      primaryColor: '#0ea5e9',
      backgroundColor: '#f0f9ff',
      textColor: '#0f172a',
      cardColor: '#ffffff',
      accentColor: '#6366f1'
    },
    mode: 'light' as Theme
  },
  {
    name: 'Forest',
    theme: {
      primaryColor: '#16a34a',
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      cardColor: '#ffffff',
      accentColor: '#84cc16'
    },
    mode: 'light' as Theme
  },
  {
    name: 'Sunset',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#fff7ed',
      textColor: '#7c2d12',
      cardColor: '#ffffff',
      accentColor: '#f43f5e'
    },
    mode: 'light' as Theme
  },
  {
    name: 'Cosmic',
    theme: {
      primaryColor: '#8b5cf6',
      backgroundColor: '#faf5ff',
      textColor: '#581c87',
      cardColor: '#ffffff',
      accentColor: '#d946ef'
    },
    mode: 'light' as Theme
  }
];

// Dark theme presets
const DARK_THEME_PRESETS = [
  {
    name: 'Midnight',
    theme: {
      primaryColor: '#14B8A6',
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
      cardColor: '#1e293b',
      accentColor: '#3b82f6'
    },
    mode: 'dark' as Theme
  },
  {
    name: 'Charcoal',
    theme: {
      primaryColor: '#a855f7',
      backgroundColor: '#18181b',
      textColor: '#e4e4e7',
      cardColor: '#27272a',
      accentColor: '#f472b6'
    },
    mode: 'dark' as Theme
  },
  {
    name: 'Obsidian',
    theme: {
      primaryColor: '#10b981',
      backgroundColor: '#111827',
      textColor: '#f3f4f6',
      cardColor: '#1f2937',
      accentColor: '#6366f1'
    },
    mode: 'dark' as Theme
  },
  {
    name: 'Nightfall',
    theme: {
      primaryColor: '#f59e0b',
      backgroundColor: '#1a1a2e',
      textColor: '#e5e5e5',
      cardColor: '#2d2d42',
      accentColor: '#ef4444'
    },
    mode: 'dark' as Theme
  }
];

const ThemeCustomizer = () => {
  const { theme, customTheme, setTheme, updateCustomTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tempTheme, setTempTheme] = useState<CustomTheme>({ ...customTheme });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Reset selected preset when panel opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(null);
    }
  }, [isOpen]);

  const handleChange = (key: keyof CustomTheme, value: string) => {
    setTempTheme({ ...tempTheme, [key]: value });
    setSelectedPreset(null); // Clear preset selection when manually changing colors
  };
  
  const handleSave = () => {
    updateCustomTheme(tempTheme);
    setTheme('custom');
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setTempTheme({ ...customTheme });
    setIsOpen(false);
  };
  
  const applyPreset = (preset: CustomTheme, presetName: string, mode: Theme) => {
    setTempTheme(preset);
    setSelectedPreset(presetName);
    
    // Immediately apply the theme mode and colors
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
      updateCustomTheme(preset);
    }
  };

  // Check if a theme matches current temp theme
  const isPresetMatching = (preset: CustomTheme): boolean => {
    return (
      preset.primaryColor === tempTheme.primaryColor &&
      preset.backgroundColor === tempTheme.backgroundColor &&
      preset.textColor === tempTheme.textColor &&
      preset.cardColor === tempTheme.cardColor &&
      preset.accentColor === tempTheme.accentColor
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-30 btn-primary rounded-full p-4 shadow-lg text-white"
        aria-label="Customize theme"
      >
        <FaPalette className="w-6 h-6" />
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={handleCancel} />
      )}
      
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-80 max-w-full bg-white dark:bg-surface-dark z-50 shadow-xl overflow-auto"
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FaPaintBrush className="mr-2" /> Customize Theme
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {/* Theme mode selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Theme Mode</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 ${
                  theme === 'light' 
                    ? 'bg-primary-light text-white dark:bg-primary-dark' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <FaSun />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 ${
                  theme === 'dark' 
                    ? 'bg-primary-light text-white dark:bg-primary-dark' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <FaMoon />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('custom')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 ${
                  theme === 'custom' 
                    ? 'bg-primary-light text-white dark:bg-primary-dark' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <FaPalette />
                <span>Custom</span>
              </button>
            </div>
          </div>
          
          {/* Light Theme presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Light Mode Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {LIGHT_THEME_PRESETS.map((preset) => (
                <ThemePreset
                  key={`light-${preset.name}`}
                  name={preset.name}
                  primaryColor={preset.theme.primaryColor}
                  backgroundColor={preset.theme.backgroundColor}
                  accentColor={preset.theme.accentColor}
                  onClick={() => applyPreset(preset.theme, preset.name, preset.mode)}
                  isSelected={selectedPreset === preset.name || 
                    (selectedPreset === null && isPresetMatching(preset.theme))}
                  targetMode={preset.mode}
                />
              ))}
            </div>
          </div>

          {/* Dark Theme presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Dark Mode Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {DARK_THEME_PRESETS.map((preset) => (
                <ThemePreset
                  key={`dark-${preset.name}`}
                  name={preset.name}
                  primaryColor={preset.theme.primaryColor}
                  backgroundColor={preset.theme.backgroundColor}
                  accentColor={preset.theme.accentColor}
                  onClick={() => applyPreset(preset.theme, preset.name, preset.mode)}
                  isSelected={selectedPreset === preset.name || 
                    (selectedPreset === null && isPresetMatching(preset.theme))}
                  targetMode={preset.mode}
                />
              ))}
            </div>
          </div>
          
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          
          {/* Custom color pickers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Custom Colors</h3>
              {selectedPreset && (
                <div className="text-sm text-primary-light dark:text-primary-dark">
                  Using {selectedPreset}
                </div>
              )}
            </div>
            <ColorPicker
              color={tempTheme.primaryColor}
              onChange={(color) => handleChange('primaryColor', color)}
              label="Primary Color"
            />
            <ColorPicker
              color={tempTheme.backgroundColor}
              onChange={(color) => handleChange('backgroundColor', color)}
              label="Background Color"
            />
            <ColorPicker
              color={tempTheme.textColor}
              onChange={(color) => handleChange('textColor', color)}
              label="Text Color"
            />
            <ColorPicker
              color={tempTheme.cardColor}
              onChange={(color) => handleChange('cardColor', color)}
              label="Card Color"
            />
            <ColorPicker
              color={tempTheme.accentColor}
              onChange={(color) => handleChange('accentColor', color)}
              label="Accent Color"
            />
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              <FaCheck className="mr-1" /> Apply Custom Theme
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ThemeCustomizer; 