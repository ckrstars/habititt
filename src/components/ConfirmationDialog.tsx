import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  const getTypeClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirm: 'bg-red-500 hover:bg-red-600 text-white',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          confirm: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'info':
      default:
        return {
          icon: 'text-blue-500',
          confirm: 'bg-blue-500 hover:bg-blue-600 text-white',
          border: 'border-blue-200 dark:border-blue-800'
        };
    }
  };

  const classes = getTypeClasses();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md border ${classes.border}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="flex items-center mb-4">
            <div className={`mr-4 ${classes.icon}`}>
              <FaExclamationTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          
          <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              className="btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={`btn-secondary ${classes.confirm}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog; 