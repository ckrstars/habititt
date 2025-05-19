import React from 'react';
import { Habit } from '../store/habitStore';

interface YearProgressGridProps {
  habit: Habit | undefined;
  habits: Habit[];
  selectedHabit: string | 'all';
}

const YearProgressGrid: React.FC<YearProgressGridProps> = ({ habit, habits, selectedHabit }) => {
  if (!habit && selectedHabit !== 'all') {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">Please select a habit to view its yearly progress</p>
      </div>
    );
  }

  // Determine which habits to show
  const habitsToShow = selectedHabit === 'all' ? habits : (habit ? [habit] : []);
  
  if (habitsToShow.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">No habits to display</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4">
      {habitsToShow.map(h => {
        // Create a year grid of contributions
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Get all dates from the past year
        const dates: string[] = [];
        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d).toISOString().split('T')[0]);
        }
        
        // Create a map of completed dates
        const completedDatesMap = new Map<string, boolean>();
        h.history.forEach(entry => {
          if (entry.completed && dates.includes(entry.date)) {
            completedDatesMap.set(entry.date, true);
          }
        });
        
        // Group dates by month for a more structured view
        const monthlyData: { [key: string]: { date: string; completed: boolean }[] } = {};
        
        dates.forEach(date => {
          const month = date.substring(0, 7); // YYYY-MM format
          if (!monthlyData[month]) {
            monthlyData[month] = [];
          }
          
          monthlyData[month].push({
            date,
            completed: completedDatesMap.has(date)
          });
        });
        
        return (
          <div key={h.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{h.icon}</span>
              <h4 className="font-medium">{h.name}</h4>
            </div>
            
            <div className="grid grid-cols-12 gap-1">
              {Object.entries(monthlyData).map(([month, days]) => {
                const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' });
                const completedCount = days.filter(d => d.completed).length;
                const percentage = Math.round((completedCount / days.length) * 100);
                
                return (
                  <div key={month} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-gray-500 mb-1">{monthName}</div>
                    <div 
                      className="w-full h-20 rounded-lg"
                      style={{ 
                        background: `linear-gradient(to top, 
                          ${percentage > 0 ? `rgba(74, 222, 128, ${percentage / 100})` : 'rgba(229, 231, 235, 0.2)'}, 
                          rgba(229, 231, 235, 0.05))`
                      }}
                      title={`${completedCount}/${days.length} days in ${monthName}`}
                    />
                    <div className="text-xs mt-1">{percentage}%</div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-4">
              <span>{oneYearAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              <span>{today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default YearProgressGrid; 