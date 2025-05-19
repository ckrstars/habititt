import { Habit } from '../store/habitStore';

type YearGridProps = {
  habit: Habit;
};

const YearGrid = ({ habit }: YearGridProps) => {
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
  habit.history.forEach(entry => {
    if (entry.completed && dates.includes(entry.date)) {
      completedDatesMap.set(entry.date, true);
    }
  });
  
  // Generate a proper 7×52 grid
  const generateYearGrid = () => {
    // Start with the day of week of the first date (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = new Date(dates[0]).getDay();
    
    // Create a 7×52 grid (7 days per week, 52 weeks per year)
    const grid: {date: string | null, completed: boolean}[][] = Array(7).fill(null).map(() => 
      Array(52).fill(null).map(() => ({ date: null, completed: false }))
    );
    
    let week = 0;
    let dayInWeek = firstDayOfWeek;
    
    // Fill in the grid with dates
    dates.forEach(date => {
      // If we've gone past 52 columns, stop
      if (week >= 52) return;
      
      grid[dayInWeek][week] = {
        date,
        completed: completedDatesMap.has(date)
      };
      
      // Move to the next day
      dayInWeek = (dayInWeek + 1) % 7;
      
      // If we wrapped around to Sunday, move to the next week
      if (dayInWeek === 0) {
        week++;
      }
    });
    
    return grid;
  };
  
  const yearGrid = generateYearGrid();
  
  // Generate month labels
  const generateMonthLabels = () => {
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a label for each month
    for (let i = 0; i < 12; i++) {
      const date = new Date(oneYearAgo);
      date.setMonth(oneYearAgo.getMonth() + i);
      
      // Calculate the week index for this month
      const monthStartWeek = Math.floor(i * 4.33);
      
      labels.push({
        text: months[date.getMonth()],
        offset: monthStartWeek * 16
      });
    }
    
    return labels;
  };
  
  const monthLabels = generateMonthLabels();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{habit.icon}</span>
        <h4 className="font-medium">{habit.name}</h4>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[832px]">
          {/* Month indicators */}
          <div className="relative h-6 mb-1 ml-8">
            {monthLabels.map((label, i) => (
              <div 
                key={i}
                className="absolute top-0 text-xs text-gray-500"
                style={{ left: `${label.offset}px` }}
              >
                {label.text}
              </div>
            ))}
          </div>
          
          <div className="flex">
            {/* Day of week labels */}
            <div className="flex flex-col w-8 mr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="h-4 flex items-center justify-end text-xs text-gray-500 pr-1" style={{ height: '16px' }}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid of cells */}
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {yearGrid.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-3 h-3 border ${cell.date 
                      ? cell.completed 
                        ? 'bg-green-300 border-green-400 dark:bg-green-700 dark:border-green-600' 
                        : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      : 'opacity-0'
                    }`}
                    title={cell.date ? `${cell.date}: ${cell.completed ? 'Completed' : 'Not completed'}` : ''}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"></div>
            <span>Not completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-green-400 bg-green-300 dark:border-green-600 dark:bg-green-700"></div>
            <span>Completed</span>
          </div>
        </div>
        <span>{oneYearAgo.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default YearGrid; 