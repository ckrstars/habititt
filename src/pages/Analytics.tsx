import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaChartPie, FaChartLine, FaChartBar, FaCalendarAlt, FaPlus, FaFire, FaList } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import useHabitStore from '../store/habitStore';
import HabitCalendar from '../components/HabitCalendar';
import HabitWidget from '../components/widgets/HabitWidget';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Predefined chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];
const RADIAN = Math.PI / 180;

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 shadow rounded border border-gray-200 dark:border-gray-700">
        <p className="font-medium">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Simple Monthly Calendar component
const MonthlyCalendarView = ({ habit, month, year }: { habit: any, month: number, year: number }) => {
  // Get first day of month (0 = Sunday) and number of days in month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create calendar days array including empty spaces for the first week
  const days = [];
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true });
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date has a history entry
    const historyEntry = habit.history.find((h: any) => h.date === dateStr);
    const percentage = historyEntry ? Math.min(historyEntry.count / habit.target, 1) : 0;
    
    days.push({
      day: i,
      date: dateStr,
      completed: !!historyEntry?.completed,
      percentage: percentage
    });
  }

  return (
    <div className="w-full">
      <h3 className="text-center font-medium mb-4">
        {MONTHS[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`header-${i}`} className="text-center text-sm font-medium py-1 text-gray-500">
            {d}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day: any, i) => (
          <div 
            key={`day-${i}`} 
            className={`aspect-square flex items-center justify-center border rounded-md ${
              day.empty ? 'border-transparent' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {!day.empty && (
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="z-10 text-sm">{day.day}</span>
                {(day.completed || (day.percentage && day.percentage > 0)) && (
                  <div 
                    className="absolute inset-0 rounded-md" 
                    style={{ 
                      backgroundColor: habit.color,
                      opacity: 0.2 + ((day.percentage || 0) * 0.8)
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Habit Analysis Component
const HabitAnalysis = ({ habit }: { habit: any }) => {
  const streakData = {
    current: habit.streak,
    best: habit.history.length > 0 ? Math.max(habit.streak, 5) : 0, // Mock data (would calculate real best streak)
    average: habit.history.length > 0 ? Math.round(habit.streak * 0.7) : 0 // Mock data
  };
  
  // Calculate completion rate
  const completionRate = habit.history.length > 0 
    ? Math.round((habit.history.filter((h: any) => h.completed).length / habit.history.length) * 100)
    : 0;
  
  // Calculate month-by-month data (mock data for now)
  const getMonthlyData = () => {
    return MONTHS.map((month, index) => {
      // Create a counter for completions in this month
      const completions = habit.history.filter((entry: any) => {
        const date = new Date(entry.date);
        return date.getMonth() === index && entry.completed;
      }).length;
      
      return {
        month,
        completions,
        target: 20 // Mock target
      };
    });
  };
  
  const monthlyData = getMonthlyData();
  
  // Calculate total count for count-based habits
  const totalCount = habit.countType === 'count' ? 
    habit.history.reduce((sum: number, entry: any) => sum + entry.count, 0) : 
    habit.history.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center">
          <h3 className="font-medium text-gray-500 mb-1">Current Streak</h3>
          <div className="flex items-center">
            <FaFire className="text-orange-500 mr-2" />
            <span className="text-3xl font-bold">{streakData.current}</span>
          </div>
          <p className="text-sm text-gray-500">days</p>
        </div>
        
        <div className="card flex flex-col items-center">
          <h3 className="font-medium text-gray-500 mb-1">Best Streak</h3>
          <div className="flex items-center">
            <FaFire className="text-orange-500 mr-2" />
            <span className="text-3xl font-bold">{streakData.best}</span>
          </div>
          <p className="text-sm text-gray-500">days</p>
        </div>
        
        <div className="card flex flex-col items-center">
          <h3 className="font-medium text-gray-500 mb-1">Completion Rate</h3>
          <div className="text-3xl font-bold">{completionRate}%</div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full rounded-full" 
              style={{ width: `${completionRate}%`, backgroundColor: habit.color }}
            />
          </div>
        </div>
      </div>
      
      {habit.countType === 'count' && (
        <div className="card">
          <h3 className="font-medium mb-3">Total Progress</h3>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold">{totalCount}</div>
            <div className="text-xl text-gray-500 mb-1">
              {habit.countUnit}
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Total {habit.name.toLowerCase()} tracked since you started
          </p>
        </div>
      )}
      
      <div className="card">
        <h3 className="font-medium mb-4">Monthly Completion</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="completions" 
                name="Completions" 
                fill={habit.color} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card">
        <h3 className="font-medium mb-4">Monthly Calendar</h3>
        <MonthlyCalendarView 
          habit={habit}
          month={new Date().getMonth()}
          year={new Date().getFullYear()}
        />
      </div>
    </div>
  );
};

type ChartType = 'overview' | 'categories' | 'streak' | 'calendar' | 'time' | 'analysis';

const Analytics = () => {
  const { habits, getCategoryStats } = useHabitStore();
  const [selectedHabit, setSelectedHabit] = useState<string | 'all'>('all');
  const [activeChart, setActiveChart] = useState<ChartType>('overview');
  const [widgets, setWidgets] = useState([
    { id: '1', type: 'weeklyProgress', size: 'large' as const },
    { id: '2', type: 'categoryStats', size: 'medium' as const },
    { id: '3', type: 'streak', size: 'small' as const },
    { id: '4', type: 'habitCalendar', size: 'large' as const },
  ]);

  // Get weekly data
  const weeklyData = DAYS.map((day, index) => {
    const dayData = habits
      .filter((habit) => selectedHabit === 'all' || habit.id === selectedHabit)
      .reduce(
        (acc, habit) => {
          const todayHistory = habit.history.filter((h) => {
            const date = new Date(h.date);
            return date.getDay() === index;
          });
          return {
            day,
            completed: acc.completed + todayHistory.filter((h) => h.completed).length,
            total: acc.total + todayHistory.length,
          };
        },
        { day, completed: 0, total: 0 }
      );
    return dayData;
  });

  // Get monthly data
  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    return {
      date: dateStr,
      completed: habits
        .filter((habit) => selectedHabit === 'all' || habit.id === selectedHabit)
        .reduce((acc, habit) => {
          const dayHistory = habit.history.find((h) => h.date === dateStr);
          return acc + (dayHistory?.completed ? 1 : 0);
        }, 0),
    };
  }).reverse();

  // Get category stats for pie chart
  const categoryStats = getCategoryStats();
  const pieData = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
  
  // Get longest streak
  const longestStreak = habits
    .filter((habit) => selectedHabit === 'all' || habit.id === selectedHabit)
    .reduce((max, habit) => Math.max(max, habit.streak), 0);

  // Get completion time stats (mock data - would be real data in a full implementation)
  const timeData = [
    { name: 'Morning', value: 65 },
    { name: 'Afternoon', value: 45 },
    { name: 'Evening', value: 80 },
    { name: 'Night', value: 30 },
  ];

  // Get habit comparison data for radar chart
  const habitComparisonData = habits.slice(0, 5).map(habit => {
    const completionRate = habit.history.length > 0 
      ? habit.history.filter(h => h.completed).length / habit.history.length * 100 
      : 0;
    
    return {
      habit: habit.name,
      completionRate: Math.round(completionRate),
      streak: habit.streak,
      consistency: Math.round(Math.random() * 100), // Mock data
    };
  });
  
  // Handle widget resize
  const handleWidgetResize = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    ));
  };

  const selectedHabitObj = selectedHabit !== 'all' 
    ? habits.find(h => h.id === selectedHabit)
    : undefined;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="btn-secondary p-2">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <select
          value={selectedHabit}
          onChange={(e) => setSelectedHabit(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Habits</option>
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.icon} {habit.name}
            </option>
          ))}
        </select>
      </header>

      {/* Chart type tabs */}
      <div className="flex flex-wrap border-b mb-6 overflow-x-auto">
        <button
          className={`tab ${activeChart === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveChart('overview')}
        >
          <FaChartBar className="mr-2" /> Overview
        </button>
        {selectedHabit !== 'all' && (
          <button
            className={`tab ${activeChart === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveChart('analysis')}
          >
            <FaList className="mr-2" /> Analysis
          </button>
        )}
        <button
          className={`tab ${activeChart === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveChart('categories')}
        >
          <FaChartPie className="mr-2" /> Categories
        </button>
        <button
          className={`tab ${activeChart === 'streak' ? 'active' : ''}`}
          onClick={() => setActiveChart('streak')}
        >
          <FaChartLine className="mr-2" /> Streak
        </button>
        <button
          className={`tab ${activeChart === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveChart('calendar')}
        >
          <FaCalendarAlt className="mr-2" /> Calendar
        </button>
        <button
          className={`tab ${activeChart === 'time' ? 'active' : ''}`}
          onClick={() => setActiveChart('time')}
        >
          <FaChartLine className="mr-2" /> Time Analysis
        </button>
      </div>

      {/* If analysis is selected and we have a specific habit */}
      {activeChart === 'analysis' && selectedHabitObj && (
        <HabitAnalysis habit={selectedHabitObj} />
      )}

      {/* Dashboard widgets for other chart types */}
      {activeChart !== 'analysis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Widget 1: Weekly Progress */}
          <HabitWidget
            title="Weekly Progress"
            size="large"
            color={selectedHabitObj?.color}
            onResize={(size) => handleWidgetResize('1', size)}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    name="Completed"
                    dataKey="completed"
                    fill={selectedHabitObj?.color || "#3B82F6"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </HabitWidget>

          {/* Widget 2: Habit Categories */}
          <HabitWidget
            title="Habit Categories"
            size="medium"
            onResize={(size) => handleWidgetResize('2', size)}
          >
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </HabitWidget>

          {/* Widget 3: Streak */}
          <HabitWidget
            title="Longest Streak"
            size="small"
            onResize={(size) => handleWidgetResize('3', size)}
          >
            <div className="flex flex-col items-center justify-center h-40">
              <span className="text-4xl mb-2">🏆</span>
              <span className="text-4xl font-bold text-primary-light dark:text-primary-dark">
                {longestStreak}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">days</span>
            </div>
          </HabitWidget>

          {/* Widget 4: HabitKit-style Calendar */}
          {selectedHabitObj && (
            <HabitWidget
              title={`Calendar: ${selectedHabitObj.name}`}
              size="large"
              color={selectedHabitObj.color}
              onResize={(size) => handleWidgetResize('4', size)}
            >
              <HabitCalendar habit={selectedHabitObj} year={new Date().getFullYear()} color={selectedHabitObj.color} />
            </HabitWidget>
          )}

          {/* Widget 5: Time Analysis */}
          <HabitWidget
            title="Completion Time"
            size="medium"
          >
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="80%"
                  data={timeData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    dataKey="value"
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RadialBar>
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </HabitWidget>

          {/* Widget 6: Habit Comparison */}
          <HabitWidget
            title="Habit Comparison"
            size="medium"
          >
            {habitComparisonData.length > 0 ? (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={habitComparisonData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="habit" />
                    <PolarRadiusAxis />
                    <Radar name="Completion Rate" dataKey="completionRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Streak" dataKey="streak" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <p>Add more habits to see comparisons</p>
              </div>
            )}
          </HabitWidget>

          {/* Month Calendar Widget (for specific habit) */}
          {selectedHabitObj && activeChart === 'calendar' && (
            <HabitWidget
              title="Monthly View"
              size="medium"
              color={selectedHabitObj.color}
            >
              <MonthlyCalendarView 
                habit={selectedHabitObj}
                month={new Date().getMonth()}
                year={new Date().getFullYear()}
              />
            </HabitWidget>
          )}
        </div>
      )}

      {/* Add Widget Button */}
      <button className="fixed bottom-20 right-6 btn-primary rounded-full p-4 shadow-lg">
        <FaPlus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Analytics; 