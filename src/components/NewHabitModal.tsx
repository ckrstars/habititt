import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { Habit } from '../lib/supabase';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId?: string | null;
  onAdd: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, habit: Partial<Habit>) => Promise<void>;
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
    count_type: habitToEdit?.count_type || 'completion' as 'completion' | 'count',
    count_unit: habitToEdit?.count_unit || '',
    frequency: habitToEdit?.frequency || 'daily' as typeof FREQUENCY_OPTIONS[number],
    category: habitToEdit?.category || 'health',
    custom_days: habitToEdit?.custom_days || [] as number[],
    reminder_enabled: habitToEdit?.reminder_enabled || false,
    reminder_time: habitToEdit?.reminder_time || '09:00',
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
        count_type: habitToEdit.count_type || 'completion',
        count_unit: habitToEdit.count_unit || '',
        frequency: habitToEdit.frequency || 'daily',
        category: habitToEdit.category || 'health',
        custom_days: habitToEdit.custom_days || [],
        reminder_enabled: habitToEdit.reminder_enabled || false,
        reminder_time: habitToEdit.reminder_time || '09:00',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: ICONS[0],
        color: COLOR_OPTIONS[1],
        target: 1,
        count_type: 'completion',
        count_unit: '',
        frequency: 'daily',
        category: 'health',
        custom_days: [],
        reminder_enabled: false,
        reminder_time: '09:00',
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
      custom_days: prev.custom_days.includes(dayIdx)
        ? prev.custom_days.filter(d => d !== dayIdx)
        : [...prev.custom_days, dayIdx],
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
    if (formData.count_type === 'count' && !formData.count_unit.trim()) {
      setError('Unit is required for count type');
      setLoading(false);
      return;
    }
    if (formData.frequency === 'custom' && formData.custom_days.length === 0) {
      setError('Select at least one custom day');
      setLoading(false);
      return;
    }
    try {
      if (habitToEdit && habitId) {
        await onUpdate(habitId, formData);
      } else {
        await onAdd({ ...formData, progress: 0, streak: 0 });
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
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6"
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
                <div className="flex flex-wrap gap-1">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-primary-light dark:border-primary-dark' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Track Type</label>
                <select
                  name="count_type"
                  value={formData.count_type}
                  onChange={handleSelectChange}
                  className="input w-full"
                >
                  <option value="completion">Mark as Complete</option>
                  <option value="count">Count Progress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target</label>
                <input
                  type="number"
                  name="target"
                  min={1}
                  value={formData.target}
                  onChange={handleInputChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            {formData.count_type === 'count' && (
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <input
                  type="text"
                  name="count_unit"
                  value={formData.count_unit}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g. pages, km, reps"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
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
              </div>
              {formData.frequency === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Days</label>
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${formData.custom_days.includes(idx) ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        onClick={() => handleCustomDayToggle(idx)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="reminder_enabled"
                checked={formData.reminder_enabled}
                onChange={handleInputChange}
                className="form-checkbox h-4 w-4 text-primary-light"
                id="reminder_enabled"
              />
              <label htmlFor="reminder_enabled" className="text-sm font-medium">Enable Reminder</label>
              {formData.reminder_enabled && (
                <input
                  type="time"
                  name="reminder_time"
                  value={formData.reminder_time}
                  onChange={handleInputChange}
                  className="input ml-2 w-28"
                />
              )}
            </div>
            {/* Live Preview */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mt-2">
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
              {formData.count_type === 'count' && formData.count_unit && (
                <p className="text-sm mt-1">
                  Target: {formData.target} {formData.count_unit}
                </p>
              )}
              {formData.count_type === 'completion' && (
                <p className="text-sm mt-1">
                  Daily Target: {formData.target}
                </p>
              )}
            </div>
            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
            <button
              type="submit"
              className="btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Saving...' : habitToEdit ? 'Update Habit' : 'Add Habit'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewHabitModal; 