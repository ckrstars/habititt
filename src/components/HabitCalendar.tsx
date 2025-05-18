import { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Habit } from '../store/habitStore';

interface HabitCalendarProps {
  habit: Habit;
  year: number;
  color?: string;
}

// Function to get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Function to get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Function to calculate gradient color based on percentage
const getGradientColor = (baseColor: string, percentage: number): string => {
  if (percentage <= 0) return '';
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  const rgb = hexToRgb(baseColor);
  
  // Create a gradient from light to full color
  const intensity = Math.max(0.2, percentage);
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
};

const HabitCalendar = ({ habit, year, color }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const habitColor = color || habit.color;

  // Generate calendar data for current month and year
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, currentMonth);
    const firstDay = getFirstDayOfMonth(year, currentMonth);
    
    const calendarDays = [];
    
    // Calculate days to display from previous month
    const daysFromPreviousMonth = firstDay;
    for (let i = 0; i < daysFromPreviousMonth; i++) {
      calendarDays.push({ day: null, date: null });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date has a history entry
      const historyEntry = habit.history.find(h => h.date === dateStr);
      
      // Calculate percentage for count-based habits
      let percentage = 0;
      if (historyEntry) {
        percentage = Math.min(historyEntry.count / habit.target, 1);
      }
      
      calendarDays.push({
        day,
        date: dateStr,
        completed: !!historyEntry?.completed,
        count: historyEntry?.count || 0,
        percentage: percentage
      });
    }
    
    return calendarDays;
  }, [habit.history, habit.target, year, currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => prev === 0 ? 11 : prev - 1);
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev === 11 ? 0 : prev + 1);
  };

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FaChevronLeft size={16} />
        </button>
        <h3 className="font-medium">
          {MONTHS[currentMonth]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FaChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={`header-${i}`} className="text-xs text-center text-gray-500 py-1">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarData.map((day, i) => (
          <div
            key={`day-${i}`}
            className={`aspect-square flex items-center justify-center text-xs ${
              !day.day ? 'text-gray-300 dark:text-gray-700' : ''
            }`}
          >
            {day.day && (
              <div className="relative w-full h-full flex items-center justify-center">
                <span className={`z-10 ${day.completed ? 'font-bold' : ''}`}>{day.day}</span>
                {(day.completed || day.percentage > 0) && (
                  <div 
                    className="absolute inset-1 rounded-full transition-all duration-300 ease-in-out"
                    style={{ 
                      backgroundColor: getGradientColor(habitColor, day.percentage || 0),
                      transform: day.completed ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* HabitKit-style activity chart */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Activity</h4>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            // Get actual data from habit history
            const day = new Date();
            day.setDate(day.getDate() - (30 - i));
            const dateStr = day.toISOString().split('T')[0];
            const historyEntry = habit.history.find(h => h.date === dateStr);
            const percentage = historyEntry ? Math.min(historyEntry.count / habit.target, 1) : 0;
            
            return (
              <div
                key={`activity-${i}`}
                className={`h-8 rounded-sm ${percentage === 0 ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                style={percentage > 0 ? { 
                  backgroundColor: habitColor,
                  opacity: Math.max(0.2, percentage)
                } : {}}
                title={`${dateStr}: ${historyEntry?.count || 0}/${habit.target} ${habit.countUnit || ''}`}
              />
            );
          })}
        </div>
      </div>
      
      {/* HabitKit-style grid visualization */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Year View</h4>
        <div className="habit-calendar">
          {Array.from({ length: 53 * 7 }).map((_, i) => {
            // Calculate date from grid position
            const day = new Date(year, 0, 1);
            day.setDate(day.getDate() + i);
            const dateStr = day.toISOString().split('T')[0];
            
            // Check if there's data for this date
            const historyEntry = habit.history.find(h => h.date === dateStr);
            const percentage = historyEntry ? Math.min(historyEntry.count / habit.target, 1) : 0;
            const hasActivity = percentage > 0;
            
            return (
              <div 
                key={`grid-${i}`}
                className={`calendar-grid-cell ${hasActivity ? 'filled' : 'empty'}`}
                style={hasActivity ? { 
                  backgroundColor: habitColor,
                  opacity: Math.max(0.2, percentage)
                } : {}}
                title={`${dateStr}: ${historyEntry?.count || 0}/${habit.target} ${habit.countUnit || ''}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar; 