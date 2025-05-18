import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FaArrowsAlt, FaTimes, FaCog } from 'react-icons/fa';

type WidgetSize = 'small' | 'medium' | 'large';

interface HabitWidgetProps {
  title: string;
  children: ReactNode;
  size?: WidgetSize;
  color?: string;
  onRemove?: () => void;
  onConfigure?: () => void;
  onResize?: (size: WidgetSize) => void;
  className?: string;
}

const HabitWidget = ({
  title,
  children,
  size = 'medium',
  color,
  onRemove,
  onConfigure,
  onResize,
  className = '',
}: HabitWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`widget widget-${size} ${className}`}
      style={color ? { borderTop: `3px solid ${color}` } : {}}
      layout
    >
      <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-md h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-medium">{title}</h3>
          
          <div className="flex items-center space-x-1">
            {onResize && (
              <div className="flex border rounded-md overflow-hidden">
                {(['small', 'medium', 'large'] as WidgetSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onResize(s)}
                    className={`px-1.5 py-0.5 text-xs ${
                      size === s
                        ? 'bg-gray-200 dark:bg-gray-700 font-medium'
                        : 'bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {s.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <FaCog size={14} />
              </button>
            )}
            
            <button
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-move"
            >
              <FaArrowsAlt size={14} />
            </button>
            
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 dark:hover:text-red-400 rounded"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default HabitWidget; 