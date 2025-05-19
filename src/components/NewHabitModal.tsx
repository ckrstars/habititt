import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { Habit } from '../store/habitStore';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId?: string | null;
  onAdd: (habit: Omit<Habit, 'id' | 'history' | 'createdAt' | 'updatedAt' | 'progress' | 'streak'>) => void;
  onUpdate: (id: string, habit: Partial<Habit>) => void;
  habits: Habit[];
}

const FREQUENCY_OPTIONS = ['daily', 'weekly', 'custom'] as const;
const CATEGORIES = ['health', 'productivity', 'learning', 'mindfulness', 'finance', 'social', 'custom'] as const;
const ICONS = [
  '🏃‍♂️', '💪', '🧘‍♀️', '🚶‍♀️', '🚴‍♀️', '🏊‍♀️', '💧', '🥗', '🍎', '🥦',
  '😴', '📚', '✍️', '🎯', '💼', '💰', '💻', '📝', '🧠', '🎨',
  '🎵', '🎮', '🧹', '🌱', '☕', '🍵', '🥤', '🧘‍♂️', '🙏', '🤔'
];
const COLOR_OPTIONS = [
  '#4ade80', '#3b82f6', '#a855f7', '#ec4899', '#eab308', '#f97316', '#ef4444', '#06b6d4', '#64748b',
  '#84cc16', '#14b8a6', '#8b5cf6', '#d946ef', '#f43f5e', '#15803d', '#1d4ed8', '#7e22ce', '#be123c', '#b45309',
  '#000000', '#4b5563', '#94a3b8', '#e5e7eb', '#ffffff'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const NewHabitModal = ({ isOpen, onClose, habitId, onAdd, onUpdate, habits }: NewHabitModalProps) => {
  const habitToEdit = habitId ? habits.find(h => h.id === habitId) : undefined;
  const [formData, setFormData] = useState({
    name: habitToEdit?.name || '',
    description: habitToEdit?.description || '',
    icon: habitToEdit?.icon || ICONS[0],
    color: habitToEdit?.color || COLOR_OPTIONS[1],
    target: habitToEdit?.target || 1,
    countType: habitToEdit?.countType || 'completion' as 'completion' | 'count',
    countUnit: habitToEdit?.countUnit || '',
    frequency: habitToEdit?.frequency || 'daily' as typeof FREQUENCY_OPTIONS[number],
    category: habitToEdit?.category || 'health',
    customDays: habitToEdit?.customDays || [] as number[],
    reminderEnabled: habitToEdit?.reminderEnabled || false,
    reminderTime: habitToEdit?.reminderTime || '09:00',
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setFormData({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        icon: habitToEdit.icon || ICONS[0],
        color: habitToEdit.color || COLOR_OPTIONS[1],
        target: habitToEdit.target || 1,
        countType: habitToEdit.countType || 'completion',
        countUnit: habitToEdit.countUnit || '',
        frequency: habitToEdit.frequency || 'daily',
        category: habitToEdit.category || 'health',
        customDays: habitToEdit.customDays || [],
        reminderEnabled: habitToEdit.reminderEnabled || false,
        reminderTime: habitToEdit.reminderTime || '09:00',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: ICONS[0],
        color: COLOR_OPTIONS[1],
        target: 1,
        countType: 'completion',
        countUnit: '',
        frequency: 'daily',
        category: 'health',
        customDays: [],
        reminderEnabled: false,
        reminderTime: '09:00',
      });
    }
    // eslint-disable-next-line
  }, [habitId]);

  useEffect(() => {
    if (modalRef.current) {
      const modalHeight = modalRef.current.getBoundingClientRect().height;
      const windowHeight = window.innerHeight;
      if (modalHeight > windowHeight * 0.8) {
        modalRef.current.style.maxHeight = `${windowHeight * 0.85}px`;
        modalRef.current.style.top = '5%';
        modalRef.current.style.transform = 'translateX(-50%)';
        modalRef.current.style.overflowY = 'auto';
      } else {
        modalRef.current.style.top = '50%';
        modalRef.current.style.transform = 'translate(-50%, -50%)';
      }
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomDayToggle = (dayIdx: number) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(dayIdx)
        ? prev.customDays.filter(d => d !== dayIdx)
        : [...prev.customDays, dayIdx],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (formData.target < 1) {
      setError('Target must be at least 1');
      setLoading(false);
      return;
    }
    if (formData.countType === 'count' && !formData.countUnit.trim()) {
      setError('Unit is required for count type');
      setLoading(false);
      return;
    }
    if (formData.frequency === 'custom' && formData.customDays.length === 0) {
      setError('Select at least one custom day');
      setLoading(false);
      return;
    }
    try {
      if (habitToEdit && habitId) {
        onUpdate(habitId, formData);
      } else {
        onAdd(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 custom-theme text-[var(--text-color)]"
          initial={{ scale: 0.95, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {habitToEdit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  className="input w-full"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input w-full"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`p-1 rounded-lg text-xl ${formData.icon === icon ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-white dark:bg-gray-700'}`}
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      aria-label={`Select icon ${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: color,
                        border: color === '#ffffff' ? '1px solid #e5e5e5' : 'none'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                  <div className="mt-2 w-full">
                    <label className="text-xs text-gray-500 mb-1 block">Custom color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-8 cursor-pointer rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tracking Type</label>
                <select
                  name="countType"
                  value={formData.countType}
                  onChange={handleSelectChange}
                  className="input w-full"
                >
                  <option value="completion">Completion</option>
                  <option value="count">Count</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target {formData.countType === 'count' ? '& Unit' : ''}</label>
                <div className="flex">
                <input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                    min={1}
                  className="input w-full"
                  required
                />
                  {formData.countType === 'count' && (
                <input
                  type="text"
                      name="countUnit"
                      value={formData.countUnit}
                  onChange={handleInputChange}
                      className="input w-full ml-2"
                      placeholder="Unit"
                  required
                />
                  )}
                </div>
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleSelectChange}
                  className="input w-full"
                >
                  {FREQUENCY_OPTIONS.map(freq => (
                    <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                  ))}
                </select>
              {formData.frequency === 'custom' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((day, i) => (
                      <button
                        key={day}
                        type="button"
                      className={`px-3 py-1 rounded-full text-sm ${formData.customDays.includes(i) ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                      onClick={() => handleCustomDayToggle(i)}
                      >
                        {day}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center mb-2">
              <input
                type="checkbox"
                  id="reminderEnabled"
                  name="reminderEnabled"
                  checked={formData.reminderEnabled}
                onChange={handleInputChange}
                  className="mr-2"
              />
                <label htmlFor="reminderEnabled" className="text-sm font-medium">Enable Reminder</label>
              </div>
              {formData.reminderEnabled && (
                <input
                  type="time"
                  name="reminderTime"
                  value={formData.reminderTime}
                  onChange={handleInputChange}
                  className="input w-full"
                />
              )}
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={onClose}
              >
                Cancel
              </button>
            <button
              type="submit"
                className="btn-primary flex-1"
              disabled={loading}
            >
                {loading ? 'Saving...' : habitToEdit ? 'Update Habit' : 'Create Habit'}
            </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewHabitModal; 