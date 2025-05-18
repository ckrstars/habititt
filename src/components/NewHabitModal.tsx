import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBell, FaChevronDown } from 'react-icons/fa';
import useHabitStore, { HabitCategory } from '../store/habitStore';

interface NewHabitModalProps {
  onClose: () => void;
  editHabit?: string; // Optional habit ID to edit
}

const FREQUENCY_OPTIONS = ['daily', 'weekly', 'custom'] as const;
const CATEGORIES: HabitCategory[] = ['health', 'productivity', 'learning', 'mindfulness', 'finance', 'social', 'custom'];

const ICONS = [
  '🏃‍♂️', '💪', '🧘‍♀️', '🚶‍♀️', '🚴‍♀️', '🏊‍♀️', '💧', '🥗', '🍎', '🥦', 
  '😴', '📚', '✍️', '🎯', '💼', '💰', '💻', '📝', '🧠', '🎨', 
  '🎵', '🎮', '🧹', '🌱', '☕', '🍵', '🥤', '🧘‍♂️', '🙏', '🤔'
];

const COLOR_OPTIONS = [
  '#4ade80', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#06b6d4', // cyan
  '#64748b', // slate
];

// Enhanced dropdown component
const CustomSelect = ({ value, onChange, options, label, colorMap }: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string }[];
  label: string;
  colorMap?: Record<string, string>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between input bg-white dark:bg-gray-800 pr-2 relative border-2 border-gray-200 dark:border-gray-700 rounded-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2 py-2 pl-3">
          {colorMap && (
            <motion.div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colorMap[value] }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          <span>{selectedOption?.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 ${value === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                {colorMap && (
                  <motion.div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: colorMap[option.value] }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Category color map
const categoryColorMap = {
  health: '#4ade80',
  productivity: '#3b82f6',
  learning: '#a855f7',
  mindfulness: '#ec4899',
  finance: '#eab308',
  social: '#f97316',
  custom: '#64748b',
};

const NewHabitModal = ({ onClose, editHabit }: NewHabitModalProps) => {
  const { habits, addHabit, updateHabit } = useHabitStore();
  
  // Find the habit being edited or use default values
  const habitToEdit = editHabit ? habits.find(h => h.id === editHabit) : undefined;
  
  const [formData, setFormData] = useState({
    name: habitToEdit?.name || '',
    description: habitToEdit?.description || '',
    icon: habitToEdit?.icon || ICONS[0],
    color: habitToEdit?.color || COLOR_OPTIONS[1],
    target: habitToEdit?.target || 1,
    countType: habitToEdit?.countType || 'completion' as 'completion' | 'count',
    countUnit: habitToEdit?.countUnit || '',
    frequency: habitToEdit?.frequency || 'daily' as typeof FREQUENCY_OPTIONS[number],
    category: habitToEdit?.category || 'health' as HabitCategory,
    customDays: habitToEdit?.customDays || [] as number[],
    reminderEnabled: habitToEdit?.reminderEnabled || false,
    reminderTime: habitToEdit?.reminderTime || '09:00',
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when tab changes
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Fix modal positioning
  useEffect(() => {
    if (modalRef.current) {
      const modalHeight = modalRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      
      // If modal exceeds window height, adjust its position and make it scrollable
      if (modalHeight > windowHeight * 0.8) {
        modalRef.current.style.maxHeight = `${windowHeight * 0.85}px`;
        modalRef.current.style.top = '5%'; 
        modalRef.current.style.transform = 'translateX(-50%)';
        modalRef.current.style.overflowY = 'auto';
      } else {
        // Center the modal if it fits on screen
        modalRef.current.style.top = '50%';
        modalRef.current.style.transform = 'translate(-50%, -50%)';
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editHabit) {
      updateHabit(editHabit, formData);
    } else {
      addHabit(formData);
    }
    
    onClose();
  };

  const categoryOptions = CATEGORIES.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const frequencyOptions = FREQUENCY_OPTIONS.map(freq => ({
    value: freq,
    label: freq.charAt(0).toUpperCase() + freq.slice(1)
  }));

  const countTypeOptions = [
    { value: 'completion', label: 'Mark as Complete' },
    { value: 'count', label: 'Count Progress' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-[95%] md:w-full md:max-w-md bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-xl z-50 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{editHabit ? 'Edit Habit' : 'New Habit'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex mb-4 border-b">
          <button
            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic
          </button>
          <button
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  id="habit-name"
                  placeholder="e.g., Morning Run"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="habit-description" className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="habit-description"
                  placeholder="What is this habit about?"
                  className="input min-h-[80px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-[150px] overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {ICONS.map((icon) => (
                    <motion.button
                      key={icon}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 rounded-lg text-xl ${
                        formData.icon === icon
                          ? 'bg-primary-light dark:bg-primary-dark text-white'
                          : 'bg-white dark:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              <CustomSelect
                label="Category"
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value as HabitCategory })}
                options={categoryOptions}
                colorMap={categoryColorMap}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Track Type"
                  value={formData.countType}
                  onChange={(value) => setFormData({ ...formData, countType: value as 'completion' | 'count' })}
                  options={countTypeOptions}
                />
              </div>

              {formData.countType === 'count' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Target Count
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                        className="input w-2/3"
                        required
                      />
                      <input
                        type="text"
                        value={formData.countUnit}
                        onChange={(e) => setFormData({ ...formData, countUnit: e.target.value })}
                        className="input w-1/3"
                        placeholder="Unit"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Example: 30 pages, 5 miles, 10 glasses
                    </p>
                  </div>
                </div>
              )}

              {formData.countType === 'completion' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <CustomSelect
                label="Frequency"
                value={formData.frequency}
                onChange={(value) => setFormData({ ...formData, frequency: value as typeof FREQUENCY_OPTIONS[number] })}
                options={frequencyOptions}
              />

              {formData.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Custom Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <motion.button
                        key={day}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const newDays = formData.customDays.includes(index)
                            ? formData.customDays.filter((d) => d !== index)
                            : [...formData.customDays, index];
                          setFormData({ ...formData, customDays: newDays });
                        }}
                        className={`p-2 text-sm rounded-lg ${
                          formData.customDays.includes(index)
                            ? 'bg-primary-light dark:bg-primary-dark text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        style={formData.customDays.includes(index) ? { backgroundColor: formData.color } : {}}
                      >
                        {day}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    Reminders
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.reminderEnabled}
                      onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/20 dark:peer-focus:ring-primary-dark/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark" style={formData.reminderEnabled ? { backgroundColor: formData.color } : {}} />
                  </label>
                </div>

                {formData.reminderEnabled && (
                  <div className="flex items-center mt-2">
                    <FaBell className="text-gray-400 mr-2" />
                    <input
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                      className="input"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{formData.icon}</span>
                  <span className="font-medium">{formData.name || 'Habit Name'}</span>
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: formData.color }}></div>
                </div>
                {formData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {formData.description}
                  </p>
                )}
                {formData.countType === 'count' && formData.countUnit && (
                  <p className="text-sm mt-1">
                    Target: {formData.target} {formData.countUnit}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={!formData.name || (formData.frequency === 'custom' && formData.customDays.length === 0)}
              style={{ backgroundColor: formData.color, borderColor: formData.color }}
            >
              {editHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewHabitModal; 